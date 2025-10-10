// src/components/HeaderButtons.tsx
import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody, 
  ModalFooter
} from "@heroui/react";
import { FaGlobe, FaFileArrowDown, FaFileLines, FaMoon, FaXmark, FaSun } from "react-icons/fa6";
import { ES, GB } from "country-flag-icons/react/3x2";
import { useTheme } from "../hooks/useTheme";
import ThemeComboButton, { ThemeModeButton } from "./ThemeSwitcher";

const FlagES = <ES title="Español" className="h-4 w-6 rounded-sm ring-1 ring-black/5 shadow-sm" />;
const FlagEN = <GB title="English" className="h-4 w-6 rounded-sm ring-1 ring-black/5 shadow-sm" />;


type Labels = {
  currentLang: "ES" | "EN";
  download: string;
  view: string;
  theme: string;
  modal_title: string;
  modal_download: string;
  modal_close: string;
  modal_unsupported: string;
  modal_open_new_tab: string;
};

export default function HeaderButtons({
  toES,
  toEN,
  labels,
}: {
  toES: string;
  toEN: string;
  labels: Labels;
}) {
  const [pdfOpen, setPdfOpen] = useState(false);
  const locale = labels.currentLang === "ES" ? "es" : "en";
  const base = import.meta.env.BASE_URL; // respeta el "base" de Astro (GitHub Pages, etc.)
  const pdfFile = locale === "es" ? "curriculum_ismael_berdusan_es.pdf" : "curriculum_ismael_berdusan_en.pdf";
  const pdfUrl = `${base}${pdfFile}`;
  const { isDark, toggleDark } = useTheme();

  

  const selectedKey = labels.currentLang === "ES" ? "es" : "en";

  return (
    <div className="flex items-center justify-center sm:justify-end gap-2 md:gap-3">
      {/* Idioma: Dropdown con estilo acorde */}
      <Dropdown
        showArrow
        classNames={{
          // opcional: la flechita con algo de alpha
          base: "before:!bg-white/10 dark:before:!bg-black/20",
          // ESTE es el panel: ponle el fondo translúcido y el blur aquí
          content:
            "rounded-xl border border-white/20 " +
            "bg-white/10 backdrop-blur-md " +
            "dark:border-white/10 dark:!bg-slate-900/40",
        }}
      >
        <DropdownTrigger>
          <Button
            startContent={<FaGlobe />}
            color="primary"
            className="px-3 py-2 min-h-10 min-w-10"
            aria-label="Cambiar idioma"
            title="Cambiar idioma"
          >
            <span className="hidden md:inline">{labels.currentLang}</span>
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Seleccionar idioma"
          selectionMode="single"
          selectedKeys={new Set([selectedKey])}
          onAction={(key) => {
            if (key === "es") window.location.href = toES;
            if (key === "en") window.location.href = toEN;
          }}
          // quita el fondo que pone 'faded'
          variant="light"
          // por si acaso, base sin sombra/fondo
          className="!bg-transparent !shadow-none"
          // y forzamos la 'list' interna a transparente
          classNames={{
            base: "!bg-transparent",
            list: "!bg-transparent !backdrop-blur-0", // la lista no debe pintar fondo
          }}
        >
          <DropdownItem key="es" startContent={FlagES} textValue="Español">Español</DropdownItem>
          <DropdownItem key="en" startContent={FlagEN} textValue="English">English</DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {/* Ver portfolio (modal) */}
      <Button
        startContent={<FaFileLines />}
        color="primary"
        className="px-3 py-2 min-h-10 min-w-10"
        onPress={() => setPdfOpen(true)}
      >
        <span className="hidden md:inline">Portfolio</span>
      </Button>

      {/* Modal con el PDF */}
      <Modal
        hideCloseButton
        isOpen={pdfOpen}
        onOpenChange={setPdfOpen}
        size="5xl"
        scrollBehavior="inside"
        backdrop="blur"
        classNames={{
          // stack por encima del SideNav
          wrapper: "z-[120]",
          // blur visible + alpha para oscurecer el fondo
          backdrop: "z-[115] backdrop-blur-md bg-black/35 dark:bg-black/50",

          // PANEL — efecto glass con gradiente sutil y borde temático
          base:
            "z-[121] rounded-2xl shadow-2xl !p-0 " +
            "!w-[90svw] !max-w-[90svw] sm:!max-w-5xl " + 
            "bg-white/50 backdrop-blur-md " +
            "border border-slate-200 " +
            "dark:bg-slate-900/50 " +
            "dark:border-slate-800",

          // Encabezado y pie con separadores translúcidos
          header:
            "px-5 py-3",

          body: "p-0 bg-transparent",
          footer:
            "px-5 py-3",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-row justify-between items-center">
                {labels.modal_title}
                <Button
                  isIconOnly
                  size="sm"
                  color="primary"
                  variant="light"
                  onPress={onClose}
                >
                  <FaXmark/>
                </Button>
              </ModalHeader>
              <ModalBody>
                <iframe
                  title={labels.modal_title}
                  src={pdfUrl}
                  className="w-full h-[75vh] sm:h-[80vh]"
                  loading="lazy"
                  allow="fullscreen"
                />
                <noscript>
                  <p className="p-4">
                    {labels.modal_unsupported}{" "}
                    <a className="underline" href={pdfUrl} target="_blank" rel="noreferrer">
                      {labels.modal_open_new_tab}
                    </a>.
                  </p>
                </noscript>
              </ModalBody>
              <ModalFooter>
                <Button 
                  startContent={<FaFileArrowDown />}
                  as="a" 
                  href={pdfUrl} 
                  download 
                  color="primary" 
                >
                  {labels.modal_download}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Descargar */}
      <Button
        as="a"
        href={pdfUrl}
        download
        startContent={<FaFileArrowDown />}
        color="primary"
        className="px-3 py-2 min-h-10 min-w-10"
        aria-label={labels.download}
        title={labels.download}
      >
        <span className="hidden md:inline">{labels.download}</span>
      </Button>

      {/* Tema */}
      <ThemeModeButton locale={labels.currentLang === "ES" ? "es" : "en"} />
    </div>
  );
}
