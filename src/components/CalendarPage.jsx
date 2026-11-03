import Header from "./Header";
import {
  NOTION_CALENDAR_EMBED_URL,
  NOTION_CALENDAR_PUBLIC_URL,
  WHATSAPP_CHANNEL_URL,
} from "../constants/site";
import { ArrowUpRight01Icon, FavouriteIcon } from "hugeicons-react";

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
            <a className="button x-button" href={NOTION_CALENDAR_PUBLIC_URL} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              Open in Notion <ArrowUpRight01Icon size={16} strokeWidth={2} aria-hidden="true" />
            </a>
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
            Built with <FavouriteIcon size={14} color="#EA4335" style={{ display: "inline-block", verticalAlign: "-2px", margin: "0 2px" }} aria-label="love" /> by GDG OAU · <a href="/">Back to home</a>
          </p>
        </footer>
      </main>
    </>
  );
}
