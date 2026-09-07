import type { SVGProps } from "react";

const paths = {
  left: "M4 5h16M4 10h10M4 15h16M4 20h10",
  center: "M4 5h16M7 10h10M4 15h16M7 20h10",
  right: "M4 5h16M10 10h10M4 15h16M10 20h10",
  top: "M4 4h16M7 8h10M7 12h10M7 16h10",
  middle: "M4 12h2m12 0h2M8 8h8M8 12h8M8 16h8",
  bottom: "M4 20h16M7 8h10M7 12h10M7 16h10",
  undo: "M9 5 4 10l5 5M4 10h10a6 6 0 0 1 0 12",
  redo: "m15 5 5 5-5 5m5-5H10a6 6 0 0 0 0 12",
  reset: "M4 4v6h6M4 10a8 8 0 1 1 0 5",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  upload: "M12 15V3M7 8l5-5 5 5M4 16v5h16v-5",
  up: "m6 14 6-6 6 6",
  down: "m6 10 6 6 6-6",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12m13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  check: "m5 12 4 4L19 6",
} as const;

export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: keyof typeof paths }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
