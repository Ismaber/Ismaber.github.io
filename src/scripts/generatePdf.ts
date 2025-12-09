import { chromium, type Page } from "playwright";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import QRCode from "qrcode";

import { DICTS } from "../i18n/dicts";
import { TOOLS } from "../data/tools";

// ============================================================================
// Configuración global
// ============================================================================

const CONFIG = {
  OUT_DIR: resolve("public"),
  NAME: "curriculum_ismael_berdusan",
  LANGS: ["es", "en"] as const,
  DEFAULT_PRESET: "ebook",
  USE_GOOGLE_FONTS: true,
  IMG_JPEG_QUALITY: 78,
  IMG_TARGET_SIZE: 256,
  TEMPLATE_PATH: resolve("src/scripts/cv.html"),
  SITE_URL: "https://Ismaber.github.io",
  PHONE_NUMBER: "+34 617 27 07 25",
  TEL_PHONE_NUMBER: "tel:+34617270725",
};

// ============================================================================
// Utilidades — Helpers
// ============================================================================

/**
 * Carga y renderiza la plantilla HTML reemplazando {{vars}}
 */
async function renderTemplate(
  path: string,
  vars: Record<string, string>
): Promise<string> {
  const html = await readFile(path, "utf8");
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v),
    html
  );
}

/** Devuelve HTML de un chip */
const chip = (text: string) => `<span class="chip">${text}</span>`;
const chips = (arr: string[]) => arr.map(chip).join("");

/** Devuelve HTML de un item de contacto */
const contactItem = (icon: string, href: string, label: string) => `
  <div class="contact-item">
    <i class="${icon}"></i>
    <a class="contact-link" href="${href}" target="_blank">${label}</a>
  </div>
`;

// ============================================================================
// Generación de QR
// ============================================================================

async function generateQR(url: string, size = 256): Promise<string> {
  const opts: QRCode.QRCodeToBufferOptions = {
    errorCorrectionLevel: "H",
    type: "png",
    width: size,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  };

  const png = await QRCode.toBuffer(url, opts);
  return `data:image/png;base64,${png.toString("base64")}`;
}

// ============================================================================
// Procesado de imágenes
// ============================================================================

/**
 * Devuelve la foto de perfil como dataURL optimizado
 */
async function getProfileImage(): Promise<string> {
  try {
    const sharp = (await import("sharp")).default;

    const buffer = await sharp(resolve("src/assets/profile.webp"))
      .resize(CONFIG.IMG_TARGET_SIZE, CONFIG.IMG_TARGET_SIZE, {
        fit: "cover",
      })
      .flatten({ background: "#fff" })
      .jpeg({ quality: CONFIG.IMG_JPEG_QUALITY, mozjpeg: true })
      .toBuffer();

    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch {
    // fallback
    const fallback = await readFile(resolve("public/foto.png"));
    return `data:image/png;base64,${fallback.toString("base64")}`;
  }
}

// ============================================================================
// Ghostscript PDF optimization
// ============================================================================

function findGhostscript(): string | null {
  const candidates = process.platform === "win32"
    ? ["gswin64c.exe", "gswin32c.exe", "gs"]
    : ["gs"];

  const sep = process.platform === "win32" ? ";" : ":";
  const dirs = (process.env.PATH ?? "").split(sep);

  for (const dir of dirs) {
    for (const bin of candidates) {
      const full = resolve(dir || ".", bin);
      try {
        require("fs").accessSync(full);
        return full;
      } catch {}
    }
  }
  return null;
}

async function optimizePDF(src: string, dst: string, preset: string) {
  const gs = findGhostscript();

  if (!gs) {
    await writeFile(dst, await readFile(src));
    return;
  }

  const args = [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.6",
    `-dPDFSETTINGS=/${preset}`,
    "-dDetectDuplicateImages=true",
    "-dDownsampleColorImages=true",
    "-dColorImageDownsampleType=/Bicubic",
    "-dColorImageResolution=150",
    "-dEmbedAllFonts=true",
    "-dSubsetFonts=true",
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    `-sOutputFile=${dst}`,
    src,
  ];

  await new Promise<void>((resolve, reject) => {
    const proc = spawn(gs, args, { stdio: "inherit" });

    proc.on("exit", code =>
      code === 0 ? resolve() : reject(new Error("Ghostscript failed"))
    );
    proc.on("error", reject);
  });
}

// ============================================================================
// Generación HTML y PDF
// ============================================================================

async function buildHTML(lang: "es" | "en"): Promise<string> {
  const dict = DICTS[lang];

  const profileImage = await getProfileImage();
  const qr = await generateQR(CONFIG.TEL_PHONE_NUMBER, 240);

  const contactHTML = [
    contactItem("fas fa-envelope text-indigo-500", "mailto:ismael2822001@gmail.com", "ismael2822001@gmail.com"),
    contactItem("fas fa-map-marker-alt text-indigo-500", "https://www.google.com/maps/place/Zaragoza/", dict.location.city),
    contactItem("fas fa-code text-indigo-500", CONFIG.SITE_URL, "Ismaber.github.io"),
    contactItem("fa-brands fa-linkedin text-indigo-500", "https://www.linkedin.com/in/ismael-berdusán-muñoz-a72a41338/", "Ismael Berdusán Muñoz"),
    contactItem("fa-brands fa-github text-indigo-500", "https://github.com/Ismaber", "Ismaber"),
  ].join("");

  const skillsHTML = chips(Object.values(dict.skills));
  const languagesHTML = chips([dict.languages.es, dict.languages.en]);
  const toolsHTML = chips(TOOLS.map(t => t.label));

  const experienceHTML = `
    <ul class="text-gray-700">
      ${dict.experience.items
        .map(
          it => `
        <li class="text-lg font-semibold">${it.role}</li>
        <li class="italic mb-2"><span class="font-semibold">${it.place}</span>, ${it.date}</li>
        <div class="exp-block"><p>${it.desc}</p></div>
      `
        )
        .join("")}
    </ul>
  `;

  const educationHTML = `
    <ul class="text-gray-700">
      <li class="text-lg font-semibold">${dict.education.degree}</li>
      <li class="italic mb-2"><span class="font-semibold">${dict.education.place}</span>, ${dict.education.date}</li>
      <div class="exp-block">
        ${(["sys", "db", "web"] as const)
          .map(
            t => `
          <li>
            <div class="text-lg font-semibold">${dict.education.tracks[t].title}</div>
            <p>${dict.education.tracks[t].desc}</p>
          </li>
        `
          )
          .join("")}
      </div>
    </ul>
  `;

  const googleFonts = CONFIG.USE_GOOGLE_FONTS
    ? `
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet">
    `
    : "";

  return renderTemplate(CONFIG.TEMPLATE_PATH, {
    lang,
    title: dict.title,
    googleFonts,
    fontFamily: CONFIG.USE_GOOGLE_FONTS ? `'Lato', sans-serif` : "system-ui",
    imgSrc: profileImage,
    qrSrc: qr,
    phoneNumber: CONFIG.PHONE_NUMBER,
    profileAlt: dict.profile.alt,
    name: "Ismael Berdusán Muñoz",
    headline: dict.headline,
    aboutTitle: dict.sections.about,
    aboutText: dict.about.text,
    experienceTitle: dict.sections.experience,
    educationTitle: dict.sections.education,
    skillsTitle: dict.sections.skills,
    toolsTitle: dict.sections.tools,
    contactHTML,
    skillsHTML,
    languagesHTML,
    toolsHTML,
    experienceHTML,
    educationHTML,
  });
}

/**
 * Genera un PDF para un idioma
 */
async function generatePDF(page: Page, lang: "es" | "en", file: string, preset: string) {
  const html = await buildHTML(lang);

  await page.setContent(html, { waitUntil: "load" });
  await page.waitForTimeout(150);

  const tmp = join(CONFIG.OUT_DIR, `__raw_${lang}.pdf`);
  const output = join(CONFIG.OUT_DIR, file);

  await page.pdf({
    path: tmp,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "2mm", bottom: "0", left: "0", right: "2mm" },
    width: "210mm",
    height: "297mm",
  });

  await optimizePDF(tmp, output, preset);

  await unlink(tmp);
}

// ============================================================================
// MAIN
// ============================================================================

(async () => {
  const preset =
    process.argv.find(a => a.startsWith("--preset="))?.split("=")[1] ||
    CONFIG.DEFAULT_PRESET;

  console.log("Generando PDFs...\n");

  await mkdir(CONFIG.OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  const pages = await Promise.all(CONFIG.LANGS.map(() => browser.newPage()));

  await Promise.all(
    CONFIG.LANGS.map(async (lang, i) => {
      const page = pages[i];
      const fileName = `${CONFIG.NAME}_${lang}.pdf`;
      const fullPath = join(CONFIG.OUT_DIR, fileName);

      console.log(`Iniciando ${lang.toUpperCase()}`);

      await generatePDF(page, lang, fileName, preset);

      console.log(`${lang.toUpperCase()} -> ${fullPath}`);
    })
  );

  await browser.close();
  console.log("\nPDFs generados correctamente.");
})();
