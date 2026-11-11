import { useEffect, useMemo, useState } from "react";
import Header from "./Header";
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
  FavouriteIcon,
  Location01Icon,
  Search01Icon,
  UserCircleIcon,
} from "hugeicons-react";

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
    try {
      const response = await fetch("/api/events", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          "Calendar API endpoint (/api/events) did not return JSON. Ensure Cloudflare Pages Functions are deployed."
        );
      }

      const payload = await response.json();
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "Unable to load events from Notion.");
      }

      const loadedEvents = (payload.events || [])
        .filter(
          (item) =>
            Boolean(item?.title) &&
            String(item?.status || "").toLowerCase() !== "draft"
        )
        .sort((a, b) => {
          const aStart = a.date?.start
            ? new Date(a.date.start).getTime()
            : Number.POSITIVE_INFINITY;
          const bStart = b.date?.start
            ? new Date(b.date.start).getTime()
            : Number.POSITIVE_INFINITY;
          return aStart - bStart;
        });

      setEvents(loadedEvents);
    } catch (err) {
      setError(
        err?.message ||
          "Could not load community events from Notion right now."
      );
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

  return (
    <>
      <Header activePage="calendar" />
      <main className="page-container">
        <section className="hero">
          <div className="eyebrow">
            <span className="green">●</span>
            GDG OAU 27’ SCHEDULE
          </div>
          <h1>
            Events <span>Calendar.</span>
          </h1>
          <p>
            Keep track of workshops, hackathons, study jams, and community
            sessions synced directly from the GDG on Campus OAU Notion calendar.
          </p>
          <div className="actions" style={{ marginTop: "24px" }}>
            <a
              className="button whatsapp-channel-button"
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Follow WhatsApp Channel
            </a>
            <a
              className="button x-button"
              href={NOTION_CALENDAR_PUBLIC_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              View Notion Board{" "}
              <ArrowUpRight01Icon size={16} strokeWidth={2} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="calendar-controls" aria-label="Filter events">
          <div className="calendar-tabs" role="tablist" aria-label="Event status filter">
            <button
              type="button"
              role="tab"
              aria-selected={statusFilter === "upcoming"}
              className={`calendar-tab ${statusFilter === "upcoming" ? "active" : ""}`}
              onClick={() => setStatusFilter("upcoming")}
            >
              Upcoming <span className="tab-badge">{counts.upcoming}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={statusFilter === "completed"}
              className={`calendar-tab ${statusFilter === "completed" ? "active" : ""}`}
              onClick={() => setStatusFilter("completed")}
            >
              Completed <span className="tab-badge">{counts.completed}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={statusFilter === "all"}
              className={`calendar-tab ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All Events <span className="tab-badge">{counts.all}</span>
            </button>
          </div>

          <div className="calendar-filters-right">
            <div className="calendar-search-wrapper">
              <Search01Icon
                size={16}
                strokeWidth={2}
                className="calendar-search-icon"
                aria-hidden="true"
              />
              <input
                type="search"
                className="calendar-search-input"
                placeholder="Search title, team, host, or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search events"
              />
            </div>

            <select
              className="calendar-team-select"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              aria-label="Filter by team"
            >
              <option value="all">All Teams & Communities</option>
              {availableTeams.map((teamName) => (
                <option key={teamName} value={teamName}>
                  {teamName}
                </option>
              ))}
            </select>
          </div>
        </section>

        {loading && (
          <section className="events-grid" aria-busy="true" aria-label="Loading events">
            {[1, 2, 3].map((item) => (
              <div className="event-card event-card-skeleton" key={item}>
                <div className="skeleton-banner" />
                <div className="skeleton-body">
                  <div className="skeleton-line title" />
                  <div className="skeleton-line short" />
                  <div className="skeleton-line" />
                </div>
              </div>
            ))}
          </section>
        )}

        {!loading && error && (
          <section className="calendar-state-card error" role="alert">
            <AlertCircleIcon size={28} strokeWidth={1.8} color="#EA4335" />
            <h2>Unable to fetch live calendar events</h2>
            <p>{error}</p>
            <div className="calendar-state-actions">
              <button
                type="button"
                className="button community"
                onClick={loadEvents}
              >
                Try Again
              </button>
              <a
                className="button x-button"
                href={NOTION_CALENDAR_PUBLIC_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Public Notion Calendar
              </a>
            </div>
          </section>
        )}

        {!loading && !error && filteredEvents.length === 0 && (
          <section className="calendar-state-card">
            <Calendar03Icon size={32} strokeWidth={1.8} color="#4285F4" />
            <h2>No {statusFilter !== "all" ? statusFilter : "matching"} events found</h2>
            <p>
              {statusFilter === "upcoming"
                ? "There are no events marked as Upcoming right now. You can browse Completed or All Events."
                : "No events match your current filters. Try switching tabs or clearing your search."}
            </p>
            {events.length > 0 && (
              <div className="calendar-state-actions">
                {statusFilter !== "all" && (
                  <button
                    type="button"
                    className="button community"
                    onClick={() => setStatusFilter("all")}
                  >
                    View All Events ({counts.all})
                  </button>
                )}
                {(selectedTeam !== "all" || searchQuery) && (
                  <button
                    type="button"
                    className="button x-button"
                    onClick={() => {
                      setSelectedTeam("all");
                      setSearchQuery("");
                    }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {!loading && !error && filteredEvents.length > 0 && (
          <section className="events-grid" aria-label="Community events">
            {filteredEvents.map((event) => {
              const isCancelled = event.status === "Cancelled";
              const statusMeta = STATUS_META[event.status] || {
                label: event.status || "Planning",
                className: "status-planning",
              };
              const actionUrl = resolveActionUrl(event);
              const shortDesc = getShortDescription(event.description, 168);

              return (
                <article
                  key={event.id}
                  className={`event-card ${isCancelled ? "is-cancelled" : ""}`}
                >
                  <div className="event-card-media">
                    {event.flyerUrl ? (
                      <img
                        src={event.flyerUrl}
                        alt={`${event.title} flyer`}
                        className="event-flyer-image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="event-flyer-placeholder">
                        <Calendar03Icon size={32} strokeWidth={1.6} color="#4285F4" />
                        <span>GDG on Campus OAU</span>
                      </div>
                    )}

                    <div className="event-badges-overlay">
                      <span className={`event-status-badge ${statusMeta.className}`}>
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>

                  <div className="event-card-content">
                    <h2 className="event-card-title">{event.title}</h2>

                    <ul className="event-meta-list" aria-label="Event details">
                      <li>
                        <Clock01Icon size={14} strokeWidth={2} aria-hidden="true" />
                        <span>{formatEventDate(event.date)}</span>
                      </li>
                      {event.venue && (
                        <li>
                          <Location01Icon size={14} strokeWidth={2} aria-hidden="true" />
                          <span>{event.venue}</span>
                        </li>
                      )}
                      {event.host && (
                        <li>
                          <UserCircleIcon size={14} strokeWidth={2} aria-hidden="true" />
                          <span>{event.host}</span>
                        </li>
                      )}
                    </ul>

                    {event.teams?.length > 0 && (
                      <div className="event-teams-row" aria-label="Associated teams">
                        {event.teams.map((team) => (
                          <span key={team.id || team.name} className="event-team-chip">
                            {team.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="event-description-outer">
                      <div className="event-description-wrap">
                        {isCancelled ? (
                          <span className="event-inline-cta-float">
                            <span
                              className="event-cancelled-pill event-inline-cta"
                              aria-disabled="true"
                            >
                              Cancelled
                            </span>
                          </span>
                        ) : actionUrl ? (
                          <span className="event-inline-cta-float">
                            <a
                              className="join-button event-inline-cta"
                              href={actionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Join
                              <ArrowUpRight01Icon
                                size={15}
                                strokeWidth={2.2}
                                aria-hidden="true"
                              />
                            </a>
                          </span>
                        ) : null}
                        <span className="event-description-text">{shortDesc}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <footer className="page-footer">
          <p>
            Built with{" "}
            <FavouriteIcon
              size={14}
              color="#EA4335"
              style={{
                display: "inline-block",
                verticalAlign: "-2px",
                margin: "0 2px",
              }}
              aria-label="love"
            />{" "}
            by GDG OAU · <a href="/">Back to home</a>
          </p>
        </footer>
      </main>
    </>
  );
}
