"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Interactive wear-layer depth model (ported from recoat-depth.html).
 * three.js is code-split and only loaded on wide screens once the panel scrolls near the viewport;
 * phones and no-WebGL browsers get the static photo.
 */
export default function RecoatDepth({ title, fallbackSrc, fallbackAlt }: { title: string; fallbackSrc: string; fallbackAlt: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [counts, setCounts] = useState({ sands: 0, recoats: 0 });
  const api = useRef<{ recoat: () => void; sand: () => void; reset: () => void } | null>(null);
  const STEPS = 6;

  useEffect(() => {
    const wide = matchMedia("(min-width: 761px)");
    const el = host.current;
    if (!el || !wide.matches) return;
    try {
      const c = document.createElement("canvas");
      if (!(c.getContext("webgl2") || c.getContext("webgl"))) return;
    } catch {
      return;
    }

    let dispose: (() => void) | undefined;
    let cancelled = false;
    const io = new IntersectionObserver(
      async ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const mod = await import("./recoatDepthScene");
        if (cancelled || !host.current) return;
        setLive(true);
        const scene = mod.mountScene(host.current, setCounts, STEPS);
        api.current = scene;
        dispose = scene.dispose;
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      dispose?.();
    };
  }, []);

  return (
    <div className="rd" role="group" aria-label={title}>
      {!live && <Image className="rd-static" src={fallbackSrc} alt={fallbackAlt} fill sizes="(max-width: 760px) 100vw, 600px" />}
      <div ref={host} className="rd-stage" aria-hidden={!live} />
      {live && (
        <>
          <div className="rd-readout" aria-live="polite">
            <div>
              <span className="k">Sands used</span>
              <span className={`v${counts.sands >= STEPS ? " warn" : ""}`}>
                {counts.sands} / {STEPS}
              </span>
            </div>
            <div>
              <span className="k">Recoats done</span>
              <span className="v">{counts.recoats}</span>
            </div>
          </div>
          <div className="rd-ctrls">
            <button type="button" className="efc-cta" onClick={() => api.current?.recoat()}>
              + Recoat
            </button>
            <button type="button" className="efc-outline-dark" disabled={counts.sands >= STEPS} onClick={() => api.current?.sand()}>
              {counts.sands >= STEPS ? "No sand left" : "− Full sand"}
            </button>
            <button type="button" className="rd-reset" onClick={() => api.current?.reset()}>
              Reset
            </button>
          </div>
          <div className="rd-note">Illustrative · not to scale</div>
        </>
      )}
    </div>
  );
}
