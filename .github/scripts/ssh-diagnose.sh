#!/usr/bin/env bash
# Explain why the runner can't reach SSH_HOST:SSH_PORT without printing either value
# (GitHub masks secrets, so the log would otherwise show only ***).
# Prints categories and yes/no facts, then one verdict line as a workflow error.
set -uo pipefail
host=$1 port=$2

tcp() { timeout 6 bash -c "exec 3<>/dev/tcp/$1/$2" 2>/dev/null; }
yn() { if "$@"; then echo yes; else echo no; fi; }

runner_ip=$(curl -s --max-time 5 https://api.ipify.org || echo unknown)
echo "runner IP: $runner_ip"

# 1. what kind of value is SSH_HOST
if [[ "$host" =~ ^[0-9]+(\.[0-9]+){3}$ ]]; then
  kind="an IPv4 address"; addrs=$host
elif [[ "$host" == *:* ]]; then
  kind="an IPv6 address"; addrs=$host
else
  kind="a hostname"
  addrs=$(getent ahostsv4 "$host" 2>/dev/null | awk '{print $1}' | sort -u | tr '\n' ' ')
  v6=$(getent ahostsv6 "$host" 2>/dev/null | awk '{print $1}' | grep -c : || true)
fi
if [ "$kind" = "a hostname" ]; then echo "SSH_HOST is a hostname (resolves to $(wc -w <<<"$addrs") IPv4 / ${v6:-0} IPv6 address(es))"; else echo "SSH_HOST is $kind"; fi
[ -n "${addrs// /}" ] || { echo "::error::SSH_HOST does not resolve to any IPv4 address from GitHub. Use the server's public IP."; exit 1; }
first=$(awk '{print $1}' <<<"$addrs")

# 2. is that address Cloudflare's proxy (orange cloud)?
cf=no
# Cloudflare's published IPv4 ranges (https://www.cloudflare.com/ips-v4), used if the live list can't be fetched.
CF_FALLBACK="173.245.48.0/20 103.21.244.0/22 103.22.200.0/22 103.31.4.0/22 141.101.64.0/18 108.162.192.0/18 190.93.240.0/20 188.114.96.0/20 197.234.240.0/22 198.41.128.0/17 162.158.0.0/15 104.16.0.0/13 104.24.0.0/14 172.64.0.0/13 131.0.72.0/22"
ranges=$(curl -s -f --max-time 8 https://www.cloudflare.com/ips-v4 | grep -E '^[0-9.]+/[0-9]+$' || true)
[ -n "$ranges" ] || ranges=$(tr ' ' '\n' <<<"$CF_FALLBACK")
if [ -n "$ranges" ]; then
  cf=$(RANGES="$ranges" python3 -c '
import ipaddress, os, sys
ip = ipaddress.ip_address(sys.argv[1])
nets = [ipaddress.ip_network(l.strip()) for l in os.environ["RANGES"].splitlines() if l.strip()]
print("yes" if any(ip in n for n in nets) else "no")' "$first" 2>/dev/null || echo unknown)
fi
[ "$kind" = "a hostname" ] && echo "address is Cloudflare's proxy: $cf"
case "$(echo "$first" | cut -d. -f1)" in 10|127) echo "address is private/local: yes" ; private=yes ;; 172|192) private=maybe ;; *) private=no ;; esac

# 3. what SSH_PORT is
case "$port" in
  22) port_note="22 (standard SSH)";;
  3000|3001|8080|80|443) port_note="$port — that's a web/app port, not SSH";;
  8443) port_note="8443 — that's the CloudPanel panel port, not SSH";;
  *) port_note="$port (custom)";;
esac
echo "SSH_PORT is $port_note"

# 4. what answers from GitHub
p22=$(yn tcp "$first" 22); pport=$(yn tcp "$first" "$port"); p443=$(yn tcp "$first" 443)
echo "TCP from GitHub → port 22: $p22 · SSH_PORT: $pport · 443: $p443"

# 5. verdict
if [ "$cf" = yes ]; then
  v="SSH_HOST points at Cloudflare's proxy (orange cloud), which only carries web traffic. Set SSH_HOST to the server's public IP, or to a DNS-only (grey cloud) hostname."
elif [ "${private:-no}" = yes ]; then
  v="SSH_HOST points at a private/local address. Use the server's public IP."
elif [[ "$port_note" == *"not SSH"* ]]; then
  v="SSH_PORT is $port_note. Set SSH_PORT to the server's SSH port (usually 22)."
elif [ "$pport" = no ] && [ "$p22" = yes ]; then
  v="Port 22 is open but SSH_PORT ($port_note) is not. Set SSH_PORT to 22."
elif [ "$pport" = no ] && [ "$p443" = yes ]; then
  v="The server is up (443 answers) but the SSH port is closed to GitHub ($runner_ip). Open it in CloudPanel → Security → Firewall, the Oracle VCN security list / NSG, and the host firewall — for 0.0.0.0/0, not only your IP."
elif [ "$pport" = no ]; then
  v="Nothing answers at that address on SSH or 443 from GitHub ($runner_ip). The address is wrong or the server's firewall drops everything from outside."
else
  v="The SSH port answers TCP but no SSH key exchange happened. Check that SSH_PORT is really the SSH port."
fi
echo "::error::$v"
exit 1
