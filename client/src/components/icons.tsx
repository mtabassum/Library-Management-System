// Small inline icons shared across screens. Size is set by CSS on the parent.
const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.9 } as const;

export const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" {...s}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);
export const SearchIcon = () => (
  <svg viewBox="0 0 24 24" {...s}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);
export const IssueIcon = () => (
  <svg viewBox="0 0 24 24" {...s}>
    <path d="M5 4h11a2 2 0 0 1 2 2v14l-6-3-6 3V6a2 2 0 0 1 2-2Z" />
  </svg>
);
export const ReturnIcon = () => (
  <svg viewBox="0 0 24 24" {...s}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h11a5 5 0 0 1 5 5v2" />
  </svg>
);
export const MembersIcon = () => (
  <svg viewBox="0 0 24 24" {...s}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6" />
    <path d="M18 19a5.5 5.5 0 0 0-2.5-4.6" />
  </svg>
);
export const BooksIcon = () => (
  <svg viewBox="0 0 24 24" {...s}>
    <path d="M4 5.5A2 2 0 0 1 6 4h12a2 2 0 0 1 2 2v13H6a2 2 0 0 0-2 1V5.5Z" />
  </svg>
);
export const CheckIcon = () => (
  <svg viewBox="0 0 24 24" {...s}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
export const ClockIcon = () => (
  <svg viewBox="0 0 24 24" {...s}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l2.5 1.5" />
  </svg>
);
