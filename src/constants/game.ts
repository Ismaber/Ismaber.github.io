// constants/game.ts
export const IDS = {
  pageShell: 'page-shell',
  backgroundRoot: 'background-root',
  snake: {
    layer: 'game-layer',
    overlay: 'game-overlay',
    ctrl: 'game-ctrl',
    exit: 'game-exit',
    takeover: 'game-takeover',
    bgCanvas: 'game-bg',
    playCanvas: 'game-play',
    joy: 'game-joy',
    joyBase: 'joy-base',
    joyStick: 'joy-stick',
    hint: 'game-hint',
  },
} as const;

export const CLS = {
  gameOpen: 'game-open',
  playerMode: 'player-mode',
  pageHidden: 'page-hidden',
  gamePlay: 'game-play',
  hintDesktop: 'hint-desktop',
  hintMobile: 'hint-mobile',
} as const;

type IdKeys  = typeof IDS[keyof typeof IDS] | typeof IDS.snake[keyof typeof IDS.snake];
type ClsKeys = typeof CLS[keyof typeof CLS];

export const sel = {
  id: (id: IdKeys) => `#${id}`,
  cls: (c: ClsKeys) => `.${c}`,
};
