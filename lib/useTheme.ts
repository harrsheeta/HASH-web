"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const el = document.documentElement;
    const read = () => setTheme(el.dataset.theme === "light" ? "light" : "dark");
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  const toggle = () => {
    const el = document.documentElement;
    const next = el.dataset.theme === "light" ? "dark" : "light";
    el.dataset.theme = next;
    try {
      localStorage.setItem("hash-theme", next);
    } catch {
      /* private mode */
    }
  };

  return [theme, toggle];
}
