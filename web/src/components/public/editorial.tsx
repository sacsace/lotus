import type { ReactNode } from "react";

export function SectionMark({ index, label }: { index: string; label: string }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.22em] text-[#5e584f]">
      {index}
      <span className="px-2" aria-hidden>
        /
      </span>
      {label}
    </p>
  );
}

export function DisplayHeading({
  as: Tag = "h2",
  children,
  className = "",
}: {
  as?: "h1" | "h2";
  children: ReactNode;
  className?: string;
}) {
  return (
    <Tag
      className={`font-display text-[2.65rem] font-medium leading-[1.12] tracking-[-0.03em] sm:text-6xl lg:text-[4.35rem] ${className}`}
    >
      {children}
    </Tag>
  );
}

export function ArrowLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a href={href} className={`group inline-flex items-center gap-3 border-b border-current pb-1 text-sm ${className}`}>
      {children}
      <span aria-hidden className="editorial-arrow">
        ↗
      </span>
    </a>
  );
}

export function Hairline({ kicker, value }: { kicker: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-current/20 py-3.5">
      <span className="text-[11px] uppercase tracking-[0.18em]">{kicker}</span>
      <span className="text-right text-sm">{value}</span>
    </div>
  );
}
