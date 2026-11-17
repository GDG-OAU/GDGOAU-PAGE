import { useLayoutEffect, useRef, useState } from "react";
import "../tracks.css";
import { communities } from "../data/communities";

const TINTS = ["#ffe7a5", "#ccf6c5", "#c3ecf6", "#f8d8d8"];
const PEGS = ["#ea4335", "#4285f4", "#34a853", "#f9ab00"];
const WOBBLE = [-1.6, 1.2, -0.6, 1.8, -1.2, 0.8];
const LINE_Y = 34; // where the line starts, in px from the top of the rail
const SAG = 110; // how far the middle of the line hangs below its ends

export default function Tracks() {
  const rail = useRef(null);
  const list = useRef(null);
  const [geo, setGeo] = useState({ w: 0, d: "", cards: [] });

  /* Cards are spaced down a parabola, then the line is drawn through the pegs' real positions
     (read back from the DOM), so every peg sits exactly on the line whatever the screen size. */
  useLayoutEffect(() => {
    const ul = list.current;
    if (!ul) return undefined;
    const measure = () => {
      const w = ul.scrollWidth;
      const lis = [...ul.children].filter((n) => n.tagName === "LI");
      const pts = lis.map((li) => {
        const x = li.offsetLeft + li.offsetWidth / 2;
        const u = (x / w) * 2 - 1;
        return { x, y: li.offsetTop, dy: SAG * (1 - u * u) };
      });
      const all = [{ x: 0, y: LINE_Y }, ...pts, { x: w, y: LINE_Y }];
      // Catmull-Rom through every point, converted to cubic Béziers
      let d = `M${all[0].x} ${all[0].y}`;
      for (let i = 0; i < all.length - 1; i += 1) {
        const p0 = all[Math.max(i - 1, 0)];
        const p1 = all[i];
        const p2 = all[i + 1];
        const p3 = all[Math.min(i + 2, all.length - 1)];
        d += ` C${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6} ${p2.x} ${p2.y}`;
      }
      const cards = pts.map((pt, i) => {
        const prev = all[i];
        const next = all[i + 2];
        return { dy: pt.dy, angle: (Math.atan2(next.y - prev.y, next.x - prev.x) * 180) / Math.PI };
      });
      setGeo({ w, d, cards });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ul);
    window.addEventListener("load", measure);
    document.fonts?.ready.then(measure);
    return () => { ro.disconnect(); window.removeEventListener("load", measure); };
  }, []);

  const nudge = (dir) => {
    const el = rail.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  };

  return (
    <section className="tracks" aria-labelledby="tracks-title">
      <div className="tracks-inner">
        <header className="tracks-head">
          <div>
            <p className="tracks-eyebrow">Communities</p>
            <h2 id="tracks-title">Pick a track. Find your people.</h2>
          </div>
          <p className="tracks-lead">
            Each community has its own WhatsApp group where members share resources, ask questions and plan sessions. Scroll through and join as many as you like.
          </p>
        </header>
      </div>

      <div className="tracks-rail" ref={rail} tabIndex={0} role="region" aria-label="Communities, scroll sideways">
        <ul className="tracks-line" ref={list}>
          {geo.w > 0 && (
            <svg className="line-full" width={geo.w} height={LINE_Y + SAG + 4} aria-hidden="true">
              <path d={geo.d} fill="none" stroke="#1e1e1e" strokeWidth="2" />
            </svg>
          )}
          {communities.map((c, i) => {
            const Icon = c.icon;
            return (
              <li
                key={c.id}
                className="peg-card"
                style={{
                  "--tint": TINTS[i % 4],
                  "--peg": PEGS[i % 4],
                  "--dy": `${LINE_Y + (geo.cards[i]?.dy || 0)}px`,
                  "--tilt": `${(geo.cards[i]?.angle || 0) + WOBBLE[i % WOBBLE.length]}deg`,
                  "--hang": `${geo.cards[i]?.angle || 0}deg`,
                }}
              >
                <span className="peg" aria-hidden="true"><i /></span>
                <article className="polaroid">
                  <div className="polaroid-pic"><Icon size={64} strokeWidth={1.5} aria-hidden="true" /></div>
                  <h3>{c.name}</h3>
                  <p>{c.description}</p>
                  <a href={c.groupLink} target="_blank" rel="noopener noreferrer">
                    Join the group<span aria-hidden="true"> →</span>
                    <span className="sr-only"> for {c.name}</span>
                  </a>
                </article>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="tracks-inner tracks-foot">
        <div className="tracks-arrows">
          <button type="button" onClick={() => nudge(-1)} aria-label="Scroll communities left">←</button>
          <button type="button" onClick={() => nudge(1)} aria-label="Scroll communities right">→</button>
        </div>
        <a className="tracks-button" href="/communities">See all communities</a>
      </div>
    </section>
  );
}
