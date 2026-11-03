import { WHATSAPP_CHANNEL_URL } from "../constants/site";

export default function Header({ activePage = "home" }) {
  return (
    <header className="site-header">
      <a href="/" className="brand">
        <img
          src="https://i.ibb.co/QFS8hQMr/Brackets.png"
          alt="GDGoC Logo"
          className="brand-logo"
        />
        <span>OAU</span>
      </a>

      <nav className="nav-links" aria-label="Main navigation">
        <a href="/" className={activePage === "home" ? "active" : ""}>Home</a>
        <a href="/communities" className={activePage === "communities" ? "active" : ""}>Communities</a>
        <a href="/calendar" className={activePage === "calendar" ? "active" : ""}>Calendar</a>
        <a href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer">Channel</a>
      </nav>
    </header>
  );
}
