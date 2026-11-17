"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Gentle scroll-in motion for every element with class "rv".
 * Content stays visible if this never runs (no JS, reduced motion, no IntersectionObserver):
 * elements are only hidden once <html> has the "js" class and the element has data-reveal.
 */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("js");

    const timers: number[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        let n = 0;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          const d = Math.min(n++ * 90, 450);
          el.style.setProperty("--d", `${d}ms`);
          el.classList.add("in");
          io.unobserve(el);
          timers.push(
            window.setTimeout(() => {
              el.removeAttribute("data-reveal");
              el.classList.remove("in");
              el.style.removeProperty("--d");
            }, d + 800),
          );
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const els = document.querySelectorAll<HTMLElement>(".rv:not([data-revealed])");
    els.forEach((el) => {
      el.setAttribute("data-revealed", "");
      el.setAttribute("data-reveal", "");
      io.observe(el);
    });

    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
      // anything still waiting must not stay hidden after unmount/navigation;
      // un-mark it so a re-run (or StrictMode's double effect) can observe it again
      document.querySelectorAll("[data-reveal]").forEach((el) => {
        el.removeAttribute("data-reveal");
        el.removeAttribute("data-revealed");
        el.classList.remove("in");
      });
    };
  }, [pathname]);

  return null;
}
