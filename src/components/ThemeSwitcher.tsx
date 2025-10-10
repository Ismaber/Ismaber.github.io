// src/components/ThemeColorControls.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { FaPalette, FaSun, FaMoon } from "react-icons/fa6";
import { useTheme } from "../hooks/useTheme";
import { DICTS, type Locale } from "../i18n/dicts";

/* -----------------------------------------------------------
 * 1) Botón de modo (claro/oscuro) — para usar en HeaderButtons
 * ----------------------------------------------------------- */
export function ThemeModeButton({ locale = "es" as Locale }: { locale?: Locale }) {
  const { isDark, toggleDark } = useTheme();
  const dict = DICTS[locale];

  return (
    <Button
      onPress={toggleDark}
      color="primary"
      className="px-3 py-2 min-h-10 min-w-10"
      startContent={isDark ? <FaSun /> : <FaMoon />}
      aria-pressed={isDark}
      aria-label={isDark ? dict.ui.toggle_to_light : dict.ui.toggle_to_dark}
      title={isDark ? dict.ui.toggle_to_light : dict.ui.toggle_to_dark}
    >
      <span className="hidden md:inline">
        {isDark ? dict.ui.mode_light : dict.ui.mode_dark}
      </span>
    </Button>
  );
}

/* ------------------------------------------------------
 * Paleta de estilos por tema (literal para evitar purga)
 * ------------------------------------------------------ */
const THEME_TONES: Record<
  string,
  {
    solid: string;      // estado activo
    ghost: string;      // estado inactivo base
    hoverFill: string;  // hover que rellena
  }
> = {
  indigo: {
    solid: "bg-indigo-500 text-white",
    ghost: "bg-transparent text-indigo-600 border border-indigo-300 dark:text-indigo-300 dark:border-indigo-700",
    hoverFill: "hover:bg-indigo-500 hover:text-white hover:border-transparent",
  },
  emerald: {
    solid: "bg-emerald-500 text-white",
    ghost: "bg-transparent text-emerald-600 border border-emerald-300 dark:text-emerald-300 dark:border-emerald-700",
    hoverFill: "hover:bg-emerald-500 hover:text-white hover:border-transparent",
  },
  amber: {
    solid: "bg-amber-500 text-white",
    ghost: "bg-transparent text-amber-700 border border-amber-300 dark:text-amber-300 dark:border-amber-700",
    hoverFill: "hover:bg-amber-500 hover:text-white hover:border-transparent",
  },
  rose: {
    solid: "bg-rose-500 text-white",
    ghost: "bg-transparent text-rose-600 border border-rose-300 dark:text-rose-300 dark:border-rose-700",
    hoverFill: "hover:bg-rose-500 hover:text-white hover:border-transparent",
  },
};

/* ---------------------------------------------------------------------
 * 2) Rail de colores (DESKTOP): espejo del SideNav (izquierda)
 *    → visible a partir de md, oculto en < md vía matchMedia
 * --------------------------------------------------------------------- */
export function ThemeColorRail({ locale = "es" as Locale }: { locale?: Locale }) {
  const { baseTheme, changeBaseTheme, getThemeOptions } = useTheme();
  const dict = DICTS[locale];
  const options = getThemeOptions(locale);

  const [showRail, setShowRail] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)"); // md
    const onChange = () => setShowRail(mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    window.addEventListener("resize", onChange);
    return () => {
      mql.removeEventListener?.("change", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, []);

  if (!showRail) return null;

  return (
    <nav
      aria-label={dict.ui.theme_color_selector}
      className={[
        "fixed z-30 p-2 rounded-2xl",
        "inline-flex flex-col gap-3",
        "top-1/2 left-4 -translate-y-1/2",
        "backdrop-blur-xl backdrop-saturate-150",
        "bg-white/40 dark:bg-slate-900/40",
        "border border-white/20 dark:border-slate-700/60",
        "shadow-xl hover:shadow-2xl hover:border-primary-800/50 dark:hover:border-primary-200/50",
        "transition",
      ].join(" ")}
    >
      {options.map(opt => {
        const isActive = opt.key === baseTheme;
        const tone = THEME_TONES[opt.key] ?? THEME_TONES.indigo;

        return (
          <Button
            key={opt.key}
            isIconOnly
            color="default"
            radius="md"
            className={[
              "min-w-10 min-h-10 transition",
              isActive ? `${tone.solid}` : `${tone.ghost} ${tone.hoverFill}`,
            ].join(" ")}
            aria-pressed={isActive}
            aria-label={opt.label}
            title={opt.label}
            onPress={() => changeBaseTheme(String(opt.key))}
          >
            <span aria-hidden className={`size-4 rounded-sm ${opt.swatch}`} />
          </Button>
        );
      })}
    </nav>
  );
}

/* -------------------------------------------------------------
 * 3) FAB de colores (MÓVIL): abajo-izquierda con dropdown
 * ------------------------------------------------------------- */
export function ThemeColorFab({
  locale = "es" as Locale,
  showAt = 120,
}: {
  locale?: Locale;
  showAt?: number;
}) {
  const { baseTheme, changeBaseTheme, getThemeOptions } = useTheme();
  const dict = DICTS[locale];
  const options = getThemeOptions(locale);

  const [visibleMobile, setVisibleMobile] = useState(false);
  useEffect(() => {
    const onScrollResize = () => {
      if (window.innerWidth < 768) setVisibleMobile(window.scrollY > showAt);
      else setVisibleMobile(false);
    };
    onScrollResize();
    window.addEventListener("scroll", onScrollResize, { passive: true });
    window.addEventListener("resize", onScrollResize);
    return () => {
      window.removeEventListener("scroll", onScrollResize);
      window.removeEventListener("resize", onScrollResize);
    };
  }, [showAt]);

  return (
    <div
      className={[
        "md:hidden",
        "fixed bottom-4 left-4 z-40",
        "inline-flex items-center justify-center",
        "h-14 w-14 rounded-2xl",
        "backdrop-blur-xl backdrop-saturate-150",
        "bg-white/40 dark:bg-slate-900/40",
        "border border-white/20 dark:border-slate-700/60",
        "shadow-xl hover:shadow-2xl hover:border-primary-800/50 dark:hover:border-primary-200/50",
        "transition",
        visibleMobile ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <Dropdown
        showArrow
        classNames={{
          base: "before:!bg-white/10 dark:before:!bg-black/20",
          content:
            "rounded-xl border border-white/20 " +
            "bg-white/10 backdrop-blur-md " +
            "dark:border-white/10 dark:!bg-slate-900/40",
        }}
      >
        <DropdownTrigger>
          <Button
            isIconOnly
            aria-label={dict.ui.theme_color_title}
            title={dict.ui.theme_color_title}
            variant="ghost"
            color="primary"
            className="size-10"
          >
            <FaPalette />
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label={dict.ui.select_color}
          selectionMode="single"
          selectedKeys={new Set([baseTheme])}
          onAction={(key) => changeBaseTheme(String(key))}
          variant="light"
          className="!bg-transparent !shadow-none"
          classNames={{ base: "!bg-transparent", list: "!bg-transparent !backdrop-blur-0" }}
        >
          {options.map((opt) => (
            <DropdownItem
              key={opt.key}
              startContent={<span aria-hidden className={`h-4 w-4 rounded-[3px] ${opt.swatch}`} />}
              textValue={opt.label}
            >
              {opt.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}

/* -------------------------------------------------------------
 * 4) Wrapper: Rail (md+) + FAB (< md)
 * ------------------------------------------------------------- */
export default function ThemeColorControls({
  locale = "es" as Locale,
  showAt = 120,
}: {
  locale?: Locale;
  showAt?: number;
}) {
  return (
    <>
      <ThemeColorRail locale={locale} />
      <ThemeColorFab locale={locale} showAt={showAt} />
    </>
  );
}
