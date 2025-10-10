// src/components/SideNav.tsx
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { FaUser, FaBriefcase, FaGraduationCap, FaWrench } from "react-icons/fa6";

type Labels = {
  about: string;
  experience: string;
  education: string;
  tools: string;
};

type Props = {
  id?: string;
  showAt?: number;
  offset?: number;
  className?: string;
  labels?: Labels;
};

export default function SideNav({
  id = "sideNav",
  showAt = 120,
  offset = 12,
  className = "",
  labels = {
    about: "Sobre mí",
    experience: "Experiencia",
    education: "Educación",
    tools: "Herramientas",
  },
}: Props) {
  const navRef = useRef<HTMLElement | null>(null);
  const [visibleMobile, setVisibleMobile] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  // lee variables CSS en px y devuelve número
  const getCSSPxVar = (name: string) => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  };
  const getEffectiveOffset = () =>
    getCSSPxVar('--header-h') + getCSSPxVar('--extra-offset');

  useEffect(() => {
    const onScrollResize = () => {
      if (window.innerWidth < 768) setVisibleMobile(window.scrollY > showAt);
      else setVisibleMobile(true);
    };
    onScrollResize();
    window.addEventListener("scroll", onScrollResize, { passive: true });
    window.addEventListener("resize", onScrollResize);
    return () => {
      window.removeEventListener("scroll", onScrollResize);
      window.removeEventListener("resize", onScrollResize);
    };
  }, [showAt]);

  useEffect(() => {
    const ids = ["about", "experience", "education", "tools"];
    const sections = ids
      .map((i) => document.getElementById(i))
      .filter(Boolean) as HTMLElement[];

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const eff = getEffectiveOffset(); // <-- header + extra
        let current: string | null = sections[0]?.id ?? null;
        for (const sec of sections) {
          const rect = sec.getBoundingClientRect();
          if (rect.top - eff - 1 <= 0) current = sec.id;
        }
        setActive(current);
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll); // por si cambia la altura del header
    window.addEventListener("orientationchange", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("orientationchange", onScroll);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--extra-offset', `${Math.max(0, offset)}px`);
  }, [offset]);


  // Helper para renderizar cada botón con la variante adecuada
  const renderNavBtn = (
    section: "about" | "experience" | "education" | "tools",
    icon: React.ReactNode,
    label: string
  ) => {
    const isActive = active === section;
    return (
      <Button
        key={section}
        as="a"
        href={`#${section}`}
        isIconOnly
        aria-label={label}
        title={label}
        color="primary"
        variant={isActive ? "solid" : "ghost"}
        radius="md"
        className="min-w-10 min-h-10"
        // toque de accesibilidad/hover sin romper el tema
        classNames={{
          base:
            "transition " +
            (isActive
              ? "shadow-md hover:opacity-95"
              : "hover:opacity-90"),
          // opcional: afinar el borde del estado bordered
          // wrapper: !isActive ? "border-primary/40" : "",
        }}
      >
        {icon}
      </Button>
    );
  };

  return (
    <nav
      id={id}
      ref={navRef as any}
      aria-label="Navegación por secciones"
      className={[
        "fixed z-30 p-2 rounded-2xl",
        "inline-flex flex-row md:flex-col gap-2 md:gap-3",
        "bottom-4 left-1/2 -translate-x-1/2",
        "md:top-1/2 md:right-4 md:-translate-y-1/2 md:translate-x-0 md:left-auto md:bottom-auto",
        "backdrop-blur-xl backdrop-saturate-150",
        "bg-white/40 dark:bg-slate-900/40",
        "border border-white/20 dark:border-slate-700/60",
        "shadow-xl hover:shadow-2xl hover:border-primary-800/50 dark:hover:border-primary-200/50",
        "transition",
        visibleMobile
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto",
        className,
      ].join(" ")}
    >
      {renderNavBtn("about", <FaUser size={16} />, labels.about)}
      {renderNavBtn("experience", <FaBriefcase size={16} />, labels.experience)}
      {renderNavBtn("education", <FaGraduationCap size={16} />, labels.education)}
      {renderNavBtn("tools", <FaWrench size={16} />, labels.tools)}
    </nav>
  );
}
