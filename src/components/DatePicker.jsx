import { useEffect, useId, useRef, useState } from "react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const pad = (n) => String(n).padStart(2, "0");
const toIso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parse = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? { y: +m[1], m: +m[2] - 1, d: +m[3] } : null;
};

/* Custom date picker (year + month steppers, day grid) that outputs yyyy-mm-dd like <input type="date">. */
export default function DatePicker({ id, label, value, onChange, max, placeholder = "Pick a date" }) {
  const sel = parse(value);
  const maxP = parse(max);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ y: sel?.y ?? 2005, m: sel?.m ?? 0 });
  const wrap = useRef(null);
  const gridRef = useRef(null);
  const gridId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") { setOpen(false); wrap.current?.querySelector(".dd-button")?.focus(); } };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const first = new Date(view.y, view.m, 1).getDay();
  const lead = (first + 6) % 7; // Monday first
  const count = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];

  const isFuture = (d) => maxP && (view.y > maxP.y || (view.y === maxP.y && (view.m > maxP.m || (view.m === maxP.m && d > maxP.d))));
  const step = (dm, dy = 0) => setView((v) => {
    let y = v.y + dy;
    let m = v.m + dm;
    if (m < 0) { m = 11; y -= 1; } else if (m > 11) { m = 0; y += 1; }
    if (maxP && (y > maxP.y || (y === maxP.y && m > maxP.m))) return v;
    return { y, m };
  });
  const pick = (d) => { onChange(toIso(view.y, view.m, d)); setOpen(false); wrap.current?.querySelector(".dd-button")?.focus(); };
  const onGridKey = (e) => {
    const btns = [...gridRef.current.querySelectorAll("button:not([disabled])")];
    const i = btns.indexOf(document.activeElement);
    const to = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[e.key];
    if (to !== undefined && i >= 0) { e.preventDefault(); btns[Math.max(0, Math.min(btns.length - 1, i + to))].focus(); }
  };

  const text = sel ? `${sel.d} ${MONTHS[sel.m]} ${sel.y}` : "";

  return (
    <div className="dd" ref={wrap}>
      <span id={`${id}-label`} className="dd-label">{label}</span>
      <button
        type="button" id={id} className="dd-button" aria-haspopup="dialog" aria-expanded={open} aria-controls={gridId}
        aria-labelledby={`${id}-label ${id}`}
        onClick={() => { if (!open && sel) setView({ y: sel.y, m: sel.m }); setOpen(!open); }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
        <span className={text ? "" : "dd-placeholder"}>{text || placeholder}</span>
        <svg className="dd-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </button>

      {open && (
        <div id={gridId} className="dp-panel" role="dialog" aria-label={`Choose ${label.toLowerCase()}`}>
          <div className="dp-bar">
            <button type="button" aria-label="Previous year" onClick={() => step(0, -1)}>«</button>
            <button type="button" aria-label="Previous month" onClick={() => step(-1)}>‹</button>
            <strong aria-live="polite">{MONTHS[view.m]} {view.y}</strong>
            <button type="button" aria-label="Next month" onClick={() => step(1)}>›</button>
            <button type="button" aria-label="Next year" onClick={() => step(0, 1)}>»</button>
          </div>
          <div className="dp-days" aria-hidden="true">{DAYS.map((d) => <span key={d}>{d}</span>)}</div>
          <div className="dp-grid" ref={gridRef} onKeyDown={onGridKey}>
            {cells.map((d, i) => d === null ? <span key={`b${i}`} /> : (
              <button
                key={d} type="button" disabled={isFuture(d)}
                className={sel && sel.y === view.y && sel.m === view.m && sel.d === d ? "is-selected" : ""}
                aria-pressed={!!(sel && sel.y === view.y && sel.m === view.m && sel.d === d)}
                aria-label={`${d} ${MONTHS[view.m]} ${view.y}`}
                onClick={() => pick(d)}
              >{d}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
