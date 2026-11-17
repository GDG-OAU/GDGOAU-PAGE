/* Rounded polygon: every point is [x, y, radius]. Points run clockwise. */
export function roundedPath(points) {
  const n = points.length;
  let d = "";
  for (let i = 0; i < n; i += 1) {
    const [x0, y0] = points[(i + n - 1) % n];
    const [x, y, r] = points[i];
    const [x1, y1] = points[(i + 1) % n];
    const toward = (ax, ay) => {
      const dx = ax - x;
      const dy = ay - y;
      const len = Math.hypot(dx, dy);
      return [x + (dx / len) * r, y + (dy / len) * r];
    };
    const [ax, ay] = toward(x0, y0);
    const [bx, by] = toward(x1, y1);
    const cross = (x - x0) * (y1 - y) - (y - y0) * (x1 - x);
    d += `${i ? "L" : "M"}${ax.toFixed(1)} ${ay.toFixed(1)}A${r} ${r} 0 0 ${cross > 0 ? 1 : 0} ${bx.toFixed(1)} ${by.toFixed(1)}`;
  }
  return `${d}Z`;
}
