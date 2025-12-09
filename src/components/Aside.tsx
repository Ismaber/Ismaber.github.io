// src/components/Aside.tsx
import React from "react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  Avatar,
  Chip,
  DrawerHeader,
} from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import {
  FaEnvelope,
  FaLocationDot,
  FaLinkedin,
  FaGithub,
  FaLanguage,
  FaToolbox,
  FaGlobe,
  FaLink,
  FaXmark,
  FaIdCard,
} from "react-icons/fa6";

/* --------- Tipos --------- */
type SocialKind = "linkedin" | "github" | "web" | "link";
export interface SocialLink {
  kind: SocialKind;
  href: string;
  label: string;
}
export interface Language {
  code: string;
  label: string;
}

export interface AsideProps {
  imgSrc: string;
  altText: string;
  headline: string;
  email: string;
  city: string;
  cityHref?: string;
  socialLinks: SocialLink[];
  languages: Language[];
  skills: string[];
  contactTitle?: string;
  languageTitle?: string;
  skillsTitle?: string;
  bordered?: boolean;
  children?: React.ReactNode;
}

/* --------- Iconos sociales --------- */
const socialIcon: Record<SocialKind, React.ReactNode> = {
  linkedin: <FaLinkedin />,
  github: <FaGithub />,
  web: <FaGlobe />,
  link: <FaLink />,
};

/* ============================================================
   1) SOLO EL CONTENIDO INTERIOR (sin marco/carta)
   ============================================================ */
export function AsideContent({
  headline,
  email,
  city,
  cityHref,
  socialLinks = [],
  languages = [],
  skills = [],
  contactTitle = "CONTACTO",
  languageTitle = "IDIOMAS",
  skillsTitle = "HABILIDADES",
  children,
}: AsideProps) {
  return (
    <div className="rt">
      <h2 id="profile-title" className="sr-only">
        Perfil
      </h2>

      <div
        className="w-40 h-40 mx-auto mb-4
                   ring-4 ring-primary-200 border-4 border-primary-300
                   rounded-full shadow-lg overflow-hidden
                   transition group-hover:scale-[1.03] group-hover:-rotate-1 group-hover:shadow-primary-500/35
                   dark:group-hover:shadow-primary-500/35 dark:ring-primary-900/50 dark:border-primary-500/50"
      >
        {children}
      </div>

      <p className="text-center text-sm text-slate-600 italic dark:text-slate-300">
        {headline}
      </p>

      <div className="mt-6 space-y-3">
        <h2 className="section-title text-xl font-bold text-primary-900 dark:text-primary-300 flex items-center gap-2">
          <FaIdCard />
          <span>{contactTitle}</span>
        </h2>

        <div className="flex items-center gap-3">
          <span className="size-9 rounded-lg bg-primary-300/40 text-primary-600 flex items-center justify-center dark:bg-primary-900/40 dark:text-primary-300">
            <FaEnvelope />
          </span>
          <a href={`mailto:${email}`}>{email}</a>
        </div>

        <div className="flex items-center gap-3">
          <span className="size-9 rounded-lg bg-primary-300/40 text-primary-600 flex items-center justify-center dark:bg-primary-900/40 dark:text-primary-300">
            <FaLocationDot />
          </span>
          <div>
            {cityHref ? (
              <a href={cityHref} target="_blank" rel="noreferrer" title={city}>
                {city}
              </a>
            ) : (
              city
            )}
          </div>
        </div>

        {socialLinks.map((s) => (
          <div key={s.href} className="flex items-center gap-3">
            <span
              className="size-9 rounded-lg bg-primary-300/40 text-primary-600 flex items-center justify-center dark:bg-primary-900/40 dark:text-primary-300"
              aria-hidden="true"
            >
              {socialIcon[s.kind] ?? <FaLink />}
            </span>
            <a href={s.href} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="section-title text-xl font-bold text-primary-900 dark:text-primary-300 flex items-center gap-2">
          <FaLanguage />
          <span>{languageTitle}</span>
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200/90">
          {languages.map((lang) => (
            <li key={lang.code}>
              <span className="text-lg font-semibold">{lang.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="section-title text-xl font-bold text-primary-900 dark:text-primary-300 flex items-center gap-2">
          <FaToolbox />
          <span>{skillsTitle}</span>
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((sk) => (
            <Chip key={sk} radius="sm" color="primary">
              {sk}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   2) CARTA DE DESKTOP (envoltorio con borde)
   ============================================================ */
export function AsideCard({ children, ...props }: AsideProps) {
  const { bordered = true } = props;
  return (
    <aside
      aria-labelledby="profile-title"
      className={[
        "min-w-0 group reveal rounded-2xl backdrop-blur-xl p-6 shadow-md",
        "bg-white/50 dark:bg-slate-900/50 transition hover:shadow-xl",
        "hover:border-primary-800/50 dark:hover:border-primary-200/50",
        bordered ? "border border-slate-200 dark:border-slate-800" : "border-0",
      ].join(" ")}
    >
      <AsideContent {...props}>{children}</AsideContent>
    </aside>
  );
}

/* ============================================================
   3) RESPONSIVE: desktop = carta, móvil = botón + drawer (sin header)
   ============================================================ */
export function ResponsiveAside({ children, ...props }: AsideProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  // cuando se abre, ocultamos el FAB para que no quede por encima
  const fabStateClasses = isOpen
    ? "opacity-0 pointer-events-none"
    : "opacity-100 pointer-events-auto";

  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden lg:block">
        <AsideCard {...props}>{children}</AsideCard>
      </div>

      {/* Móvil */}
      <div className="lg:hidden">
        {/* Botón flotante */}
        <div
          className={`fixed bottom-4 right-4 z-40 ${fabStateClasses}
                      inline-flex items-center justify-center
                      h-14 w-14 rounded-2xl
                      backdrop-blur-xl backdrop-saturate-150
                      bg-white/40 dark:bg-slate-900/40
                      border border-white/20 dark:border-slate-700/60
                      shadow-xl hover:shadow-2xl hover:border-primary-800/50 dark:hover:border-primary-200/50
                      transition`}
        >
          <Button
            isIconOnly
            aria-label="Abrir panel de perfil"
            onPress={onOpen}
            variant="light"
            color="primary"
            className="size-14"
          >
            <Avatar
              src={props.imgSrc}
              name={props.altText}
              radius="sm"
              isBordered
              color="primary"
              className="size-10"
            />
          </Button>
        </div>

        {/* Drawer derecha */}
        <Drawer
          hideCloseButton
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          placement="right"
          size="sm"
          backdrop="transparent"
        >
          <DrawerContent className="backdrop-blur-xl bg-white/50 dark:bg-slate-900/50">
            {() => (
              <>
                <DrawerHeader className="absolute top-0 inset-x-0 z-50 flex flex-row gap-2 px-2 py-2 justify-between">
                  <Button
                    isIconOnly
                    size="sm"
                    color="primary"
                    variant="light"
                    onPress={onClose}
                  >
                    <FaXmark />
                  </Button>
                </DrawerHeader>
                <DrawerBody className="pb-8">
                  <div className="p-4">
                    <AsideContent {...props}>{children}</AsideContent>
                  </div>
                </DrawerBody>
              </>
            )}
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
// export default ResponsiveAside; // opcional
