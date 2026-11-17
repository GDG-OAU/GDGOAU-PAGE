import { useEffect, useRef } from "react";
import "../end.css";
import { communities } from "../data/communities";
import { WHATSAPP_CHANNEL_URL } from "../constants/site";

const INK = "#1e1e1e";
const COLOURS = ["#ffd427", "#ffe7a5", "#c3ecf6", "#ccf6c5", "#f8d8d8", "#57caff", "#5cdb6d", "#ff7daf"];

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Communities", href: "/communities" },
  { label: "Calendar", href: "/calendar" },
  { label: "Join us", href: "/communities" },
];
const SOCIALS = [
  { label: "X", href: "https://x.com/GDGOAU" },
  { label: "Instagram", href: "https://www.instagram.com/gdgoau/" },
  { label: "WhatsApp channel", href: WHATSAPP_CHANNEL_URL },
];

/* The footer is fixed behind the page. The page above has a curved bottom edge and scrolls away like a lid;
   as the footer is uncovered, a ball pit (one ball per community icon) drops in and settles above the links. */
export default function EndReveal() {
  const spacer = useRef(null);
  const footer = useRef(null);
  const canvas = useRef(null);
  const floorRef = useRef(null);
  const iconBox = useRef(null);

  useEffect(() => {
    let alive = true;
    let cleanup = () => {};

    const boot = async () => {
      const Matter = (await import("matter-js")).default;
      if (!alive) return;
      const { Engine, Bodies, Composite, Body } = Matter;

      // Turn the community icons (already rendered in the hidden box) into images the canvas can draw.
      const svgs = [...iconBox.current.querySelectorAll("svg")].map((el) => {
        let src = el.outerHTML.replace(/currentColor/g, INK);
        if (!src.includes("xmlns=")) src = src.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
        const img = new Image();
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(src)}`;
        return img;
      });

      const cv = canvas.current;
      const ctx = cv.getContext("2d");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let engine;
      let balls = [];
      let W = 0;
      let H = 0;
      let raf = 0;
      let running = false;
      let dpr = 1;

      const build = () => {
        const rect = footer.current.getBoundingClientRect();
        W = rect.width;
        H = rect.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);

        const floorY = floorRef.current.offsetTop; // top of the links + wordmark block
        const r = Math.max(24, Math.min(54, W * 0.032));
        engine = Engine.create({ enableSleeping: true });
        engine.gravity.y = 1.1;
        const t = 200;
        Composite.add(engine.world, [
          Bodies.rectangle(W / 2, floorY + t / 2, W * 2, t, { isStatic: true }),
          Bodies.rectangle(-t / 2, H / 2, t, H * 4, { isStatic: true }),
          Bodies.rectangle(W + t / 2, H / 2, t, H * 4, { isStatic: true }),
        ]);

        const total = communities.length + (W < 700 ? 0 : 4);
        balls = Array.from({ length: total }, (_, i) => {
          const size = r * (i % 5 === 0 ? 1.25 : i % 3 === 0 ? 0.85 : 1);
          const body = Bodies.circle(r + Math.random() * (W - r * 2), -size * 2 - i * r * 1.1, size, {
            restitution: 0.55, friction: 0.08, frictionAir: 0.006, density: 0.0012,
          });
          Body.setAngle(body, Math.random() * Math.PI);
          Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2);
          return { body, size, colour: COLOURS[i % COLOURS.length], icon: i < communities.length ? svgs[i] : null };
        });
        Composite.add(engine.world, balls.map((b) => b.body));
      };

      const draw = () => {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.lineWidth = 2;
        ctx.strokeStyle = INK;
        for (const b of balls) {
          const { x, y } = b.body.position;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(b.body.angle);
          ctx.beginPath();
          ctx.arc(0, 0, b.size - 1, 0, Math.PI * 2);
          ctx.fillStyle = b.colour;
          ctx.fill();
          ctx.stroke();
          if (b.icon?.complete && b.icon.naturalWidth) {
            const s = b.size * 1.05;
            ctx.drawImage(b.icon, -s / 2, -s / 2, s, s);
          }
          ctx.restore();
        }
      };

      let last = 0;
      const tick = (now = performance.now()) => {
        // real elapsed time (capped), so a slow frame rate still drops at the right speed
        const dt = Math.min(now - (last || now - 1000 / 60), 1000 / 30);
        last = now;
        Engine.update(engine, dt);
        draw();
        const asleep = balls.every((b) => b.body.isSleeping);
        if (asleep) { running = false; return; }
        raf = requestAnimationFrame(tick);
      };
      const start = () => {
        if (running) return;
        running = true;
        last = 0;
        raf = requestAnimationFrame(tick);
      };
      const drop = () => {
        cancelAnimationFrame(raf);
        running = false;
        build();
        if (reduced) {
          for (let i = 0; i < 400; i += 1) Engine.update(engine, 1000 / 60);
          draw();
        } else {
          start();
        }
      };

      let dropped = false;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.intersectionRatio > 0.3 && !dropped) { dropped = true; drop(); }
          else if (entry.intersectionRatio === 0) { dropped = false; cancelAnimationFrame(raf); running = false; }
        },
        { threshold: [0, 0.3] }
      );
      // fixed footer: watch the spacer; short viewports let the footer follow the page, so watch the footer itself
      io.observe(getComputedStyle(footer.current).position === "fixed" ? spacer.current : footer.current);

      let timer = 0;
      const ro = new ResizeObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(() => { if (dropped) drop(); }, 200);
      });
      ro.observe(footer.current);
      document.fonts?.ready.then(() => alive && dropped && drop());

      cleanup = () => { io.disconnect(); ro.disconnect(); cancelAnimationFrame(raf); clearTimeout(timer); };
    };

    // Load the physics engine only once the end of the page is getting close.
    const preload = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { preload.disconnect(); boot(); } },
      { rootMargin: "100% 0px" }
    );
    preload.observe(spacer.current);

    return () => { alive = false; preload.disconnect(); cleanup(); };
  }, []);

  return (
    <>
      <div className="end-spacer" ref={spacer} aria-hidden="true" />
      <footer className="end" ref={footer}>
        <canvas className="end-canvas" ref={canvas} aria-hidden="true" />
        <div className="end-icons" ref={iconBox} aria-hidden="true">
          {communities.map((c) => { const Icon = c.icon; return <Icon key={c.id} size={64} strokeWidth={1.6} color={INK} />; })}
        </div>

        <div className="end-cta">
          <p className="end-eyebrow">Ready when you are</p>
          <h2>Come build with us.</h2>
          <p className="end-lead">Pick a community, come to the next session and ship something real with other students.</p>
          <div className="end-actions">
            <a className="end-btn end-btn-yellow" href="/communities">Join our community</a>
            <a className="end-btn end-btn-line" href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer">Follow the channel</a>
          </div>
        </div>

        <div className="end-bottom" ref={floorRef}>
          <nav className="end-links" aria-label="Footer">
            <ul>{LINKS.map((l) => <li key={l.label}><a href={l.href}>{l.label}</a></li>)}</ul>
            <ul>{SOCIALS.map((l) => <li key={l.label}><a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a></li>)}</ul>
          </nav>
          <p className="end-word" aria-hidden="true">GDG OAU</p>
          <p className="end-small">Google Developer Group on Campus OAU</p>
        </div>
      </footer>
    </>
  );
}
