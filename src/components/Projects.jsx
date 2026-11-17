import "../projects.css";
import star from "../assets/figma/star.svg";
import slashes from "../assets/figma/slashes-outline.svg";

/* Placeholder content: swap in the real project names, text, images and links later. */
const PROJECTS = [
  {
    id: "one",
    name: "Project name",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: ["Tag one", "Tag two", "Tag three"],
    tint: "#ffe7a5",
    href: "#",
  },
  {
    id: "two",
    name: "Project name",
    text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    tags: ["Tag one", "Tag two", "Tag three"],
    tint: "#c3ecf6",
    href: "#",
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
            <li key={p.id} className="pj-card" style={{ "--tint": p.tint }}>
              <div className="pj-pic" role="img" aria-label="Project image placeholder">
                <span>Image placeholder</span>
                <img className="pj-deco" src={i === 0 ? slashes : star} alt="" />
              </div>
              <div className="pj-body">
                <h3>{p.name}</h3>
                <p>{p.text}</p>
                <p className="pj-tags">{p.tags.map((t) => <span key={t}>{t}</span>)}</p>
                <a className="pj-link" href={p.href}>View project<span aria-hidden="true"> →</span><span className="sr-only"> {i + 1}</span></a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
