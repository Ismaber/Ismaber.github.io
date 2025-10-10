import React from "react";
import { Card, CardHeader, CardBody } from "@heroui/react";

type IconType = React.ComponentType<{ className?: string }>;

type SectionProps = {
  id: string;
  title: string;
  icon?: IconType;
  children: React.ReactNode;
  delay?: string;
  className?: string;
  bodyClassName?: string;
};

export default function Section({
  id,
  title,
  icon: Icon,
  children,
  delay = "0ms",
  className,
  bodyClassName,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <Card
        shadow="md"
        radius="lg"
        classNames={{
          base:
            "group backdrop-blur-xl rounded-2xl shadow-md border " +
            "bg-white/50 border-slate-200 " +
            "dark:bg-slate-900/50 dark:border-slate-800 " +
            "transition hover:shadow-xl hover:border-primary-800/40 dark:hover:border-primary-200/50",
          header: "px-6 pt-5 pb-3",
          body: "px-6 pb-6 pt-1",
        }}
      >
        <CardHeader className="mb-1 flex items-center justify-between gap-3">
          <h2
            id={`${id}-title`}
            className="section-title text-xl font-bold text-primary-900 dark:text-primary-300 flex items-center gap-2"
          >
            {Icon && <Icon className="inline-block" />}
            <span>{title}</span>
          </h2>
        </CardHeader>

        <CardBody className={bodyClassName ?? ""}>{children}</CardBody>
      </Card>
    </section>
  );
}
