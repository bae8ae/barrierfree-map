import type { CSSProperties } from 'react';

// 도메인 전용 아이콘 (명확한 픽토그램). 색상만이 아니라 형태로도 구분되게 설계.
export type IconKey =
  | 'elevator'
  | 'toilet'
  | 'ramp'
  | 'construction'
  | 'step'
  | 'tactile'
  | 'warning'
  | 'dog'
  | 'slope'
  | 'water'
  | 'subway'
  | 'bus'
  | 'building'
  | 'restaurant'
  | 'cafe'
  | 'hospital'
  | 'culture'
  | 'route';

type Props = {
  name: IconKey;
  size?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
};

export function Icon({ name, size = 20, className, style, title }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    style,
    role: title ? ('img' as const) : undefined,
    'aria-hidden': title ? undefined : true,
  };

  return (
    <svg {...common}>
      {title ? <title>{title}</title> : null}
      {glyph(name)}
    </svg>
  );
}

function glyph(name: IconKey) {
  switch (name) {
    case 'elevator':
      return (
        <>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M12 3v18" />
          <path d="M8 9l1.5-2L11 9" />
          <path d="M13 15l1.5 2L16 15" />
        </>
      );
    case 'toilet':
      return (
        <>
          <circle cx="9" cy="5.5" r="1.8" />
          <path d="M7 21v-5H5.5L7.5 10a1.6 1.6 0 0 1 3 0L12.5 16H11v5" />
          <path d="M16 4v16M16 4h2.5a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5H16" />
        </>
      );
    case 'ramp':
      return (
        <>
          <path d="M3 19h18" />
          <path d="M3 19L19 7" />
          <circle cx="8.5" cy="13" r="1.6" />
        </>
      );
    case 'construction':
      return (
        <>
          <path d="M3 20h18" />
          <path d="M5 20v-7l7-3 7 3v7" />
          <path d="M9 20v-4h6v4" />
          <path d="M12 4v3" />
        </>
      );
    case 'step':
      return (
        <>
          <path d="M3 19h4v-4h4v-4h4v-4h6" />
        </>
      );
    case 'tactile':
      return (
        <>
          <circle cx="7" cy="7" r="1.3" />
          <circle cx="12" cy="7" r="1.3" />
          <circle cx="17" cy="7" r="1.3" />
          <circle cx="7" cy="12" r="1.3" />
          <circle cx="12" cy="12" r="1.3" />
          <circle cx="17" cy="12" r="1.3" />
          <circle cx="7" cy="17" r="1.3" />
          <circle cx="12" cy="17" r="1.3" />
          <circle cx="17" cy="17" r="1.3" />
        </>
      );
    case 'warning':
      return (
        <>
          <path d="M12 3L2 20h20L12 3z" />
          <path d="M12 10v4" />
          <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
        </>
      );
    case 'dog':
      return (
        <>
          <path d="M10 5l-3 2v3l-2 2 2 1v5h3v-3h3v3h3v-7l2-2-3-1V6l-3 1-2-2z" />
          <circle cx="9" cy="9" r="0.6" fill="currentColor" stroke="none" />
        </>
      );
    case 'slope':
      return (
        <>
          <path d="M3 18h18" />
          <path d="M4 18C8 18 14 14 20 6" />
          <path d="M20 6v4M20 6h-4" />
        </>
      );
    case 'water':
      return (
        <>
          <path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z" />
        </>
      );
    case 'subway':
      return (
        <>
          <rect x="5" y="3" width="14" height="13" rx="3" />
          <path d="M5 11h14" />
          <circle cx="9" cy="13.5" r="0.7" fill="currentColor" stroke="none" />
          <circle cx="15" cy="13.5" r="0.7" fill="currentColor" stroke="none" />
          <path d="M8 19l-2 2M16 19l2 2" />
        </>
      );
    case 'bus':
      return (
        <>
          <rect x="4" y="4" width="16" height="12" rx="2" />
          <path d="M4 11h16" />
          <circle cx="8" cy="19" r="1.4" />
          <circle cx="16" cy="19" r="1.4" />
        </>
      );
    case 'building':
      return (
        <>
          <rect x="5" y="3" width="14" height="18" rx="1.5" />
          <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
        </>
      );
    case 'restaurant':
      return (
        <>
          <path d="M6 3v8a2 2 0 0 0 4 0V3M8 11v10" />
          <path d="M16 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4 2.5-1 2.5-4-1-5-2.5-5zM16 16v5" />
        </>
      );
    case 'cafe':
      return (
        <>
          <path d="M5 8h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8z" />
          <path d="M16 9h2.5a2 2 0 0 1 0 4H16" />
          <path d="M8 3v2M11 3v2" />
        </>
      );
    case 'hospital':
      return (
        <>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M12 8v8M8 12h8" />
        </>
      );
    case 'culture':
      return (
        <>
          <path d="M3 9l9-5 9 5" />
          <path d="M5 9v9M9 9v9M15 9v9M19 9v9" />
          <path d="M3 21h18" />
        </>
      );
    case 'route':
      return (
        <>
          <circle cx="6" cy="18" r="2.2" />
          <circle cx="18" cy="6" r="2.2" />
          <path d="M8 16c2-1 3-2 3-5s3-4 5-4" strokeDasharray="0.1 3" />
        </>
      );
    default:
      return null;
  }
}
