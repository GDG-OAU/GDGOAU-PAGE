import Hero from "./Hero";
import WhatWeDo from "./WhatWeDo";
import Tracks from "./Tracks";
import Events from "./Events";
import Projects from "./Projects";
import EndReveal from "./EndReveal";

export default function HomePage() {
  return (
    <>
    <main className="home-main">
      <Hero />
      <WhatWeDo />
      <Tracks />
      <Events />
      <Projects />
    </main>
    <EndReveal />
    </>
  );
}
