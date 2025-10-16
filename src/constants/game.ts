// IDs y clases "globales" del proyecto
export const IDS = {
  pageShell: 'page-shell',
  backgroundRoot: 'background-root',
  snake: {
    layer: 'snake-layer',
    overlay: 'snake-overlay',
    ctrl: 'snake-ctrl',
    exit: 'snake-exit',
    takeover: 'snake-takeover',
    bgCanvas: 'snake-bg',
    playCanvas: 'snake-play',
    joy: 'snake-joy',
    joyBase: 'joy-base',
    joyStick: 'joy-stick',
    hint: 'snake-hint',
  },
} as const;

// Helpers opcionales
export type IdKey = keyof typeof IDS | keyof typeof IDS.snake;
export const sel = (id: string) => `#${id}`;
