"use client";

import { useState } from "react";
import { galleryFilters, projects } from "@/content/gallery";
import { BeforeAfterPair } from "./inner";

const PAGE_SIZE = 4;

export default function GalleryGrid() {
  const [filter, setFilter] = useState<(typeof galleryFilters)[number]>("All");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const matching = projects.filter((p) => filter === "All" || p.sector === filter);
  const shown = matching.slice(0, limit);

  return (
    <>
      <section className="pg-filter">
        <div className="pg-filter-bar" role="group" aria-label="Filter projects by facility type">
          {galleryFilters.map((f) => (
            <button
              key={f}
              type="button"
              className="pg-pill"
              aria-pressed={f === filter}
              onClick={() => {
                setFilter(f);
                setLimit(PAGE_SIZE);
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <section className="ps ps-md ps-white ps-after-filter">
        <div className="pg-wrap">
          <p className="pg-count" aria-live="polite">
            Showing {shown.length} of {matching.length} {filter === "All" ? "projects" : `projects in ${filter.toLowerCase()}`}
          </p>
          <div className="pg-gallery">
            {shown.map((p) => (
              <div key={p.id} className="pg-proj-card">
                <BeforeAfterPair before={p.before} after={p.after} sizes="(max-width: 640px) 100vw, 610px" />
                <div className="pg-proj">
                  <h3>{p.title}</h3>
                  <span className="pg-proj-work">{p.work}</span>
                  <span className="pg-proj-sector">{p.sector}</span>
                </div>
              </div>
            ))}
          </div>
          {shown.length < matching.length && (
            <div className="pg-more">
              <button type="button" className="efc-outline-dark" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
                Load more projects
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
