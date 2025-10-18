# Portafolio - Ismael Berdusán Muñoz

Este repositorio contiene el código de mi portafolio personal publicado en **GitHub Pages**.
Muestra información sobre mi trayectoria, formación, habilidades y las tecnologías que manejo.
El proyecto está construido con **Astro**, **React**, **TypeScript** y **Tailwind CSS**, y es totalmente *responsive*, accesible y adaptado a varios idiomas.

## Demo en línea

Puedes visitar la versión desplegada en GitHub Pages en:
👉 [Ismaber.github.io](https://ismaber.github.io/)

## Tecnologías utilizadas

| Categoría                  | Tecnologías principales                        |
| -------------------------- | ---------------------------------------------- |
| **Frameworks y librerías** | Astro, React, HeroUI                           |
| **Lenguajes**              | TypeScript, JavaScript, HTML5, CSS3            |
| **Estilos**                | Tailwind CSS, HeroUI Themes                    |
| **Internacionalización**   | Astro i18n (diccionarios en `src/i18n/`)       |
| **Iconos**                 | React Icons                                    |
| **Otras herramientas**     | Playwright (generación de PDF), Vite (bundler) |

## Estructura del proyecto

```bash
/public
 ├── curriculum_ismael_berdusan_es.pdf
 ├── curriculum_ismael_berdusan_en.pdf
 └── favicon, robots.txt

/src
 ├── assets        - Recursos gráficos (imagen de perfil)
 ├── components    - Componentes React y Astro (Aside, Header, Section, Snake, etc.)
 ├── constants     - Constantes para juegos y otros componentes
 ├── data          - Listado de herramientas y sus categorías
 ├── i18n          - Diccionarios de traducción y almacén de idioma
 ├── layouts       - Plantillas base para las páginas
 ├── pages         - Páginas de alto nivel en español (`/es`) e inglés (`/en`)
 ├── scripts       - Scripts de utilidad (por ej. `generatePdf.ts`)
 ├── styles        - Estilos globales y utilidades de Tailwind
 └── templates     - Plantillas de secciones reutilizables (Home.astro)
```

## Instalación y uso

Clona este repositorio:

```bash
git clone https://github.com/Ismaber/Ismaber.github.io.git
cd Ismaber.github.io
```

Instala las dependencias:

```bash
npm install
```

Inicia un servidor de desarrollo:

```bash
npm run dev
```

El sitio estará disponible en [http://localhost:4321](http://localhost:4321).

Construye para producción:

```bash
npm run build
```

Los archivos estáticos resultantes se generan en la carpeta `dist/`.

Vista previa de la build:

```bash
npm run preview
```

Generar el PDF del CV (opcional):

```bash
npm run pdf
```

Este script utiliza **Playwright** para renderizar la plantilla PDF y **Ghostscript** para optimizarla.
El PDF generado se guarda en la carpeta `public/` con el nombre correspondiente según el idioma.

## Contribuciones y licencia

Este proyecto es de carácter personal y está pensado como una pequeña demostración de mis habilidades técnicas.
No se ha definido ninguna licencia de código abierto.

Si deseas reutilizar parte del código o tienes alguna sugerencia, puedes:

* Abrir un *issue* en GitHub.
* Contactarme a través de **LinkedIn** o **GitHub**.

🔗 [LinkedIn](https://www.linkedin.com/in/ismael-berdusán-muñoz-a72a41338/)
🔗 [GitHub](https://github.com/Ismaber)
