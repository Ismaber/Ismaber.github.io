// src/scripts/generate-pdf.ts
import { chromium } from "playwright";
import { mkdir, readFile, unlink } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { DICTS, type Dict } from "../i18n/dicts";

const OUT_DIR = resolve("public");

// ====== Ajustes de generación/optimización ======
const DEFAULT_PRESET: GSPreset = "ebook"; // screen | ebook | printer | prepress | default
const USE_GOOGLE_FONTS = true;            // pon a false para aún menos peso
const IMG_JPEG_QUALITY = 78;              // 60–85 recomendado
const IMG_TARGET_SIZE = 256;              // lado de la foto (px) para el PDF

// ====== Tipos ======
type GSPreset = "screen" | "ebook" | "printer" | "prepress" | "default";

// ====== Util ======
function getArgPreset(): GSPreset {
  const arg = process.argv.find(a => a.startsWith("--preset="));
  if (!arg) return DEFAULT_PRESET;
  const v = arg.split("=")[1]?.trim().toLowerCase();
  if (v === "screen" || v === "ebook" || v === "printer" || v === "prepress" || v === "default") return v;
  return DEFAULT_PRESET;
}

function gsPresetValue(p: GSPreset): string {
  return `/${p}`;
}

function findGsExecutable(): string | null {
  const candidates = process.platform === "win32"
    ? ["gswin64c.exe", "gswin32c.exe", "gswin64c", "gswin32c", "gs.exe", "gs"]
    : ["gs"];
  const { PATH = "" } = process.env;
  const sep = process.platform === "win32" ? ";" : ":";
  for (const dir of PATH.split(sep)) {
    for (const name of candidates) {
      const full = resolve(dir || ".", name);
      try {
        require("fs").accessSync(full);
        return full;
      } catch {}
    }
  }
  return candidates[0] ?? null;
}

async function optimizeWithGhostscript(srcPdf: string, dstPdf: string, preset: GSPreset): Promise<void> {
  const gs = findGsExecutable();
  if (!gs) {
    console.warn("⚠️  Ghostscript no encontrado en PATH. Se deja el PDF sin optimizar.");
    await require("fs").promises.copyFile(srcPdf, dstPdf);
    return;
  }
  await new Promise<void>((resolvePromise, reject) => {
    const args = [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.6",
      `-dPDFSETTINGS=${gsPresetValue(preset)}`,
      "-dDetectDuplicateImages=true",
      "-dDownsampleColorImages=true",
      "-dColorImageDownsampleType=/Bicubic",
      "-dColorImageResolution=150",
      "-dDownsampleGrayImages=true",
      "-dGrayImageDownsampleType=/Bicubic",
      "-dGrayImageResolution=150",
      "-dDownsampleMonoImages=true",
      "-dMonoImageDownsampleType=/Subsample",
      "-dMonoImageResolution=300",
      "-dEmbedAllFonts=true",
      "-dSubsetFonts=true",
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      `-sOutputFile=${dstPdf}`,
      srcPdf,
    ];
    const child = spawn(gs, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`Ghostscript salió con código ${code}`));
    });
  });
}

// ====== HTML Template (con FontAwesome) ======
function tpl(d: Dict, imgSrc: string) {
  const lang = d === DICTS.es ? "es" : "en";

  const googleFonts = USE_GOOGLE_FONTS
    ? `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet">`
    : "";

  const fontFamily = USE_GOOGLE_FONTS
    ? `'Lato', sans-serif`
    : `system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`;

  return /* html */ `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${d.title}</title>

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- FontAwesome (restaurado) -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">

  ${googleFonts}

  <style>
    * , *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    html, body, .font-sans { font-family: ${fontFamily} !important; }

    @media print { @page { size: A4; margin: 0; } }

    body {
      background: #111827; /* bg-gray-900 */
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh;
    }

    a.link {
      color: inherit; text-decoration: underline;
    }

    .page {
      width: 210mm; height: 297mm; margin: 0 auto; overflow: hidden;
      display: flex; justify-content: center; align-items: center;
    }

    .icon { width: 24px; height: 24px; display: inline-flex; justify-content: center; align-items: center; font-size: 1rem; }

    .section-title { position: relative; margin-bottom: 0.5rem; }
    .section-title::after {
      content: ''; display: block; width: 100%; height: 3px;
      background: linear-gradient(to right, #312e81, #6366f1, #c7d2fe); margin-top: 2px;
    }

    @media print {
      html, body { height: auto; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body class="mx-auto font-sans text-sm">
  <div class="page">
    <div class="max-w-5xl bg-white flex overflow-hidden h-full">
      <!-- Lateral -->
      <aside class="w-1/3 bg-indigo-900 text-white p-6 flex flex-col relative border-r-4 border-indigo-200">
        <div class="absolute top-0 right-0 w-1 bg-indigo-500 h-full"></div>

        <img src="${imgSrc}"
             class="bg-white aspect-square w-full max-w-[200px] rounded-full mb-6 self-center object-cover shadow-xl border-4 border-indigo-200 ring-4 ring-indigo-500"
             alt="${d.profile.alt}" />

        <h2 class="text-2xl font-bold mb-2 text-center">Ismael Berdusán Muñoz</h2>
        <p class="text-lg text-center italic">${d.headline}</p>

        <div class="mt-8 text-left">
          <h3 class="text-xl font-bold mb-3">
            <i class="fa-solid fa-id-card mr-2"></i><span>${d.sections.contact}</span>
          </h3>
          <div class="mt-6 space-y-3">
            <p class="flex items-center space-x-1 no-abs">
              <span class="icon"><i class="fas fa-code"></i></span>
              <a
                class="link"
                href="https://Ismaber.github.io"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visitar web de Ismael"
              >
                Ismaber.github.io
              </a>
            </p>

            <p class="flex items-center space-x-1 no-abs">
              <span class="icon"><i class="fas fa-envelope"></i></span>
              <a
                class="link"
                href="mailto:ismael2822001@gmail.com"
                aria-label="Enviar correo a Ismael"
              >
                ismael2822001@gmail.com
              </a>
            </p>

            <p class="flex items-center space-x-1 no-abs">
              <span class="icon"><i class="fas fa-map-marker-alt"></i></span>
              <a
                class="link"
                href="https://www.google.com/maps/place/Zaragoza/@41.6488,-0.8891,12z"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver ubicación de Zaragoza en Google Maps"
              >
                <span>${d.location.city}</span>
              </a>
            </p>

            <p class="flex items-center space-x-1 no-abs">
              <span class="icon"><i class="fa-brands fa-linkedin"></i></span>
              <a 
                class="link"
                href="https://www.linkedin.com/in/ismael-berdusán-muñoz-a72a41338/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver Linkedin de Ismael"
              >
                Ismael Berdusán Muñoz
              </a>
            </p>

            <p class="flex items-center space-x-1 no-abs">
              <span class="icon"><i class="fa-brands fa-github"></i></span>
              <a 
                class="link"
                href="https://github.com/Ismaber"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver Github de Ismael"
              >
                Ismaber
              </a>
            </p>
          </div>                
        </div>

        <div class="mt-8 text-left">
          <h3 class="text-xl font-bold mb-3">
            <i class="fa-solid fa-language mr-2"></i><span>${d.sections.languages}</span>
          </h3>
          <ul class="text-base space-y-2">
            <li><span>${d.languages.es}</span></li>
            <li><span>${d.languages.en}</span></li>
          </ul>
        </div>

        <div class="mt-8 text-left">
          <h3 class="text-xl font-bold mb-3">
            <i class="fa-solid fa-toolbox mr-2"></i><span>${d.sections.skills}</span>
          </h3>
          <ul class="text-base space-y-2">
            <li class="bg-white rounded-lg text-gray-700 px-2 py-1 w-min whitespace-nowrap">${d.skills.teamwork}</li>
            <li class="bg-white rounded-lg text-gray-700 px-2 py-1 w-min whitespace-nowrap">${d.skills.troubleshooting}</li>
            <li class="bg-white rounded-lg text-gray-700 px-2 py-1 w-min whitespace-nowrap">${d.skills.detail}</li>
            <li class="bg-white rounded-lg text-gray-700 px-2 py-1 w-min whitespace-nowrap">${d.skills.self}</li>
            <li class="bg-white rounded-lg text-gray-700 px-2 py-1 w-min whitespace-nowrap">${d.skills.learning}</li>
            <li class="bg-white rounded-lg text-gray-700 px-2 py-1 w-min whitespace-nowrap">${d.skills.initiative}</li>
          </ul>
        </div>
      </aside>

      <!-- Principal -->
      <main class="w-2/3 p-6">
        <!-- Sobre mí -->
        <h2 class="text-xl font-bold text-indigo-900 section-title">
          <i class="fa-solid fa-circle-user mr-2"></i><span>${d.sections.about}</span>
        </h2>
        <div class="text-gray-700 mb-4">${d.about.text}</div>

        <!-- Experiencia -->
        <div class="mb-6">
          <h2 class="text-xl font-bold text-indigo-900 section-title">
            <i class="fa-solid fa-briefcase mr-2"></i><span>${d.sections.experience}</span>
          </h2>
          <ul class="mt-2 text-gray-700">
            ${d.experience.items.map(it => `
              <li class="text-lg font-semibold">${it.role}</li>
              <li class="font-semibold italic mb-2">
                <span>${it.place}</span>,
                <span class="font-normal">${it.date}</span>
              </li>
              <div class="ml-4 pl-2 space-y-2 border-l-2 border-indigo-900 ring-l-2 ring-indigo-800">
                <li><p>${it.desc}</p></li>
              </div>
            `).join("")}
          </ul>
        </div>

        <!-- Educación -->
        <div class="mb-6">
          <h2 class="text-xl font-bold text-indigo-900 section-title">
            <i class="fa-solid fa-graduation-cap mr-2"></i><span>${d.sections.education}</span>
          </h2>
          <ul class="mt-2 text-gray-700">
            <li class="text-lg font-semibold">${d.education.degree}</li>
            <li class="font-semibold italic mb-2">
              <span>${d.education.place}</span>,
              <span class="font-normal">${d.education.date}</span>
            </li>
            <div class="ml-4 pl-2 space-y-2 border-l-2 border-indigo-900 ring-l-2 ring-indigo-800">
              <li>
                <div class="text-lg font-semibold">${d.education.tracks.sys.title}</div>
                <p>${d.education.tracks.sys.desc}</p>
              </li>
              <li>
                <div class="text-lg font-semibold">${d.education.tracks.db.title}</div>
                <p>${d.education.tracks.db.desc}</p>
              </li>
              <li>
                <div class="text-lg font-semibold">${d.education.tracks.web.title}</div>
                <p>${d.education.tracks.web.desc}</p>
              </li>
            </div>
          </ul>
        </div>

        <!-- Herramientas -->
        <div class="mb-6">
          <h2 class="text-xl font-bold text-indigo-900 section-title">
            <i class="fa-solid fa-wrench mr-2"></i><span>${d.sections.tools}</span>
          </h2>
          <div class="mt-4 font-bold text-gray-700 grid grid-cols-4 gap-x-4">
            <ul class="space-y-2">
              <li>Python</li>
              <li>Kotlin</li>
              <li>C</li>
              <li>C++</li>
              <li>Java</li>
            </ul>
            <ul class="space-y-2">
              <li>Ubuntu</li>
              <li>Linux</li>
              <li>Centos</li>
              <li>Shell</li>
              <li>KVM / QEMU</li>
            </ul>
            <ul class="space-y-2">
              <li>Docker</li>
              <li>Docker Compose</li>
              <li>Git</li>
              <li>Github Actions</li>
              <li>CI/CD</li>
            </ul>
            <ul class="space-y-2">
              <li>OpenStack</li>
              <li>JavaScript</li>
              <li>React</li>
              <li>Next.js</li>
              <li>SQL</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  </div>
</body>
</html>`;
}

// ====== Generación por idioma ======
async function make(lang: "es" | "en", outNiceName: string, preset: GSPreset) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewportSize({ width: 900, height: 1300 });
  await page.emulateMedia({ media: "print" });
  await mkdir(join(OUT_DIR), { recursive: true });

  // Foto: aplastar transparencia a blanco para evitar "fondo negro" en JPEG.
  let imgDataUrl: string;
  try {
    const sharp = await import("sharp");
    const buf = await sharp.default(resolve("src/assets/profile.webp"))
      .resize(IMG_TARGET_SIZE, IMG_TARGET_SIZE, { fit: "cover" })
      .flatten({ background: "#ffffff" })   // <- clave para evitar negro
      .jpeg({ quality: IMG_JPEG_QUALITY, mozjpeg: true })
      .toBuffer();
    imgDataUrl = `data:image/jpeg;base64,${buf.toString("base64")}`;
  } catch {
    // fallback: PNG original (puede pesar algo más, pero respeta alfa)
    const imgBuffer = await readFile(resolve("public/foto.png"));
    imgDataUrl = `data:image/png;base64,${imgBuffer.toString("base64")}`;
  }

  const html = tpl(DICTS[lang], imgDataUrl);
  await page.setContent(html, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("load");
  await page.evaluate(async () => {
    try { if ((document as any).fonts?.ready) await (document as any).fonts.ready; } catch {}
  });
  await page.waitForTimeout(150);

  // RAW temporal
  const rawPath = join(OUT_DIR, `__raw_${lang}.pdf`);
  await page.pdf({
    path: rawPath,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
    width: "210mm",
    height: "297mm",
  });

  await browser.close();

  // Optimiza con Ghostscript
  const finalPath = join(OUT_DIR, outNiceName);
  await optimizeWithGhostscript(rawPath, finalPath, preset);

  // Limpieza
  try { await unlink(rawPath); } catch {}
  console.log(`✓ ${lang.toUpperCase()} -> ${finalPath}`);
}

// ====== Main ======
(async () => {
  const preset = getArgPreset();
  await make("es", "curriculum_ismael_berdusan_es.pdf", preset);
  await make("en", "curriculum_ismael_berdusan_en.pdf", preset);
})();
