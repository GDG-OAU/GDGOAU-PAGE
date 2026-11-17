import "../hero.css";
import gdgMarkLarge from "../assets/gdg-mark-lg.png";
import gdgMark from "../assets/gdg-mark.png";
import arches from "../assets/figma/arches.svg";
import arrow from "../assets/figma/arrow.svg";
import arrowPaper from "../assets/figma/arrow-paper.svg";
import globe from "../assets/figma/globe.svg";
import pill from "../assets/figma/pill.svg";
import slashes from "../assets/figma/slashes-outline.svg";
import slashesPaper from "../assets/figma/slashes-outline-paper.svg";
import star from "../assets/figma/star.svg";
import hallInk from "../assets/hero/hall-ink.webp";
import { FRAME_WINDOW } from "../assets/figma/frameWindow";
import { HERO_PHOTOS } from "../data/heroPhotos";

const INK = "#1e1e1e";
const LINE = 2;

/* One colour family per layout (brand guide): the yellow family. */
const TONES = { blue: "#f9ab00", green: "#ffd427", red: "#f9ab00" };

/* The frame window comes straight from the Figma UI kit, so the notches and radii are the official ones. */
const S = 1032;
const NOTCH_BR = { w: 218, h: 192 }; // bottom-right notch, in frame units

const FRAMES = {
  a: { corner: star },
  b: { corner: slashes },
  c: { corner: globe },
};

function PhotoFrame({ photo, frame, className }) {
  const { corner } = frame;
  const d = FRAME_WINDOW;
  const clipId = `clip-${photo.id}`;
  const cs = Math.min(NOTCH_BR.w, NOTCH_BR.h) * 0.62;

  return (
    <svg
      className={`photo-frame ${className}`}
      viewBox={`0 0 ${S} ${S}`}
      role="img"
      aria-label={photo.src ? photo.alt : `${photo.alt} (photo coming soon)`}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={d} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {photo.src ? (
          <image href={photo.src} width={S} height={S} preserveAspectRatio="xMidYMid slice" />
        ) : (
          <rect width={S} height={S} fill={TONES[photo.tone] || TONES.blue} />
        )}
      </g>
      <path d={d} fill="none" stroke={INK} strokeWidth={LINE} vectorEffect="non-scaling-stroke" />
      {/* the notches carry the brand mark and one icon, as in the guide */}
      <image href={gdgMark} x={S * 0.03} y={S * 0.02} width={S * 0.24} height={(S * 0.24 * 79) / 130} />
      <image
        href={corner}
        x={S - NOTCH_BR.w + (NOTCH_BR.w - cs) / 2}
        y={S - NOTCH_BR.h + (NOTCH_BR.h - cs) / 2}
        width={cs}
        height={cs}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}

export default function Hero() {
  const [photoA, photoB, photoC] = HERO_PHOTOS;

  return (
    <section className="home-hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <img className="hero-hall" src={hallInk} alt="" aria-hidden="true" width="640" height="436" decoding="async" />
        <div className="hero-copy">
          <img className="hero-mark" src={gdgMarkLarge} alt="Google Developer Group logo mark" width="130" height="71" fetchpriority="high" />

          <p className="hero-hello" aria-hidden="true">
            <span>
              <span className="blue">H</span>
              <span className="red">e</span>
              <span className="yellow">l</span>
              <span className="blue">l</span>
              <span className="green">o</span>
            </span>
            <img className="hero-arrow" src={arrow} alt="" />
          </p>

          <h1 id="hero-title" className="hero-title">
            <span className="title-line">
              <img className="hero-arches" src={arches} alt="" />
              <span>Learn, build</span>
            </span>
            <span>and ship together.</span>
          </h1>

          <p className="hero-lead">
            Google Developer Group on Campus OAU is where students at Obafemi Awolowo University learn new tech,
            build real projects and share what they know.
          </p>

          <div className="hero-cta">
            <a className="hero-button" href="/communities">Join our community</a>
            <span className="hero-dots" aria-hidden="true"><i /><i /><i /></span>
          </div>
        </div>

        <div className="hero-art">
          <PhotoFrame photo={photoA} frame={FRAMES.a} className="frame-a" />
          <PhotoFrame photo={photoB} frame={FRAMES.b} className="frame-b" />
          <PhotoFrame photo={photoC} frame={FRAMES.c} className="frame-c" />
          <img className="art-star" src={star} alt="" />
          <img className="art-pill" src={pill} alt="" />
          <img className="art-slashes" src={slashes} alt="" />
        </div>
      </div>

      <div className="hero-band">
        <div className="hero-band-inner">
          <img className="band-arrow" src={arrowPaper} alt="" />
          <p>
            We are a community where students learn from each other and turn what they learn into projects people can use.
          </p>
          <img className="band-slashes" src={slashesPaper} alt="" />
        </div>
      </div>
    </section>
  );
}
