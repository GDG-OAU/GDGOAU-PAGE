import { Download04Icon, Github01Icon } from "hugeicons-react";
import "../projects.css";
import star from "../assets/figma/star.svg";
import slashes from "../assets/figma/slashes-outline.svg";
import qruifyIcon from "../assets/projects/qruify-icon.webp";
import qruifyCreate from "../assets/projects/qruify-create.webp";
import qruifyCustomize from "../assets/projects/qruify-customize.webp";
import qruifyShare from "../assets/projects/qruify-share.webp";

const QRUIFY_REPO = "https://github.com/GDGOAU-MOBILE/Qruify";

/* Add the next project to this list; the first one is shown as the featured card. */
const PROJECTS = [
  {
    id: "qruify",
    name: "Qruify",
    icon: qruifyIcon,
    meta: "v1.0.0 · Android · Flutter",
    lead: "A private QR code maker and scanner for Android.",
    text: "Type a link, text or Wi-Fi details and the code builds as you type. Add your own colours and logo, scan codes with the camera, and check guests in from a CSV list. Everything stays on your phone.",
    points: [
      { label: "Works offline", color: "var(--gdg-green)" },
      { label: "No account needed", color: "var(--gdg-blue)" },
      { label: "Free and open source", color: "var(--gdg-red)" },
    ],
    tags: ["Flutter", "Dart", "SQLite", "MIT licence"],
    tint: "#ffe7a5",
    screens: [
      { src: qruifyCustomize, alt: "Qruify customise screen with code colour, background colour and logo options" },
      { src: qruifyCreate, alt: "Qruify create screen showing a live QR code preview for a typed link" },
      { src: qruifyShare, alt: "Qruify result screen with the finished QR code and a share button" },
    ],
    primary: { label: "Download APK", href: `${QRUIFY_REPO}/releases/latest/download/qruify-arm64-v8a-release.apk` },
    repo: QRUIFY_REPO,
    extra: { label: "Privacy policy", href: "https://ferousco-dev.github.io/qruify-privacy-policy/" },
    credit: "Built by the GDGOAU Mobile Development community",
  },
];

export default function Projects() {
  return (
    <section className="pj" aria-labelledby="pj-title">
      <div className="pj-inner">
        <header className="pj-head">
          <div>
            <p className="pj-eyebrow">Featured projects</p>
            <h2 id="pj-title">Built by members. Used by people.</h2>
          </div>
          <img className="pj-star" src={star} alt="" />
        </header>

        <ul className="pj-grid">
          {PROJECTS.map((p, i) => (
            <li key={p.id} className={`pj-card${i === 0 ? " pj-card--feature" : ""}`} style={{ "--tint": p.tint }}>
              <div className="pj-pic">
                <div className="pj-phones">
                  {p.screens.map((s, n) => (
                    <img key={s.src} className={`pj-phone pj-phone--${n}`} src={s.src} alt={s.alt} loading="lazy" decoding="async" width="540" height="960" />
                  ))}
                </div>
                <img className="pj-deco" src={slashes} alt="" />
              </div>

              <div className="pj-body">
                <div className="pj-title">
                  <img className="pj-icon" src={p.icon} alt="" width="64" height="64" />
                  <div>
                    <h3>{p.name}</h3>
                    <p className="pj-meta">{p.meta}</p>
                  </div>
                </div>

                <p className="pj-lead">{p.lead}</p>
                <p>{p.text}</p>

                <ul className="pj-points">
                  {p.points.map((pt) => (
                    <li key={pt.label}><span className="pj-dot" style={{ background: pt.color }} aria-hidden="true" />{pt.label}</li>
                  ))}
                </ul>

                <p className="pj-tags">{p.tags.map((t) => <span key={t}>{t}</span>)}</p>

                <div className="pj-actions">
                  <a className="pj-link" href={p.primary.href}>
                    <Download04Icon size={20} aria-hidden="true" />
                    {p.primary.label}
                  </a>
                  <a className="pj-link pj-link--ghost" href={p.repo} target="_blank" rel="noopener noreferrer">
                    <Github01Icon size={20} aria-hidden="true" />
                    View on GitHub
                  </a>
                </div>

                <p className="pj-foot">
                  {p.credit} · <a href={p.extra.href} target="_blank" rel="noopener noreferrer">{p.extra.label}</a>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
