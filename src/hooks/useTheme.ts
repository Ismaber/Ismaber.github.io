// src/hooks/useTheme.ts
import { useState, useEffect } from "react";
import { DICTS, type Locale } from "../i18n/dicts";

export const BASE_THEMES = [
  "indigo","emerald","amber","rose"
] as const;
export type BaseTheme = typeof BASE_THEMES[number];

const DARK_SUFFIX = "-dark";

// swatches tailwind por tema (clases literales para no ser purgadas)
const SWATCH_MAP: Record<BaseTheme, string> = {
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500"
};

export function useTheme() {
  const [baseTheme, setBaseTheme] = useState<BaseTheme>("indigo");
  const [isDark, setIsDark] = useState<boolean>(false);

  const applyTheme = (base: BaseTheme, dark: boolean) => {
    const root = document.documentElement;

    // limpia clases anteriores
    [...root.classList]
      .filter(cls =>
        BASE_THEMES.includes(cls as BaseTheme) ||
        BASE_THEMES.some(b => cls === `${b}${DARK_SUFFIX}`)
      )
      .forEach(cls => root.classList.remove(cls));
    root.classList.remove("dark");

    const themeName = (dark ? `${base}${DARK_SUFFIX}` : base) as string;
    root.classList.add(themeName);
    if (dark) root.classList.add("dark");
    root.setAttribute("data-theme", themeName);
    root.style.colorScheme = dark ? "dark" : "light";

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) metaThemeColor.setAttribute("content", dark ? "#0b1020" : "#ffffff");

    localStorage.setItem("theme", themeName);
    document.cookie = `theme=${themeName}; Path=/; Max-Age=31536000; SameSite=Lax`;

    window.dispatchEvent(new CustomEvent("theme-change", { detail: { base, dark } }));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    let initial = localStorage.getItem("theme");
    if (initial === "light") initial = "indigo";
    if (initial === "dark") initial = "indigo-dark";
    if (!initial) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      initial = prefersDark ? "indigo-dark" : "indigo";
    }

    const dark = initial.endsWith(DARK_SUFFIX);
    const base = (dark ? initial.replace(DARK_SUFFIX, "") : initial) as BaseTheme;

    setBaseTheme(base);
    setIsDark(dark);
    applyTheme(base, dark);

    const handleThemeChange = (e: Event) => {
      const { base: newBase, dark: newDark } =
        (e as CustomEvent<{ base: BaseTheme; dark: boolean }>).detail;
      setBaseTheme(newBase);
      setIsDark(newDark);
    };
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  const changeBaseTheme = (newBase: string) => {
    const base = (newBase as BaseTheme) ?? "indigo";
    setBaseTheme(base);
    applyTheme(base, isDark);
  };

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    applyTheme(baseTheme, newDark);
  };

  // ---- API para el selector (lee labels del DICTS) ----
  const getThemeOptions = (locale: Locale = "es") =>
    BASE_THEMES.map((key) => ({
      key,
      label: DICTS[locale].themeNames[key],
      swatch: SWATCH_MAP[key],
    }));

  const getThemeMeta = (key: BaseTheme, locale: Locale = "es") => ({
    key,
    label: DICTS[locale].themeNames[key],
    swatch: SWATCH_MAP[key],
  });

  return {
    baseTheme,
    isDark,
    changeBaseTheme,
    toggleDark,
    baseThemes: BASE_THEMES as readonly BaseTheme[],
    getThemeOptions,
    getThemeMeta,
  };
}
