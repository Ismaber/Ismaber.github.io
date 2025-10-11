// src/components/PdfModalButton.tsx

import { useEffect, useRef, useState } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { FaFileLines, FaFileArrowDown, FaXmark } from "react-icons/fa6";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import "pdfjs-dist/web/pdf_viewer.css";

interface PdfModalButtonProps {
  pdfUrl: string;
  labels: {
    view_portfolio: string;
    modal_title: string;
    modal_download: string;
    modal_unsupported: string;
    modal_open_new_tab: string;
  };
}

export default function PdfModalButton({ pdfUrl, labels }: PdfModalButtonProps) {
  const [pdfOpen, setPdfOpen] = useState(false);

  function browserSupportsPdfEmbedding() {
    return typeof navigator !== "undefined" &&
      navigator.userAgent.match(/(iPad|iPhone|Android)/) === null;
  }
  const isMobileOrNoSupport = !browserSupportsPdfEmbedding();

  return (
    <>
      <Button
        startContent={<FaFileLines />}
        color="primary"
        className="px-3 py-2 min-h-10 min-w-10"
        onPress={() => setPdfOpen(true)}
      >
        <span className="hidden md:inline">{labels.view_portfolio}</span>
      </Button>

      <Modal
        hideCloseButton
        isOpen={pdfOpen}
        onOpenChange={setPdfOpen}
        size="5xl"
        placement="center"
        scrollBehavior="inside"
        backdrop="blur"
        classNames={{
          wrapper: "z-[120]",
          backdrop: "z-[115] backdrop-blur-md bg-black/35 dark:bg-black/50",
          base:
            "z-[121] rounded-2xl shadow-2xl !p-0 " +
            "!w-[90svw] !max-w-[90svw] sm:!max-w-5xl " +
            "bg-white/50 backdrop-blur-md " +
            "border border-slate-200 " +
            "dark:bg-slate-900/50 " +
            "dark:border-slate-800",
          header: "px-5 py-3",
          body: "p-0 bg-transparent",
          footer: "px-5 py-3",
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
                  <FaXmark />
                </Button>
              </ModalHeader>
              <ModalBody>
                {isMobileOrNoSupport ? (
                  <PdfViewerClient url={pdfUrl} className="h-[75vh]" />
                ) : (
                  <iframe
                    title={labels.modal_title}
                    src={pdfUrl}
                    className="w-full h-[75vh] sm:h-[80vh]"
                    loading="lazy"
                    allow="fullscreen"
                  />
                )}
                <noscript>
                  <p className="p-4">
                    {labels.modal_unsupported}{" "}
                    <a
                      className="underline"
                      href={pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {labels.modal_open_new_tab}
                    </a>
                    .
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
    </>
  );
}

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface Props {
  url: string;
  className?: string;
}

function PdfViewerClient({ url, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderPDF() {
      try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const container = containerRef.current;
        if (!container) return;

        // Ancho visible del contenedor (CSS)
        const containerWidth = container.clientWidth;

        // Viewport base y escala para encajar al ancho
        const viewport1 = page.getViewport({ scale: 1 });
        const scale = containerWidth / viewport1.width;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        // HiDPI
        const ratio = window.devicePixelRatio || 1;

        // Tamaño del canvas (backing store) y tamaño mostrado por CSS
        canvas.width = Math.floor(viewport.width * ratio);
        canvas.height = Math.floor(viewport.height * ratio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        // Transform para que PDF.js renderice nítido en pantallas HiDPI
        const transform : number[] | undefined = ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : undefined;

        const task = page.render({
          canvas,     // <-- requerido en v4
          viewport,
          transform,  // <-- opcional (HiDPI)
          // background: "rgba(0,0,0,0)", // si quieres fondo transparente
        });

        await task.promise;
      } catch (err: any) {
        console.error("PDF render error:", err);
        if (!cancelled) setError("Error al cargar el PDF");
      }
    }

    renderPDF();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div ref={containerRef} className={className ?? ""} style={{ width: "100%" }}>
      {error ? (
        <div className="p-4 text-red-600">{error}</div>
      ) : (
        <canvas ref={canvasRef} style={{ width: "100%", height: "auto" }} />
      )}
    </div>
  );
}
