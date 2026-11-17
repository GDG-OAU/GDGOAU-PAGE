import "../pages.css";
import Header from "./Header";
import { communities } from "../data/communities";
import arches from "../assets/figma/arches.svg";
import star from "../assets/figma/star.svg";
import arrowPaper from "../assets/figma/arrow-paper.svg";

const TINTS = ["#ffe7a5", "#ccf6c5", "#c3ecf6", "#f8d8d8"];

export default function CommunitiesPage() {
  return (
    <>
      <Header activePage="communities" />
      <main className="pg">
        <section className="pg-hero" aria-labelledby="cm-title">
          <div className="pg-hero-inner">
            <p className="pg-eyebrow">Explore our communities</p>
            <h1 id="cm-title" className="pg-title">
              <img className="pg-arches" src={arches} alt="" />
              <span>Find your community.</span>
            </h1>
            <p className="pg-lead">
              Pick the area you want to learn in, join its WhatsApp group and meet students who are working on the same things. There is a place for everyone at GDG OAU.
            </p>
            <img className="pg-star" src={star} alt="" />
          </div>
        </section>

        <section className="cm-list" aria-label="GDG OAU communities">
          <ul className="cm-grid">
            {communities.map((c, i) => {
              const Icon = c.icon;
              return (
                <li className="cm-card" key={c.id} style={{ "--tint": TINTS[i % 4] }}>
                  <span className="cm-icon"><Icon size={30} strokeWidth={1.8} aria-hidden="true" /></span>
                  <h2>{c.name}</h2>
                  <p>{c.description}</p>
                  <a className="cm-join" href={`/page?community=${c.id}`}>
                    Join community<span aria-hidden="true"> →</span>
                    <span className="sr-only"> {c.name}</span>
                  </a>
                </li>
              );
            })}
          </ul>
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
