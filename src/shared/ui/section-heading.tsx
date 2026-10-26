import type { ReactNode } from "react";
import { Badge } from "./badge";

export function SectionHeading({
  title,
  count,
  detail,
  countToggle,
}: {
  title: string;
  count: number | string;
  detail?: ReactNode;
  countToggle?: {
    label: string;
    pressed: boolean;
    onToggle: () => void;
  };
}) {
  return (
    <h3 data-slot="section-heading" className="flex h-4.5 items-center gap-1.5">
      <span className="section-heading">{title}</span>
      <Badge
        variant="count"
        className={countToggle && "cursor-pointer hover:text-foreground"}
        render={
          countToggle ? (
            <button
              type="button"
              aria-label={countToggle.label}
              aria-pressed={countToggle.pressed}
              title={countToggle.label}
              onClick={countToggle.onToggle}
            />
          ) : undefined
        }
      >
        {count}
        {countToggle?.pressed && (
          <span aria-hidden className="size-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
        )}
      </Badge>
      {detail && <span className="ms-auto inline-flex shrink-0 items-center gap-2">{detail}</span>}
    </h3>
  );
}
