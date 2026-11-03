import { WHATSAPP_CHANNEL_URL } from "../constants/site";

export default function HomePage() {
  return (
    <main className="container">
      <h1 className="hello">
        <span className="blue">H</span>
        <span className="red">e</span>
        <span className="yellow">l</span>
        <span className="blue">l</span>
        <span className="green">o</span>
      </h1>

      <p className="welcome">Welcome to GDG on Campus OAU</p>

      <div className="actions">
        <a className="button community" href="/communities">View communities</a>
        <a className="button calendar-button" href="/calendar">Events calendar</a>
        <a className="button whatsapp-channel-button" href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer">WhatsApp channel</a>
        <a className="button x-button" href="https://x.com/GDGOAU" target="_blank" rel="noopener noreferrer">Follow us on X</a>
      </div>

      <div className="sub-links">
        <a className="sub-link" href="https://gdg.community.dev/gdg-on-campus-obafemi-awolowo-university-ife-nigeria/" target="_blank" rel="noopener noreferrer">Official Events Page</a>
        <span className="sub-divider">·</span>
        <a className="sub-link" href="https://www.instagram.com/gdgoau/" target="_blank" rel="noopener noreferrer">Instagram @GDGOAU</a>
      </div>
    </main>
  );
}
