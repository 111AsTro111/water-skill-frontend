// Small, deliberate icon set — the app currently has zero icons anywhere,
// so this is the single highest-leverage distinctive touch: consistent,
// simple line icons used in the navbar brand, the Choose Section screen,
// and dashboard cards. Kept minimal (stroke-based, no fills) so they read
// as functional marks, not decoration.

export function DropletIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2.5c3.5 4.6 7 8.9 7 12.6a7 7 0 1 1-14 0c0-3.7 3.5-8 7-12.6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SwapIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 8h13m0 0-3.5-3.5M17 8l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 16H7m0 0 3.5-3.5M7 16l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
