import Header from "./Header";
import {
  NOTION_CALENDAR_EMBED_URL,
  NOTION_CALENDAR_PUBLIC_URL,
  WHATSAPP_CHANNEL_URL,
} from "../constants/site";

export default function CalendarPage() {
  return (
    <>
      <Header activePage="calendar" />
      <main className="page-container">
        <section className="hero">
          <div className="eyebrow">
            <span className="green">●</span>
            GDG OAU SCHEDULE
          </div>
          <h1>Events <span>Calendar.</span></h1>
          <p>
            Keep track of upcoming workshops, hackathons, study jams, and community
            sessions happening across GDG on Campus OAU.
          </p>
          <div className="actions" style={{ marginTop: "24px" }}>
            <a className="button whatsapp-channel-button" href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer">Follow WhatsApp Channel</a>
            <a className="button x-button" href={NOTION_CALENDAR_PUBLIC_URL} target="_blank" rel="noopener noreferrer">Open in Notion ↗</a>
          </div>
        </section>

        <section className="calendar-card" aria-label="GDG OAU Events Calendar">
          <iframe
            className="calendar-frame"
            src={NOTION_CALENDAR_EMBED_URL}
            width="100%"
            height="600"
            title="GDG OAU Events Calendar"
            loading="lazy"
            allowFullScreen
          />
        </section>

        <footer className="page-footer">
          <p>
            Built with <span className="red">♥</span> by GDG OAU · <a href="/">Back to home</a>
          </p>
        </footer>
      </main>
    </>
  );
}
