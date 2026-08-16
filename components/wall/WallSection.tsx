"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "@/components/Reveal";
import { boardSections, type Video } from "@/lib/data";

const EditWall = dynamic(() => import("./EditWall"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "grid", placeItems: "center", height: "100%", color: "var(--muted)" }}>
      <span className="timecode">Loading the wall…</span>
    </div>
  ),
});

const TABS = [{ key: "all", label: "Overview" }, ...boardSections.map((s) => ({ key: s.key, label: s.label }))];

export default function WallSection() {
  const [focus, setFocus] = useState("all");
  const [selected, setSelected] = useState<Video | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const select = (v: Video | null) => {
    setSelected(v);
    if (v) {
      const section = boardSections.find((s) => s.videos.some((sv) => sv.url === v.url));
      if (section) setFocus(section.key);
    }
  };

  return (
    <section className="section" id="work">
      <Reveal>
        <div className="section-head">
          <div>
            <span className="timecode">00:01 – 00:03 · The Edit Wall</span>
            <h2 className="section-title">
              Every cut, <span className="accent">pinned up.</span>
            </h2>
          </div>
          <p className="section-sub">
            Long form, reels and 3D brand ads — pinned to one wall. Click a card to zoom in.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="wall-tabs" role="tablist" aria-label="Wall sections">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={focus === t.key && !selected}
              className={`tag-btn ${focus === t.key && !selected ? "active" : ""}`}
              onClick={() => {
                setSelected(null);
                setFocus(t.key);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.14}>
        <div className="wall-frame">
          <div className="wall-board">
            <span className="wall-corner tl" aria-hidden="true" />
            <span className="wall-corner tr" aria-hidden="true" />
            <span className="wall-corner bl" aria-hidden="true" />
            <span className="wall-corner br" aria-hidden="true" />
            <div className="wall-canvas">
            <EditWall focus={focus} selected={selected} onSelect={select} />

            <AnimatePresence>
              {!selected && (
                <motion.div
                  className="wall-hint"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  Drag to explore · Click to pick up
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selected && (
                <motion.div
                  className="wall-zoom"
                  role="dialog"
                  aria-label={selected.title}
                  initial={{ opacity: 0, y: 34, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 34, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="zi-body">
                    <span className="zi-tag">{selected.tag}</span>
                    <h4>{selected.title}</h4>
                    <p>{selected.meta}</p>
                  </div>
                  <div className="zi-actions">
                    <a className="zi-watch" href={selected.url} target="_blank" rel="noopener noreferrer">
                      Watch on {selected.platform} ↗
                    </a>
                    <button className="zi-close" onClick={() => setSelected(null)}>
                      Close
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Accessible fallback list of everything pinned on the wall */}
      <ul className="sr-only">
        {boardSections.flatMap((s) =>
          s.videos.map((v) => (
            <li key={v.url}>
              <a href={v.url}>
                {s.label}: {v.title} — {v.meta}
              </a>
            </li>
          )),
        )}
      </ul>
    </section>
  );
}
