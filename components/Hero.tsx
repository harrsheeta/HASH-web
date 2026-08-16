"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { roles } from "@/lib/data";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Hero() {
  const [roleIdx, setRoleIdx] = useState(0);
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const leftY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -60]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 110]);
  const photoRot = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 5]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0.25]);

  useEffect(() => {
    const t = setInterval(() => setRoleIdx((i) => (i + 1) % roles.length), 3400);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="hero" id="top" ref={ref}>
      <motion.div
        className="hero-left"
        style={{ y: leftY, opacity: fade }}
        variants={container}
        initial={reduced ? false : "hidden"}
        animate="show"
      >
        <motion.div variants={item}>
          <span className="eyebrow">Available for freelance &amp; fulltime</span>
        </motion.div>

        <motion.h1 className="hero-name" variants={item}>
          I&rsquo;m <span className="accent">Harshita</span>
        </motion.h1>

        <motion.div className="flip-wrap" variants={item}>
          <span className="flip-prefix">{"// I work as a"}</span>
          <span className="flip-stage">
            <AnimatePresence mode="wait">
              <motion.span
                key={roles[roleIdx]}
                style={{ display: "inline-block" }}
                initial={reduced ? false : { y: "110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduced ? undefined : { y: "-110%", opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                {roles[roleIdx]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.div>

        <motion.p className="hero-desc" variants={item}>
          Cutting frames, grading color, and building worlds — one timeline at a time. I&rsquo;m a video editor based
          in Delhi, turning raw footage into stories that hit different — across YouTube, Instagram and brand
          campaigns.
        </motion.p>

        <motion.div className="cta-row" variants={item}>
          <a className="btn btn-primary" href="#work">
            See the wall
          </a>
          <a className="btn btn-ghost" href="#clients">
            Client roster
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-right"
        style={{ y: photoY }}
        initial={reduced ? false : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="glow-orb" aria-hidden="true" />
        <motion.div className="card-stack" style={{ rotate: photoRot }}>
          <motion.div
            className="stack-card c2"
            initial={false}
            animate={reduced ? {} : { rotate: -9, x: -46, y: 14 }}
            whileHover={{ rotate: -12, x: -60 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
          >
            <img src="/stack/c2.jpg" alt="Behind the scenes — camera work" />
          </motion.div>
          <motion.div
            className="stack-card c1"
            initial={false}
            animate={
              reduced
                ? {}
                : { rotate: 4, x: 26, y: [0, -10, 0], transition: { y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" } } }
            }
            whileHover={{ rotate: 1, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
          >
            <img src="/stack/c1.jpg" alt="Harshita on set" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
