import { chromium } from "playwright";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { DICTS } from "../i18n/dicts";
import { TOOLS } from "../data/tools";

const OUT_DIR = resolve("public");
const NAME = "curriculum_ismael_berdusan";
const LANGS = ["es", "en"] as const;

// Ajustes
const DEFAULT_PRESET = "ebook";
const USE_GOOGLE_FONTS = true;
const IMG_JPEG_QUALITY = 78;
const IMG_TARGET_SIZE = 256;

const tplPath = resolve("src/scripts/cv.html");

// ---------- HELPERS ----------

const chip = (text: string) => `
  <span class="chip">${text}</span>
`;

const chips = (arr: string[]) => arr.map(chip).join("");

const contactItem = (icon: string, href: string, label: string) => `
  <div class="contact-item">
    <i class="${icon}"></i>
    <a href="${href}" class="contact-link" target="_blank">${label}</a>
  </div>
`;

function loadTemplate(path: string, vars: Record<string, string>) {
  return readFile(path, "utf8").then(html =>
    Object.entries(vars).reduce(
      (acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v),
      html
    )
  );
}

// ---------- Ghostscript ----------

function findGsExecutable() {
  const candidates = process.platform === "win32"
    ? ["gswin64c.exe", "gswin32c.exe", "gs"]
    : ["gs"];

  const { PATH = "" } = process.env;
  const sep = process.platform === "win32" ? ";" : ":";

  for (const dir of PATH.split(sep)) {
    for (const name of candidates) {
      try {
        const full = resolve(dir || ".", name);
        require("fs").accessSync(full);
        return full;
      } catch {}
    }
  }
  return null;
}

async function optimizeWithGhostscript(src: string, dst: string, preset: string) {
  const gs = findGsExecutable();
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
    "-dDownsampleMonoImages=true",
    "-dMonoImageResolution=300",
    "-dEmbedAllFonts=true",
    "-dSubsetFonts=true",
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    `-sOutputFile=${dst}`,
    src
  ];

  await new Promise<void>((resolve, reject) => {
    const child = spawn(gs, args, { stdio: "inherit" });
    child.on("exit", code => (code === 0 ? resolve() : reject(new Error("Ghostscript error"))));
    child.on("error", reject);
  });
}

// ---------- MAIN GENERATOR ----------

async function make(lang: "es" | "en", outFile: string, preset: string) {
  const d = DICTS[lang];
  await mkdir(OUT_DIR, { recursive: true });

  // Imagen
  let imgDataUrl = "";
  try {
    const sharp = await import("sharp");
    const buf = await sharp.default(resolve("src/assets/profile.webp"))
      .resize(IMG_TARGET_SIZE, IMG_TARGET_SIZE, { fit: "cover" })
      .flatten({ background: "#fff" })
      .jpeg({ quality: IMG_JPEG_QUALITY, mozjpeg: true })
      .toBuffer();
    imgDataUrl = `data:image/jpeg;base64,${buf.toString("base64")}`;
  } catch {
    const pngBuf = await readFile(resolve("public/foto.png"));
    imgDataUrl = `data:image/png;base64,${pngBuf.toString("base64")}`;
  }

  // Bloques dinámicos
  const contactHTML = [
    contactItem("fas fa-code text-indigo-500", "https://Ismaber.github.io", "Ismaber.github.io"),
    contactItem("fas fa-envelope text-indigo-500", "mailto:ismael2822001@gmail.com", "ismael2822001@gmail.com"),
    contactItem("fas fa-map-marker-alt text-indigo-500", "https://www.google.com/maps/place/Zaragoza/", d.location.city),
    contactItem("fa-brands fa-linkedin text-indigo-500", "https://www.linkedin.com/in/ismael-berdusán-muñoz-a72a41338/", "Ismael Berdusán Muñoz"),
    contactItem("fa-brands fa-github text-indigo-500", "https://github.com/Ismaber", "Ismaber")
  ].join("");

  const skillsHTML = chips([
    d.skills.teamwork,
    d.skills.troubleshooting,
    d.skills.detail,
    d.skills.self,
    d.skills.learning,
    d.skills.initiative
  ]);

  // 👇 importante: se llama igual que en la plantilla: {{languagesHTML}}
  const languagesHTML = chips([d.languages.es, d.languages.en]);

  const experienceHTML = `
    <ul class="text-gray-700">
      ${d.experience.items.map(it => `
        <li class="text-lg font-semibold">${it.role}</li>
        <li class="italic mb-2"><span class="font-semibold">${it.place}</span>, ${it.date}</li>
        <div class="exp-block">
          <p>${it.desc}</p>
        </div>
      `).join("")}
    </ul>
  `;

  const educationHTML = `
    <ul class="text-gray-700">
      <li class="text-lg font-semibold">${d.education.degree}</li>
      <li class="italic mb-2"><span class="font-semibold">${d.education.place}</span>, ${d.education.date}</li>
      <div class="exp-block">
        ${(["sys", "db", "web"] as const).map(key => `
          <li>
            <div class="text-lg font-semibold">${d.education.tracks[key].title}</div>
            <p>${d.education.tracks[key].desc}</p>
          </li>
        `).join("")}
      </div>
    </ul>
  `;

  const toolsHTML = chips(TOOLS.map(t => t.label));

  const fontFamily = USE_GOOGLE_FONTS
    ? `'Lato', sans-serif`
    : `system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`;

  const googleFonts = USE_GOOGLE_FONTS
    ? `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet">
  `
    : "";

  const html = await loadTemplate(tplPath, {
    lang,
    title: d.title,

    googleFonts,
    fontFamily,

    imgSrc: imgDataUrl,
    profileAlt: d.profile.alt,
    name: "Ismael Berdusán Muñoz",
    headline: d.headline,

    // títulos de secciones (que te faltaban)
    aboutTitle: d.sections.about,
    experienceTitle: d.sections.experience,
    educationTitle: d.sections.education,
    skillsTitle: d.sections.skills,
    toolsTitle: d.sections.tools,

    aboutText: d.about.text,

    contactHTML,
    languagesHTML,
    skillsHTML,
    experienceHTML,
    educationHTML,
    toolsHTML,
  });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 900, height: 1300 });
  await page.emulateMedia({ media: "print" });
  await page.setContent(html, { waitUntil: "load" });
  await page.waitForTimeout(150);

  const raw = join(OUT_DIR, `__raw_${lang}.pdf`);
  await page.pdf({
    path: raw,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "2mm", bottom: "0", left: "0", right: "2mm" },
    width: "210mm",
    height: "297mm"
  });

  await browser.close();

  await optimizeWithGhostscript(raw, join(OUT_DIR, outFile), preset);
  await unlink(raw);
}

// MAIN
(async () => {
  const preset = process.argv.find(a => a.startsWith("--preset="))?.split("=")[1] || DEFAULT_PRESET;
  for (const lang of LANGS) {
    const out = `${NAME}_${lang}.pdf`;
    const fullPath = join(OUT_DIR, out);

    console.log(`Generando PDF para ${lang.toUpperCase()}...`);
    await make(lang, out, preset);

    console.log(`${lang.toUpperCase()} -> ${fullPath}`);
  }
})();
