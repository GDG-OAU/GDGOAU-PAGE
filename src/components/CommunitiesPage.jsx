import Header from "./Header";
import { communities } from "../data/communities";
import { ArrowRight02Icon, FavouriteIcon } from "hugeicons-react";

export default function CommunitiesPage() {
  return (
    <>
      <Header activePage="communities" />
      <main className="page-container">
        <section className="hero">
          <div className="eyebrow">
            <span className="blue">●</span>
            EXPLORE OUR COMMUNITIES
          </div>
          <h1>Find Your <span>Community.</span></h1>
          <p>
            Discover your interests, connect with like-minded people,
            and grow together. There is a place for everyone at GDG OAU.
          </p>
        </section>

        <section className="community-grid" aria-label="GDG OAU communities">
          {communities.map((community) => {
            const Icon = community.icon;

            return (
              <article className="community-card" key={community.id}>
                <div className="card-icon" aria-hidden="true">
                  <Icon size={32} strokeWidth={1.8} color="currentColor" />
                </div>
                <h2>{community.name}</h2>
                <p>{community.description}</p>
                <a className="join-button" href={`/page?community=${community.id}`}>
                  Join community <ArrowRight02Icon size={16} strokeWidth={2} aria-hidden="true" />
                </a>
              </article>
            );
          })}
        </section>

        <footer className="page-footer">
          <p>
            Built with <FavouriteIcon size={14} color="#EA4335" style={{ display: "inline-block", verticalAlign: "-2px", margin: "0 2px" }} aria-label="love" /> by GDG OAU · <a href="/">Back to home</a>
          </p>
        </footer>
      </main>
    </>
  );
}
