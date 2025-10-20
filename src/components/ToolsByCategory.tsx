import { Chip } from "@heroui/react";
import { TOOLS, type Tool } from "../data/tools";
import { DICTS, type Locale } from "../i18n/dicts";

export default function ToolsByCategory({ locale }: { locale: Locale }) {
  const categories = Array.from(
    TOOLS.reduce((map, t) => {
      if (!map.has(t.category)) map.set(t.category, []);
      map.get(t.category)!.push(t);
      return map;
    }, new Map<Tool["category"], Tool[]>())
  ).map(([cat, items]) => ({ cat, items }));

  return (
    <ul
      className={[
        "grid gap-4",
        "grid-cols-[repeat(auto-fit,minmax(280px,1fr))]"
      ].join(" ")}
      aria-label="Categorías de herramientas"
    >
      {categories.map(({ cat, items }) => {
        const catLabel =
          (DICTS[locale].toolsCategories as Record<string, string>)[cat] ?? cat;

        return (
          <li key={cat} className="h-full">
            <CategoryCard title={catLabel} count={items.length}>
              {/* Lista de herramientas dentro de la categoría */}
              <ul className="flex flex-wrap gap-2" aria-label={`Herramientas en ${catLabel}`}>
                {items.map((tool) => (
                  <TechPill key={tool.id} tool={tool} />
                ))}
              </ul>
            </CategoryCard>
          </li>
        );
      })}
    </ul>
  );
}

/** Tarjeta de categoría con raya externa y hover suave (sin overflow raro) */
function CategoryCard({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  const STRIPE = "bg-primary-400/80 dark:bg-primary-300/70";

  return (
    <div className="grid grid-cols-[4px_8px_1fr] items-stretch h-full">
      <span aria-hidden className={["col-[1] row-[1] rounded-full", STRIPE].join(" ")} />
      <span aria-hidden className="col-[2]" />

      <div
        className={[
          "col-[3] group relative h-full",
          "border border-slate-200 bg-white rounded-xl p-3",
          "dark:border-slate-800 dark:bg-slate-900",
          "shadow-sm hover:shadow-md transition-all",
          "hover:border-primary-800/40 dark:hover:border-primary-200/50",
        ].join(" ")}
      >
        <header className="mb-3 flex items-center justify-between gap-2">
          <h4 className="font-semibold tracking-wide">{title}</h4>
          <Chip color="primary" variant="solid" radius="sm" className="px-0.5">
            {count}
          </Chip>
        </header>

        <div>{children}</div>
      </div>
    </div>
  );
}

function TechPill({ tool }: { tool: Tool }) {
  const Icon = tool.icon;

  return (
    <li
      className={[
        "inline-flex items-center gap-2 rounded-lg pl-2 pr-3 py-2",
        "bg-white dark:bg-slate-900 backdrop-blur-sm",
        "ring-2 ring-inset",
        tool.ring,
        "shadow-sm hover:shadow-md transition-shadow",
        "select-none cursor-default",
      ].join(" ")}
    >
      <span
        className={[
          "grid place-items-center size-6 rounded-md ring-1 ring-inset shadow-sm",
          tool.ring,
        ].join(" ")}
        aria-hidden
      >
        <Icon className="size-4" />
      </span>

      <span className="text-sm font-medium">{tool.label}</span>
    </li>
  );
}
