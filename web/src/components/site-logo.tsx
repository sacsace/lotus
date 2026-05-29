"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { BRAND_LOGOS } from "@/lib/brand";

type Props = {
  href?: string;
  branchName?: string;
  variant?: "header" | "footer" | "auth";
  className?: string;
};

const SIZES = {
  header: { width: 132, height: 36, className: "h-8 w-auto sm:h-9" },
  footer: { width: 148, height: 40, className: "h-10 w-auto" },
  auth: { width: 176, height: 48, className: "h-12 w-auto" },
} as const;

export function SiteLogo({ href, branchName, variant = "header", className = "" }: Props) {
  const { theme } = useTheme();
  const src = theme === "dark" ? BRAND_LOGOS.dark : BRAND_LOGOS.light;
  const size = SIZES[variant];

  const content = (
    <div className={`inline-flex flex-col ${className}`}>
      <Image
        src={src}
        alt="Lotus Korean Hotel"
        width={size.width}
        height={size.height}
        className={`${size.className} object-contain object-left`}
        priority={variant === "header"}
      />
      {branchName && variant === "header" ? (
        <span className="mt-1 text-xs text-muted">{branchName}</span>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="shrink-0 transition-opacity hover:opacity-80">
        {content}
      </Link>
    );
  }

  return content;
}
