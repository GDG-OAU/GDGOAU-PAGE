import { useEffect, useRef } from "react";
import "../whatwedo.css";
import { roundedPath } from "../lib/roundedPath";
import arches from "../assets/figma/arches.svg";
import arrow from "../assets/figma/arrow.svg";
import globe from "../assets/figma/globe.svg";
import slashes from "../assets/figma/slashes-outline.svg";
import star from "../assets/figma/star.svg";

const INK = "#1e1e1e";

const CARDS = [
  {
    id: "learn",
    title: "Learn",
    text: "Sessions and study jams on mobile, web, cloud and AI, taught by students who already build with them.",
    icon: arches,
  },
  {
    id: "build",
    title: "Build",
    text: "Join a small team, pick a real problem and take it from the first commit to something people can use.",
    icon: slashes,
  },
  {
    id: "share",
    title: "Share",
    text: "Show your work at demo days and talks, and teach the next student what you just figured out.",
    icon: arrow,
    flip: true,
  },
  {
    id: "connect",
    title: "Connect",
    text: "Meet students from every department, and speakers from the wider developer community.",
    icon: globe,
  },
];

/* Card outline: a rounded panel with a notch cut from the top-right, the same shape as the brand's social template. */
const W = 400;
const H = 600;
const R = 30;
const NW = 150;
const NH = 140;
const CARD_PATH = roundedPath([
  [0, 0, R], [W - NW, 0, R], [W - NW, NH, R], [W, NH, R], [W, H, R], [0, H, R],
]);

/* Phone version of the same shape: a little shorter, so a whole card fits above the stack on small screens. */
const HM = 500;
const NHM = 128;
const CARD_PATH_M = roundedPath([
  [0, 0, R], [W - NW, 0, R], [W - NW, NHM, R], [W, NHM, R], [W, HM, R], [0, HM, R],
]);

function Card({ card, index }) {
  return (
    <li className="wwd-card">
      <svg className="wwd-card-shape wwd-shape-d" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <path d={CARD_PATH} fill="#fff" stroke={INK} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <svg className="wwd-card-shape wwd-shape-m" viewBox={`0 0 ${W} ${HM}`} aria-hidden="true">
        <path d={CARD_PATH_M} stroke={INK} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="wwd-num">{String(index + 1).padStart(2, "0")}</span>
      <img className={`wwd-icon${card.flip ? " flip" : ""}`} src={card.icon} alt="" />
      <div className="wwd-body">
        <h3>{card.title}</h3>
        <p>{card.text}</p>
      </div>
    </li>
  );
}

/* Phones only: the cards stack as you scroll (pure CSS sticky). This adds the depth: every card that gets
   covered shrinks a touch for each card that lands on it. Desktop and tablet never run this. */
function useStackDepth(listRef) {
  useEffect(() => {
    const ul = listRef.current;
    const phone = window.matchMedia("(max-width: 620px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!ul) return undefined;
    let raf = 0;

    const update = () => {
      raf = 0;
      const cards = [...ul.children];
      if (!phone.matches || calm.matches) {
        cards.forEach((c) => { c.style.removeProperty("--s"); c.style.removeProperty("--c"); });
        return;
      }
      const arrive = cards.map((c, i) => {
        if (i === 0) return 0;
        const rect = c.getBoundingClientRect();
        const stuck = parseFloat(getComputedStyle(c).top) || 0;
        return Math.min(1, Math.max(0, 1 - (rect.top - stuck) / (rect.height * 0.85)));
      });
      cards.forEach((c, i) => {
        let covered = 0;
        for (let j = i + 1; j < cards.length; j += 1) covered += arrive[j];
        c.style.setProperty("--s", (1 - 0.03 * covered).toFixed(4));
        c.style.setProperty("--c", Math.min(1, covered).toFixed(3));
      });
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(update); };

    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    phone.addEventListener("change", queue);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      phone.removeEventListener("change", queue);
    };
  }, [listRef]);
}

export default function WhatWeDo() {
  const listRef = useRef(null);
  useStackDepth(listRef);
  return (
    <section className="wwd" aria-labelledby="wwd-title">
      <div className="wwd-inner">
        <header className="wwd-head">
          <p className="wwd-eyebrow">What we do</p>
          <h2 id="wwd-title">
            Learn it. Build it.
            <br />
            Share it.
          </h2>
          <p className="wwd-lead">
            Everything we run at Google Developer Group on Campus OAU comes down to four things. Come to one, or all four.
          </p>
          <img className="wwd-asterisk" src={star} alt="" />
        </header>

        <ul className="wwd-grid" ref={listRef}>
          {CARDS.map((card, i) => (
            <Card key={card.id} card={card} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
