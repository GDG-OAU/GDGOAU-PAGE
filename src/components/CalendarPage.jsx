import { useEffect, useMemo, useState } from "react";
import "../pages.css";
import Header from "./Header";
import { loadEvents as loadCachedEvents } from "../lib/eventsCache";
import Dropdown from "./Dropdown";
import arches from "../assets/figma/arches.svg";
import star from "../assets/figma/star.svg";
import arrowPaper from "../assets/figma/arrow-paper.svg";
import {
  NOTION_CALENDAR_PUBLIC_URL,
  WHATSAPP_CHANNEL_URL,
} from "../constants/site";
import { communities } from "../data/communities";
import {
  AlertCircleIcon,
  ArrowUpRight01Icon,
  Calendar03Icon,
  Clock01Icon,
  Location01Icon,
  Search01Icon,
  UserCircleIcon,
} from "hugeicons-react";

const TINTS = ["#ffe7a5", "#ccf6c5", "#c3ecf6", "#f8d8d8"];

const STATUS_META = {
  Upcoming: {
    label: "Upcoming",
    className: "status-upcoming",
  },
  Completed: {
    label: "Completed",
    className: "status-completed",
  },
  Planning: {
    label: "Planning",
    className: "status-planning",
  },
  Cancelled: {
    label: "Cancelled",
    className: "status-cancelled",
  },
  "In-Progress": {
    label: "In-Progress",
    className: "status-upcoming",
  },
};

function hasTimeComponent(dateStr) {
  return Boolean(dateStr && dateStr.includes("T"));
}

function formatEventDate(dateObj) {
  if (!dateObj?.start) return "Date TBA";

  const startRaw = dateObj.start;
  const endRaw = dateObj.end;

  const startDate = /^\d{4}-\d{2}-\d{2}$/.test(startRaw)
    ? new Date(`${startRaw}T00:00:00`)
    : new Date(startRaw);

  if (Number.isNaN(startDate.getTime())) return startRaw;

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  let formatted = dateFormatter.format(startDate);
  if (hasTimeComponent(startRaw)) {
    formatted += ` · ${timeFormatter.format(startDate)}`;
  }

  if (endRaw) {
    const endDate = /^\d{4}-\d{2}-\d{2}$/.test(endRaw)
      ? new Date(`${endRaw}T00:00:00`)
      : new Date(endRaw);

    if (!Number.isNaN(endDate.getTime())) {
      const sameDay =
        startDate.getFullYear() === endDate.getFullYear() &&
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getDate() === endDate.getDate();

      if (sameDay && hasTimeComponent(endRaw)) {
        formatted += ` – ${timeFormatter.format(endDate)}`;
      } else if (!sameDay) {
        formatted += ` – ${dateFormatter.format(endDate)}`;
      }
    }
  }

  return formatted;
}

function findCommunityFallbackLink(teams = []) {
  for (const team of teams) {
    const teamName = (team?.name || "").toLowerCase();
    const match = communities.find((c) => {
      const cName = c.name.toLowerCase();
      return (
        cName === teamName ||
        cName.includes(teamName) ||
        teamName.includes(cName)
      );
    });
    if (match?.groupLink) {
      return match.groupLink;
    }
  }
  return null;
}

function resolveActionUrl(event) {
  if (event.link) return event.link;
  return findCommunityFallbackLink(event.teams);
}

function getShortDescription(text = "", maxLength = 185) {
  const cleaned = String(text || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "Details and agenda for this session will be shared soon.";
  }

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  const sliced = cleaned.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).replace(/[.,;:!?-]+$/, "")}…`;
}

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("upcoming"); // "upcoming" | "completed" | "all"
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadEvents = async () => {
    setLoading(true);
    setError("");
    const prepare = (list) =>
      list
        .filter((item) => Boolean(item?.title) && String(item?.status || "").toLowerCase() !== "draft")
        .sort((x, y) => {
          const xs = x.date?.start ? new Date(x.date.start).getTime() : Number.POSITIVE_INFINITY;
          const ys = y.date?.start ? new Date(y.date.start).getTime() : Number.POSITIVE_INFINITY;
          return xs - ys;
        });
    let shown = false;
    try {
      await loadCachedEvents((list) => {
        shown = true;
        setEvents(prepare(list));
        setLoading(false);
      });
    } catch (err) {
      if (!shown) setError(err?.message || "Could not load community events from Notion right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const availableTeams = useMemo(() => {
    const set = new Set();
    events.forEach((event) => {
      (event.teams || []).forEach((t) => {
        if (t?.name) set.add(t.name);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [events]);

  const counts = useMemo(() => {
    let upcoming = 0;
    let completed = 0;
    events.forEach((event) => {
      const st = String(event.status || "").toLowerCase();
      if (st === "upcoming" || st === "in-progress") upcoming += 1;
      else if (st === "completed") completed += 1;
    });
    return {
      upcoming,
      completed,
      all: events.length,
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const st = String(event.status || "").toLowerCase();
      if (statusFilter === "upcoming" && st !== "upcoming" && st !== "in-progress") {
        return false;
      }
      if (statusFilter === "completed" && st !== "completed") {
        return false;
      }

      if (selectedTeam !== "all") {
        const matchesTeam = (event.teams || []).some(
          (t) => t.name === selectedTeam
        );
        if (!matchesTeam) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const haystack = [
          event.title,
          event.description,
          event.venue,
          event.host,
          event.status,
          ...(event.teams || []).map((t) => t.name),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [events, statusFilter, selectedTeam, searchQuery]);

  const tabs = [
    { key: "upcoming", label: "Upcoming", count: counts.upcoming },
    { key: "completed", label: "Completed", count: counts.completed },
    { key: "all", label: "All events", count: counts.all },
  ];

  return (
    <>
      <Header activePage="calendar" />
      <main className="pg">
        <section className="pg-hero" aria-labelledby="cal-title">
          <div className="pg-hero-inner">
            <p className="pg-eyebrow">GDG OAU 27’ schedule</p>
            <h1 id="cal-title" className="pg-title">
              <img className="pg-arches" src={arches} alt="" />
              <span>Events calendar.</span>
            </h1>
            <p className="pg-lead">
              Workshops, hackathons, study jams and community sessions, synced live from the GDG on Campus OAU Notion calendar.
            </p>
            <div className="cal-actions">
              <a className="cal-btn cal-btn-dark" href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
                Follow WhatsApp channel
              </a>
              <a className="cal-btn cal-btn-yellow" href={NOTION_CALENDAR_PUBLIC_URL} target="_blank" rel="noopener noreferrer">
                View Notion board <ArrowUpRight01Icon size={18} strokeWidth={2.2} aria-hidden="true" />
              </a>
            </div>
            <img className="pg-star" src={star} alt="" />
          </div>
        </section>

        <section className="cal-wrap">
          <div className="cal-controls" aria-label="Filter events">
            <div className="cal-tabs" role="tablist" aria-label="Event status filter">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === t.key}
                  className={`cal-tab${statusFilter === t.key ? " is-active" : ""}`}
                  onClick={() => setStatusFilter(t.key)}
                >
                  {t.label} <span>{t.count}</span>
                </button>
              ))}
            </div>

            <div className="cal-filters">
              <div className="cal-search">
                <Search01Icon size={18} strokeWidth={2} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search title, team, host or venue"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search events"
                />
              </div>
              <Dropdown
                id="team-filter"
                label="Filter by team"
                hideLabel
                value={selectedTeam}
                onChange={setSelectedTeam}
                options={[{ value: "all", label: "All teams and communities" }, ...availableTeams.map((n) => ({ value: n, label: n }))]}
              />
            </div>
          </div>

          {loading && (
            <ul className="cal-grid" aria-busy="true" aria-label="Loading events">
              {[0, 1, 2].map((i) => <li key={i} className="cal-card cal-skeleton" />)}
            </ul>
          )}

          {!loading && error && (
            <div className="cal-state" role="alert">
              <AlertCircleIcon size={32} strokeWidth={1.8} aria-hidden="true" />
              <h2>Unable to fetch live calendar events</h2>
              <p>{error}</p>
              <div className="cal-actions">
                <button type="button" className="cal-btn cal-btn-dark" onClick={loadEvents}>Try again</button>
                <a className="cal-btn cal-btn-yellow" href={NOTION_CALENDAR_PUBLIC_URL} target="_blank" rel="noopener noreferrer">Open public Notion calendar</a>
              </div>
            </div>
          )}

          {!loading && !error && filteredEvents.length === 0 && (
            <div className="cal-state">
              <Calendar03Icon size={32} strokeWidth={1.8} aria-hidden="true" />
              <h2>No {statusFilter !== "all" ? statusFilter : "matching"} events found</h2>
              <p>
                {statusFilter === "upcoming"
                  ? "There are no events marked as upcoming right now. You can browse completed or all events."
                  : "No events match your current filters. Try switching tabs or clearing your search."}
              </p>
              {events.length > 0 && (
                <div className="cal-actions">
                  {statusFilter !== "all" && (
                    <button type="button" className="cal-btn cal-btn-dark" onClick={() => setStatusFilter("all")}>
                      View all events ({counts.all})
                    </button>
                  )}
                  {(selectedTeam !== "all" || searchQuery) && (
                    <button type="button" className="cal-btn cal-btn-yellow" onClick={() => { setSelectedTeam("all"); setSearchQuery(""); }}>
                      Reset filters
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {!loading && !error && filteredEvents.length > 0 && (
            <ul className="cal-grid" aria-label="Community events">
              {filteredEvents.map((event, i) => {
                const isCancelled = event.status === "Cancelled";
                const statusMeta = STATUS_META[event.status] || { label: event.status || "Planning", className: "status-planning" };
                const actionUrl = resolveActionUrl(event);
                const shortDesc = getShortDescription(event.description, 168);

                return (
                  <li key={event.id} className={`cal-card${isCancelled ? " is-cancelled" : ""}`} style={{ "--tint": TINTS[i % 4] }}>
                    <div className="cal-media">
                      {event.flyerUrl ? (
                        <img src={event.flyerUrl} alt={`${event.title} flyer`} loading="lazy" />
                      ) : (
                        <span className="cal-media-fallback"><Calendar03Icon size={34} strokeWidth={1.6} aria-hidden="true" />GDG on Campus OAU</span>
                      )}
                      <span className={`cal-status ${statusMeta.className}`}>{statusMeta.label}</span>
                    </div>

                    <div className="cal-body">
                      <h2>{event.title}</h2>
                      <ul className="cal-meta" aria-label="Event details">
                        <li><Clock01Icon size={16} strokeWidth={2} aria-hidden="true" /><span>{formatEventDate(event.date)}</span></li>
                        {event.venue && <li><Location01Icon size={16} strokeWidth={2} aria-hidden="true" /><span>{event.venue}</span></li>}
                        {event.host && <li><UserCircleIcon size={16} strokeWidth={2} aria-hidden="true" /><span>{event.host}</span></li>}
                      </ul>

                      {event.teams?.length > 0 && (
                        <p className="cal-teams" aria-label="Associated teams">
                          {event.teams.map((t) => <span key={t.id || t.name}>{t.name}</span>)}
                        </p>
                      )}

                      <p className="cal-desc">{shortDesc}</p>

                      {isCancelled ? (
                        <span className="cal-join cal-join-off" aria-disabled="true">Cancelled</span>
                      ) : actionUrl ? (
                        <a className="cal-join" href={actionUrl} target="_blank" rel="noopener noreferrer">
                          Join <ArrowUpRight01Icon size={17} strokeWidth={2.2} aria-hidden="true" />
                          <span className="sr-only"> {event.title}</span>
                        </a>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <footer className="pg-foot">
          <div className="pg-foot-inner">
            <img src={arrowPaper} alt="" />
            <p>Built by GDG on Campus OAU.</p>
            <a href="/">Back to home</a>
          </div>
        </footer>
      </main>
    </>
  );
}
