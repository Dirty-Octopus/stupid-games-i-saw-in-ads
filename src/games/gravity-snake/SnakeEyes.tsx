/** Separate eye layer in local tile coordinates. The body texture contains no face. */
export function SnakeEyes({ angle = 0 }: { angle?: number }) {
  return <g transform={`rotate(${angle} 0.5 0.5)`} aria-hidden="true">
    {[0.27, 0.73].map((y) => <g key={y}>
      <ellipse cx="0.67" cy={y + 0.025} rx="0.18" ry="0.19" fill="#2e511d" opacity="0.3" />
      <ellipse cx="0.66" cy={y} rx="0.16" ry="0.175" fill="#fbf7df" stroke="#668547" strokeWidth="0.022" />
      <ellipse cx="0.715" cy={y} rx="0.078" ry="0.105" fill="#24332a" />
      <circle cx="0.735" cy={y - 0.043} r="0.029" fill="#fff" />
    </g>)}
  </g>;
}
