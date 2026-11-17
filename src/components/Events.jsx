import { useEffect, useState } from "react";
import "../events.css";
import { loadEvents } from "../lib/eventsCache";
import star from "../assets/figma/star.svg";
import arrowPaper from "../assets/figma/arrow-paper.svg";

const TINTS = ["#ffe7a5", "#ccf6c5", "#c3ecf6"];

const toDate = (raw) => (/^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00`) : new Date(raw));

function parts(date) {
  if (!date?.start) return null;
  const d = toDate(date.start);
  if (Number.isNaN(d.getTime())) return null;
  const hasTime = date.start.includes("T");
  return {
    day: d.getDate(),
    month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(d).toUpperCase(),
    weekday: new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(d),
    time: hasTime ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(d) : "",
    ms: d.getTime(),
  };
}

/* Upcoming events first (soonest first); if there are none, show the latest past ones instead. */
function pick(events) {
  const now = Date.now() - 24 * 3600 * 1000;
  const list = events
    .filter((e) => e.title && String(e.status).toLowerCase() !== "draft" && String(e.status).toLowerCase() !== "cancelled")
    .map((e) => ({ ...e, when: parts(e.date) }));
  const upcoming = list.filter((e) => e.when && e.when.ms >= now).sort((a, b) => a.when.ms - b.when.ms);
  if (upcoming.length) return { items: upcoming.slice(0, 3), upcoming: true };
  const past = list.filter((e) => e.when).sort((a, b) => b.when.ms - a.when.ms);
  return { items: past.slice(0, 3), upcoming: false };
}

export default function Events() {
  const [state, setState] = useState({ status: "loading", items: [], upcoming: true });

  useEffect(() => {
    let alive = true;
    (async () => {
      let shown = false;
      try {
        await loadEvents((events) => {
          if (!alive) return;
          const { items, upcoming } = pick(events);
          shown = true;
          setState({ status: "ready", items, upcoming });
        });
      } catch {
        if (alive && !shown) setState({ status: "error", items: [], upcoming: true });
      }
    })();
    return () => { alive = false; };
  }, []);

  const { status, items, upcoming } = state;

  return (
    <section className="ev" aria-labelledby="ev-title">
      <div className="ev-inner">
        <header className="ev-head">
          <div>
            <p className="ev-eyebrow">Events</p>
            <h2 id="ev-title">{upcoming ? "Come to the next one." : "What we ran lately."}</h2>
          </div>
          <img className="ev-star" src={star} alt="" />
        </header>

        {status === "loading" && (
          <ul className="ev-grid" aria-busy="true" aria-label="Loading events">
            {[0, 1, 2].map((i) => <li key={i} className="ev-card ev-skeleton" />)}
          </ul>
        )}

        {status === "error" && (
          <p className="ev-note">We could not load the events just now. The full calendar has everything.</p>
        )}

        {status === "ready" && items.length === 0 && (
          <p className="ev-note">No events are listed right now. Check the calendar again soon.</p>
        )}

        {status === "ready" && items.length > 0 && (
          <ul className="ev-grid">
            {items.map((e, i) => (
              <li key={e.id} className="ev-card" style={{ "--tint": TINTS[i % 3] }}>
                <div className="ev-media">
                  {e.flyerUrl ? (
                    <img src={e.flyerUrl} alt={`${e.title} flyer`} loading="lazy" />
                  ) : (
                    <span className="ev-media-fallback">GDG on Campus OAU</span>
                  )}
                  <span className="ev-date" aria-hidden="true"><b>{e.when.day}</b>{e.when.month}</span>
                </div>
                <div className="ev-body">
                  <h3>{e.title}</h3>
                  <p className="ev-meta">
                    {e.when.weekday}{e.when.time ? ` · ${e.when.time}` : ""}
                    {e.venue ? ` · ${e.venue}` : ""}
                  </p>
                  {e.teams?.length > 0 && (
                    <p className="ev-teams">{e.teams.slice(0, 3).map((t) => <span key={t.id || t.name}>{t.name}</span>)}</p>
                  )}
                  <a className="ev-more" href="/calendar">Details<span aria-hidden="true"> →</span><span className="sr-only"> for {e.title}</span></a>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="ev-foot">
          <img src={arrowPaper} alt="" />
          <a className="ev-button" href="/calendar">Open the full calendar</a>
        </div>
      </div>
    </section>
  );
}
