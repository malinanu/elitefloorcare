import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number; color?: string; sw?: number };

function Svg({ size = 24, color = "currentColor", sw = 2, children, ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} aria-hidden="true" focusable="false" {...rest}>
      {children}
    </svg>
  );
}

export const Tick = (p: P) => (
  <Svg sw={3} {...p}>
    <path d="M4 12.5l5 5L20 6.5" />
  </Svg>
);
export const Cross = (p: P) => (
  <Svg sw={3} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);
export const Arrow = (p: P) => (
  <Svg sw={2.2} {...p}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </Svg>
);
export const Clock = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </Svg>
);
export const Pin = (p: P) => (
  <Svg {...p}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Svg>
);
export const Court = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M12 5v14" />
    <circle cx="12" cy="12" r="2.5" />
  </Svg>
);
export const Calendar = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="17" rx="3" />
    <path d="M3 10h18M8 2v4M16 2v4" />
  </Svg>
);
export const Chevron = (p: P) => (
  <Svg sw={3} {...p}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);
export const Menu = (p: P) => (
  <Svg {...p}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </Svg>
);
export const CheckCircle = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M7.5 12.5l3 3 6-6.5" />
  </Svg>
);

/** Renders trusted, static path markup from content files. */
export function RawIcon({ paths, size = 26, color = "#438AD4", sw = 1.5 }: { paths: string; size?: number; color?: string; sw?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={sw}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: paths }}
    />
  );
}

/** SVG path sets for the icon names editors pick in the CMS (cms/shared.ts → iconOptions). */
const ICONS: Record<string, string> = {
  shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  roller: '<rect x="4" y="4" width="14" height="6" rx="2"/><path d="M18 7h2v5h-8v3"/><rect x="10.5" y="15" width="3" height="6" rx="1"/>',
  sparkle: '<path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6z"/><path d="M18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9z"/>',
  court: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M12 5v14"/><circle cx="12" cy="12" r="2.5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  plus: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/>',
  star: '<path d="M12 3l2.2 5.6L20 9.3l-4.4 3.9L17 19l-5-3-5 3 1.4-5.8L4 9.3l5.8-.7z"/>',
  trend: '<path d="M4 7l6 6 4-4 6 6"/><path d="M20 10v5h-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  calendar: '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 10h18M8 2v4M16 2v4"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  house: '<path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6"/>',
  bucket: '<path d="M7 3v8h10V3M9 11v10M15 11v10M5 21h14"/>',
  grid: '<rect height="14" width="18" x="3" y="5"/><path d="M3 12h18M12 5v14"/>',
  magnifier: '<circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/>',
  roller2: '<path d="M4 18h16M4 14h16M7 10l3-6 3 6"/><path d="M14 10h6V4h-6z"/>',
};

/** The original design used a lighter, squarer icon on cross-sell tiles than on the homepage cards. */
const CROSS_SELL: Record<string, string> = { shield: "house", roller: "roller2", sparkle: "bucket", court: "grid", search: "magnifier" };

export function KeyIcon({ name, size = 24, color = "#438AD4", sw = 1.8, variant }: { name: string; size?: number; color?: string; sw?: number; variant?: "crossSell" }) {
  const key = variant === "crossSell" ? (CROSS_SELL[name] ?? name) : name;
  return <RawIcon paths={ICONS[key] ?? ICONS.court} size={size} color={color} sw={sw} />;
}
