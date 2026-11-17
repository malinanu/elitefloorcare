"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
    __efcTurnstileLoading?: Promise<void>;
  }
}

function loadScript() {
  if (window.turnstile) return Promise.resolve();
  window.__efcTurnstileLoading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile script failed"));
    document.head.appendChild(s);
  });
  return window.__efcTurnstileLoading;
}

/** Explicitly rendered Cloudflare Turnstile widget. Its hidden input (cf-turnstile-response) posts with the form. */
export default function Turnstile({ siteKey, resetSignal }: { siteKey: string; resetSignal: number }) {
  const el = useRef<HTMLDivElement>(null);
  const id = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !el.current || !window.turnstile) return;
        id.current = window.turnstile.render(el.current, { sitekey: siteKey, theme: "light", size: "flexible" });
      })
      .catch((e) => console.error(e));
    return () => {
      cancelled = true;
      if (id.current && window.turnstile) window.turnstile.remove(id.current);
      id.current = null;
    };
  }, [siteKey]);

  // a token is single-use: get a fresh one after every failed submit
  useEffect(() => {
    if (resetSignal > 0 && id.current && window.turnstile) window.turnstile.reset(id.current);
  }, [resetSignal]);

  return <div ref={el} />;
}
