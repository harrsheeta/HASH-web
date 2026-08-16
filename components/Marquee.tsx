"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import { brands } from "@/lib/data";

export default function Marquee() {
  const loop = [...brands, ...brands];
  const reduced = useReducedMotion();

  // marquee leans with scroll velocity
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const skewRaw = useTransform(velocity, [-1600, 0, 1600], [4, 0, -4]);
  const skewX = useSpring(skewRaw, { stiffness: 220, damping: 24 });

  return (
    <div className="brand-strip" aria-label="Brands worked with">
      <motion.div className="marquee" style={reduced ? undefined : { skewX }}>
        {loop.map((b, i) => (
          <span key={i} aria-hidden={i >= brands.length}>
            {b}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
