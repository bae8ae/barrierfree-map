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
  | 'route'
  | 'smoking'
  | 'shield'
  | 'bell'
  | 'location'
  | 'phone'
  | 'wheelchair'
  | 'stroller'
  | 'elderly'
  | 'blind'
  | 'pregnant'
  | 'compass'
  | 'star'
  | 'help'
  | 'check'
  | 'flag'
  | 'eye'
  | 'edit'
  | 'award';

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
    case 'smoking':
      return (
        <>
          <rect x="3" y="13" width="14" height="4" rx="1" />
          <path d="M19 13v4M21.5 13v4" />
          <path d="M9 13v-2a2 2 0 0 1 2-2 2 2 0 0 0 2-2" />
        </>
      );
    case 'shield':
      return (
        <>
          <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </>
      );
    case 'bell':
      return (
        <>
          <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </>
      );
    case 'location':
      return (
        <>
          <path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" />
          <circle cx="12" cy="10" r="2.5" />
        </>
      );
    case 'phone':
      return (
        <>
          <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L17 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 1-2z" />
        </>
      );
    case 'wheelchair':
      return (
        <>
          <circle cx="9.5" cy="4" r="1.7" />
          <path d="M9.5 6.5v5h5l2.5 5" />
          <circle cx="9" cy="16" r="4.5" />
          <path d="M14.5 16.5h3.5" />
        </>
      );
    case 'stroller':
      return (
        <>
          <path d="M4 4h2l3 9h7" />
          <path d="M9 5.5a6 6 0 0 1 6 6H9z" />
          <circle cx="10" cy="18" r="1.7" />
          <circle cx="15" cy="18" r="1.7" />
        </>
      );
    case 'elderly':
      return (
        <>
          <circle cx="9" cy="4" r="1.8" />
          <path d="M9 6.5l-1 5 2 0.5-1 6" />
          <path d="M8 11.5l4 1" />
          <path d="M14.5 8v12" />
        </>
      );
    case 'blind':
      return (
        <>
          <circle cx="10" cy="4" r="1.8" />
          <path d="M10 6.5v6" />
          <path d="M10 12.5l-2 7M10 12.5l2 7" />
          <path d="M11 9l-4.5 11.5" />
        </>
      );
    case 'pregnant':
      return (
        <>
          <circle cx="10.5" cy="4" r="1.8" />
          <path d="M10.5 6.5c-1.2 1.5-1.5 3.5-1.5 5.5" />
          <path d="M9 9a3.5 3.5 0 0 1 0 6" />
          <path d="M9 15l-1 5M10.5 15.5l1 4.5" />
        </>
      );
    case 'compass':
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M15 9l-1.8 4.2-4.2 1.8 1.8-4.2z" />
        </>
      );
    case 'star':
      return (
        <>
          <path d="M12 3.5l2.6 5.3 5.9 0.8-4.3 4.1 1 5.8L12 16.8 6.8 19.5l1-5.8L3.5 9.6l5.9-0.8z" />
        </>
      );
    case 'help':
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.3 9.2a2.7 2.7 0 0 1 5.2 1c0 1.8-2.5 2-2.5 3.8" />
          <circle cx="12" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
        </>
      );
    case 'check':
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5l2.5 2.5 5-5.5" />
        </>
      );
    case 'flag':
      return (
        <>
          <path d="M6 3v18" />
          <path d="M6 4h11l-2 3 2 3H6" />
        </>
      );
    case 'eye':
      return (
        <>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
          <circle cx="12" cy="12" r="2.5" />
        </>
      );
    case 'edit':
      return (
        <>
          <path d="M4 20h16" />
          <path d="M14 4l4 4-9 9H5v-4z" />
        </>
      );
    case 'award':
      return (
        <>
          <circle cx="12" cy="9" r="5" />
          <path d="M9 13l-2 7 5-3 5 3-2-7" />
        </>
      );
    default:
      return null;
  }
}
