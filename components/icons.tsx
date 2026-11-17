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
