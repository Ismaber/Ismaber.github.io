import { type ReactNode } from "react";
import { Button } from "@heroui/react";
import { GiSnake } from "react-icons/gi";
import { FaBomb } from "react-icons/fa";
import { MdKeyboardReturn } from "react-icons/md";
import { t } from "../i18n/store";
import type { Locale } from "../i18n/dicts";

export type Game = "snake" | "msweep";

type BaseProps = {
  className?: string;
  onClick?: () => void;
  locale?: Locale;
};

type CtrlProps = BaseProps & {
  game: Game;
};

// --- estilos comunes
const baseBox =
  "inline-flex items-center justify-center rounded-2xl " +
  "backdrop-blur-xl backdrop-saturate-150 " +
  "bg-white/40 dark:bg-slate-900/40 " +
  "border border-white/20 dark:border-slate-700/60 " +
  "shadow-xl hover:shadow-2xl hover:border-primary-800/50 dark:hover:border-primary-200/50 " +
  "transition z-40";

const posCtrl     = "fixed bottom-20 md:bottom-4 left-4 size-14";
const posExit     = "fixed top-4 right-4 size-14";
const posTakeover = "fixed bottom-4 left-1/2 -translate-x-1/2 h-14 px-2";

// --- iconos por juego para ctrl
const ctrlIcon: Record<Game, ReactNode> = {
  snake:  <GiSnake />,
  msweep: <FaBomb  />,
};

// --- núcleo privado para no repetir
function Box({
  id, title, className = "", onClick, children,
}: { id: string; title: string; className?: string; onClick?: () => void; children: ReactNode; }) {
  return (
    <div id={id} className={[baseBox, className].join(" ")} onClick={onClick}>
      <Button
        type="button"
        aria-pressed="false"
        title={title}
        aria-label={title}
        variant="ghost"
        color="primary"
        className="size-10"
        isIconOnly
      >
        {children}
      </Button>
    </div>
  );
}

// --- FABs públicos: uno por acción

export function GameCtrlFab({ game, className, onClick, locale }: CtrlProps) {
  const loc = (locale ?? "es") as Locale;
  const id = "game-ctrl";
  const computedTitle = t(loc, "games.ctrl") as string;

  return (
    <Box
      id={id}
      title={computedTitle}
      className={[posCtrl, className ?? ""].join(" ")}
      onClick={onClick}
    >
      {ctrlIcon[game]}
    </Box>
  );
}

export function GameExitFab({ className, onClick, locale }: BaseProps) {
  const loc = (locale ?? "es") as Locale;
  const id = "game-exit";
  const computedTitle = t(loc, "games.exit") as string;

  return (
    <Box
      id={id}
      title={computedTitle}
      className={[posExit, className ?? ""].join(" ")}
      onClick={onClick}
    >
      <MdKeyboardReturn />
    </Box>
  );
}

export function GameTakeoverFab({ className, onClick, locale }: BaseProps) {
  const loc = (locale ?? "es") as Locale;
  const id = "game-takeover";
  const label = t(loc, "games.takeover") as string;

  return (
    <div id={id} className={[baseBox, posTakeover, className ?? ""].join(" ")} onClick={onClick}>
      <Button
        type="button"
        aria-pressed="false"
        title={label}
        aria-label={label}
        variant="ghost"
        color="primary"
        className="px-4 text-sm font-medium"
      >
        {label}
      </Button>
    </div>
  );
}
