// Hero collage photos (WebP, 900px wide, so they stay light). A frame with src: null shows a coloured placeholder.
import classroom from "../assets/hero/class.webp";
import coding from "../assets/hero/code.webp";
import team from "../assets/hero/team.webp";

export const HERO_PHOTOS = [
  { id: "a", src: classroom, alt: "Students following a web development session at a GDG OAU workshop", tone: "blue" },
  { id: "b", src: coding, alt: "A member writing code on a laptop at a GDG OAU event", tone: "green" },
  { id: "c", src: team, alt: "A speaker presenting to the room at a GDG OAU session", tone: "red" },
];
