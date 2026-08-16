"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

export default function CursorFX() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<"default" | "link" | "drag">("default");
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const ringX = useSpring(mx, { stiffness: 260, damping: 26, mass: 0.6 });
  const ringY = useSpring(my, { stiffness: 260, damping: 26, mass: 0.6 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      setVisible(true);
    };
    const onOver = (e: PointerEvent) => {
      const el = e.target as Element | null;
      if (el?.closest?.(".wall-canvas")) setMode("drag");
      else if (el?.closest?.("a, button, [role='button'], [role='tab']")) setMode("link");
      else setMode("default");
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [mx, my]);

  if (!enabled || reduced) return null;

  const ringScale = pressed ? 0.8 : mode === "link" ? 1.7 : mode === "drag" ? 1.5 : 1;

  return (
    <>
      <motion.div
        className="cursor-dot"
        style={{ x: mx, y: my, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: visible ? 1 : 0, scale: mode === "link" ? 0.5 : 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="cursor-ring"
        data-mode={mode}
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: visible ? 1 : 0, scale: ringScale }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      >
        <span className="cursor-label">DRAG</span>
      </motion.div>
    </>
  );
}
