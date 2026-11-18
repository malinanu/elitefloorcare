"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Chevron, Menu } from "./icons";

const links = [
  { href: "/gallery", label: "Our Work" },
  { href: "/about", label: "About" },
  { href: "/service-areas", label: "Where We Work" },
];

type NavService = { slug: string; navLabel: string };

export default function Header({ services, phone, phoneHref, siteName }: { services: NavService[]; phone: string; phoneHref: string; siteName: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);

  // close everything on navigation
  useEffect(() => {
    setMenuOpen(false);
    setDdOpen(false);
  }, [pathname]);

  // outside click closes the dropdown; Escape closes dropdown and menu
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDdOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDdOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const close = () => {
    setMenuOpen(false);
    setDdOpen(false);
  };
  const current = (href: string) => (pathname === href ? "page" : undefined);

  return (
    <header className="efc-header">
      <div className="efc-header-inner">
        <Link href="/" className="efc-logo" aria-label={`${siteName} home`}>
          <Image src="/assets/logo-dark-bg.png" alt="Elite Floor Care — Sports Floor Specialist" width={96} height={44} priority />
        </Link>
        <button
          type="button"
          className="efc-nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="efc-nav"
          aria-label="Toggle menu"
          onClick={() => {
            setMenuOpen((o) => !o);
            if (menuOpen) setDdOpen(false);
          }}
        >
          <Menu size={20} color="#FFFFFF" />
        </button>
        <nav id="efc-nav" className={`efc-nav${menuOpen ? " is-open" : ""}`} aria-label="Main">
          <Link href="/" className="efc-navlink" aria-current={current("/")} onClick={close}>
            Home
          </Link>
          <div className={`efc-dropdown${ddOpen ? " is-open" : ""}`} ref={ddRef}>
            <button
              type="button"
              className="efc-dropdown-toggle efc-navlink"
              aria-expanded={ddOpen}
              aria-controls="efc-services-menu"
              onClick={(e) => {
                e.stopPropagation();
                setDdOpen((o) => !o);
              }}
            >
              Services
              <Chevron size={10} className="efc-dropdown-chevron" />
            </button>
            <div className="efc-dropdown-menu" id="efc-services-menu">
              {services.map((s) => (
                <Link key={s.slug} href={`/services/${s.slug}`} aria-current={current(`/services/${s.slug}`)} onClick={close}>
                  {s.navLabel}
                </Link>
              ))}
            </div>
          </div>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="efc-navlink" aria-current={current(l.href)} onClick={close}>
              {l.label}
            </Link>
          ))}
          <a href={phoneHref} className="efc-nav-phone">
            {phone}
          </a>
          <Link href="/#contact" className="efc-cta efc-nav-cta" onClick={close}>
            Free Inspection
          </Link>
        </nav>
      </div>
    </header>
  );
}
