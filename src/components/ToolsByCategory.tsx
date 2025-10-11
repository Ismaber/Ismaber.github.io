import { Chip } from "@heroui/react";
import { TOOLS, type Tool } from "../data/tools";
import { DICTS, type Locale } from "../i18n/dicts";

export default function ToolsByCategory({ locale }: { locale: Locale }) {
  // Agrupa por categoría y mantiene el orden original de TOOLS
  const categories = Array.from(
    TOOLS.reduce((map, t) => {
      if (!map.has(t.category)) map.set(t.category, []);
      map.get(t.category)!.push(t);
      return map;
    }, new Map<Tool["category"], Tool[]>())
  ).map(([cat, items]) => ({ cat, items }));

  return (
    <div
      className={[
        "grid gap-4",
        "grid-cols-[repeat(auto-fit,minmax(280px,1fr))]",
      ].join(" ")}
      role="list"
      aria-label="Categorías de herramientas"
    >
      {categories.map(({ cat, items }, i) => {
        // etiqueta traducida; si no existe, cae al literal
        const catLabel =
          (DICTS[locale].toolsCategories as Record<string, string>)[cat] ?? cat;

        return (
          <section
            key={cat}
            aria-label={catLabel}
            style={{ animationDelay: `${i * 60}ms` }}
            role="listitem"
            className="h-full"
          >
            <CategoryCard title={catLabel} count={items.length}>
              <div className="flex flex-wrap gap-2">
                {items.map((tool) => (
                  <TechPill key={tool.id} tool={tool} />
                ))}
              </div>
            </CategoryCard>
          </section>
        );
      })}
    </div>
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
  /** Color único para la barra (sin degradado) */
  const STRIPE = "bg-primary-400/80 dark:bg-primary-300/70";

  return (
    // Grid: raya | margen | card. Sin position absolute = sin scroll lateral.
    <div className="grid grid-cols-[4px_8px_1fr] items-stretch h-full">
      {/* Raya afuera, ocupa toda la altura sin salirse */}
      <span aria-hidden className={["col-[1] row-[1] rounded-full", STRIPE].join(" ")} />

      {/* Margen entre raya y tarjeta */}
      <span aria-hidden className="col-[2]" />

      {/* Card */}
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
          <Chip
            color="primary"
            variant="solid"
            radius="sm"
            className="px-0.5"
          >
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
    <div
      role="listitem"
      aria-label={tool.label}
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
      >
        <Icon className="size-4" />
      </span>

      <span className="text-sm font-medium">{tool.label}</span>
    </div>
  );
}
