// src/components/HeaderButtons.tsx
import { useState } from "react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  addToast
} from "@heroui/react";
import { FaGlobe, FaFileArrowDown } from "react-icons/fa6";
import { ES, GB } from "country-flag-icons/react/3x2";
import { ThemeModeButton } from "./ThemeSwitcher";
import PdfModalButton from "./PdfModalButton";

type Labels = {
  change_language: string;
  currentLang: "ES" | "EN";
  download: string;
  view: string;
  theme: string;
  view_portfolio: string;
  modal_title: string;
  modal_download: string;
  modal_close: string;
  modal_unsupported: string;
  modal_open_new_tab: string;
  toast_title: string;
  toast_description: string;
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
  const locale = labels.currentLang === "ES" ? "es" : "en";
  const base = import.meta.env.BASE_URL;
  const pdfFile = locale === "es" ? "curriculum_ismael_berdusan_es.pdf" : "curriculum_ismael_berdusan_en.pdf";
  const pdfUrl = `${base}${pdfFile}`;

  const selectedKey = labels.currentLang === "ES" ? "es" : "en";

  const FlagES = <ES title="Español" className="h-4 w-6 rounded-sm ring-1 ring-black/5 shadow-sm" />;
  const FlagEN = <GB title="English" className="h-4 w-6 rounded-sm ring-1 ring-black/5 shadow-sm" />;

  const handleDownload = () => {
    addToast({
      title: labels.toast_title,
      description: labels.toast_description,
      color: "primary",
      variant: "solid",
      radius: "lg",
      icon: <FaFileArrowDown />,
      timeout: 3000,
    });
  };

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
            aria-label={labels.change_language}
            title={labels.change_language}
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
      <PdfModalButton
        pdfUrl={pdfUrl}
        labels={{
          view_portfolio: labels.view_portfolio,
          modal_title: labels.modal_title,
          modal_download: labels.modal_download,
          modal_unsupported: labels.modal_unsupported,
          modal_open_new_tab: labels.modal_open_new_tab,
        }}
        handleDownload={handleDownload}
      />

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
        onPress={handleDownload}
      >
        <span className="hidden md:inline">{labels.download}</span>
      </Button>

      {/* Tema */}
      <ThemeModeButton locale={labels.currentLang === "ES" ? "es" : "en"} />
    </div>
  );
}
