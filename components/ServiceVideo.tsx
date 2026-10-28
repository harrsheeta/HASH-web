"use client";

import { useEffect, useRef } from "react";

export default function ServiceVideo({ video, poster, title }: { video: string; poster: string; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const player = ref.current;
    if (!player) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let disposed = false;
    let frame = 0;
    let autoActive = false;
    const shouldPlay = () => {
      const bounds = player.getBoundingClientRect();
      const nextCard = player.closest(".service-card")?.nextElementSibling;
      // Sticky cards overlap: only the uncovered portion counts as visible.
      const nextTop = nextCard?.getBoundingClientRect().top ?? window.innerHeight;
      const visibleHeight = Math.min(bounds.bottom, window.innerHeight, nextTop) - Math.max(bounds.top, 72);
      return visible && visibleHeight >= bounds.height * 0.35 && !document.hidden && !reduced.matches && !disposed;
    };
    const sync = () => {
      const active = shouldPlay();
      if (active === autoActive) return;
      autoActive = active;
      if (active) {
        player.play().then(() => { if (!shouldPlay()) player.pause(); }).catch(() => {
          // Native controls remain available when a browser blocks autoplay.
        });
      } else {
        player.pause();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
      sync();
    }, { threshold: [0, 0.35], rootMargin: "-72px 0px 0px 0px" });
    observer.observe(player);
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; sync(); });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      player.pause();
    };
  }, []);

  return (
    <video ref={ref} controls muted loop playsInline preload="metadata" poster={`/services/${poster}`} aria-label={`${title} example`}>
      <source src={`/services/${video}`} type="video/mp4" />
      <a href={`/services/${video}`}>Watch the {title} example</a>
    </video>
  );
}
