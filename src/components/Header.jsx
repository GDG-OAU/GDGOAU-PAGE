import { useEffect, useRef, useState } from "react";
import { WHATSAPP_CHANNEL_URL } from "../constants/site";
import gdgMark from "../assets/gdg-mark.png";

const LINKS = [
  { key: "home", label: "Home", href: "/" },
  { key: "communities", label: "Communities", href: "/communities" },
  { key: "calendar", label: "Calendar", href: "/calendar" },
  { key: "channel", label: "Channel", href: WHATSAPP_CHANNEL_URL, external: true },
];

export default function Header({ activePage = "home" }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Close the mobile menu on Escape, on outside click, and when the screen grows to desktop.
  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 861px)");
    const onChange = (event) => {
      if (event.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const close = () => setOpen(false);

  return (
    <div className="site-header-wrap" ref={wrapRef}>
      <header className="site-header">
        <a href="/" className="brand">
          <img src={gdgMark} alt="" className="brand-logo" width="44" height="27" />
          <span className="brand-text">
            <span className="brand-name">Google Developer Group</span>
            <span className="brand-sub">on Campus OAU</span>
          </span>
        </a>

        <button
          type="button"
          className={`nav-toggle${open ? " is-open" : ""}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
        </button>

        <div id="site-nav" className={`nav-panel${open ? " is-open" : ""}`}>
          <nav className="nav-links" aria-label="Main navigation">
            {LINKS.map((link) => (
              <a
                key={link.key}
                href={link.href}
                className={activePage === link.key ? "active" : ""}
                aria-current={activePage === link.key ? "page" : undefined}
                onClick={close}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a href="/communities" className="nav-cta" onClick={close}>
            Join us
          </a>
        </div>
      </header>
    </div>
  );
}
