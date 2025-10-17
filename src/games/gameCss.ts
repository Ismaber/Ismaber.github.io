// styles/gameCss.ts
import { IDS, CLS, sel } from '../constants/game';

const buildGameCss = () => `
  /* Overlay abierto: oculta el botón flotante principal */
  body.${CLS.gameOpen} ${sel.id(IDS.snake.ctrl)} { display: none !important; }

  /* Modo jugador: oculta el botón "Tomar el control" */
  ${sel.id(IDS.snake.overlay)}.${CLS.playerMode} ${sel.id(IDS.snake.takeover)} { display: none !important; }

  /* Joystick: SIEMPRE oculto por defecto (se muestra por media-query abajo) */
  ${sel.id(IDS.snake.joy)} { display: none !important; }

  /* Por defecto: muestra el texto de desktop */
  ${sel.id(IDS.snake.hint)} ${sel.cls(CLS.hintMobile)} { display: none; }

  /* Sólo en dispositivos táctiles (puntero "coarse") y en modo jugador */
  @media (pointer: coarse) {
    ${sel.id(IDS.snake.overlay)}.${CLS.playerMode} ${sel.id(IDS.snake.joy)} {
      display: block !important;
      pointer-events: auto !important;
    }

    ${sel.id(IDS.snake.hint)} ${sel.cls(CLS.hintDesktop)} { display: none; }
    ${sel.id(IDS.snake.hint)} ${sel.cls(CLS.hintMobile)} { display: inline; }
  }

  /* Sólo estilos del snake en modo play (quita máscaras globales) */
  ${sel.cls(CLS.gamePlay)} {
    -webkit-mask-image: none !important;
    mask-image: none !important;
    opacity: .9 !important;
  }

  /* Ocultar/inhabilitar resto de la página al abrir el overlay */
  ${sel.cls(CLS.pageHidden)} {
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
    user-select: none !important;
    transition: opacity .25s ease;
  }

  /* Reduce motion: desactiva animaciones si el usuario lo pide */
  @media (prefers-reduced-motion: reduce) {
    ${sel.id(IDS.snake.layer)},
    ${sel.id(IDS.snake.overlay)} {
      animation: none !important;
    }
  }
`;

export default function injectGameStyles(doc: Document = document) {
  if (doc.head.querySelector('style[data-game-styles="1"]')) return; // evita duplicados
  const style = doc.createElement('style');
  style.setAttribute('data-game-styles', '1');
  style.textContent = buildGameCss();
  doc.head.appendChild(style);
}
