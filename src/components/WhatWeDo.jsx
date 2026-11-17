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

function Card({ card, index }) {
  return (
    <li className="wwd-card">
      <svg className="wwd-card-shape" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <path d={CARD_PATH} fill="#fff" stroke={INK} strokeWidth="2" vectorEffect="non-scaling-stroke" />
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

export default function WhatWeDo() {
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

        <ul className="wwd-grid">
          {CARDS.map((card, i) => (
            <Card key={card.id} card={card} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
