import {type ReactNode} from "react";
import {Button} from "@heroui/react";
import {FaBackward} from "react-icons/fa6";
import {GiSnake} from "react-icons/gi";
import {FaBomb} from "react-icons/fa";

export type Game = "snake" | "msweep";

type BaseProps = {
  game: Game;
  title?: string;
  className?: string;
  onClick?: () => void; // opcional: tu JS ya hace addEventListener por id
};

type TakeoverProps = Omit<BaseProps, "title"> & {
  takeoverLabel?: string;
};

// --- estilos comunes
const baseBox =
  "inline-flex items-center justify-center rounded-2xl " +
  "backdrop-blur-xl backdrop-saturate-150 " +
  "bg-white/40 dark:bg-slate-900/40 " +
  "border border-white/20 dark:border-slate-700/60 " +
  "shadow-xl hover:shadow-2xl hover:border-primary-800/50 dark:hover:border-primary-200/50 " +
  "transition z-40";

const posCtrl     = "fixed bottom-20 lg:bottom-4 right-4 h-14 w-14";
const posExit     = "fixed bottom-4 right-4 h-14 w-14";
const posTakeover = "fixed bottom-4 left-1/2 -translate-x-1/2 h-14 px-2";

// --- títulos por defecto
const defaultTitles = {
  snake:  { ctrl: "Tomar control del Snake",       exit: "Volver a IA", takeover: "Tomar el control" },
  msweep: { ctrl: "Tomar control del Minesweeper", exit: "Volver a IA", takeover: "Tomar el control" },
} as const;

// --- iconos por juego para ctrl/exit
const ctrlIcon: Record<Game, ReactNode> = {
  snake:  <GiSnake />,
  msweep: <FaBomb  />,
};
const exitIcon: Record<Game, ReactNode> = {
  snake:  <FaBackward />,
  msweep: <FaBackward />,
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

export function GameCtrlFab({ game, title, className, onClick }: BaseProps) {
  const id = `${game}-ctrl`; // ej: msweep-ctrl / snake-ctrl
  return (
    <Box
      id={id}
      title={title ?? defaultTitles[game].ctrl}
      className={[posCtrl, className ?? ""].join(" ")}
      onClick={onClick}
    >
      {ctrlIcon[game]}
    </Box>
  );
}

export function GameExitFab({ game, title, className, onClick }: BaseProps) {
  const id = `${game}-exit`;
  return (
    <Box
      id={id}
      title={title ?? defaultTitles[game].exit}
      className={[posExit, className ?? ""].join(" ")}
      onClick={onClick}
    >
      {exitIcon[game]}
    </Box>
  );
}

export function GameTakeoverFab({ game, takeoverLabel, className, onClick }: TakeoverProps) {
  const id = `${game}-takeover`;
  const label = takeoverLabel ?? defaultTitles[game].takeover;
  return (
    <div id={id} className={[baseBox, posTakeover, className ?? ""].join(" ")} onClick={onClick}>
      <Button
        type="button"
        aria-pressed="false"
        title={label}
        variant="ghost"
        color="primary"
        className="px-4 text-sm font-medium"
      >
        {label}
      </Button>
    </div>
  );
}
