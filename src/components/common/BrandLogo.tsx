"use client";

import { siteConfig } from "@/data/siteConfig";

export type BrandLogoSize = "sm" | "md" | "lg";

type BrandLogoProps = {
  size?: BrandLogoSize;
  className?: string;
};

const sizeStyles: Record<BrandLogoSize, { name: string; arabic: string; since: string; gap: string }> = {
  sm: {
    name: "text-[0.62rem] tracking-[0.16em] sm:text-[0.72rem]",
    arabic: "text-[0.62rem] sm:text-[0.7rem]",
    since: "text-[0.8rem]",
    gap: "gap-0.5",
  },
  md: {
    name: "text-sm tracking-[0.2em]",
    arabic: "text-sm",
    since: "text-base",
    gap: "gap-1",
  },
  lg: {
    name: "text-xl tracking-[0.24em] sm:text-2xl",
    arabic: "text-lg sm:text-xl",
    since: "text-xl sm:text-2xl",
    gap: "gap-1.5",
  },
};

export default function BrandLogo({ size = "md", className = "" }: BrandLogoProps) {
  const styles = sizeStyles[size];
  const color = "text-[#F25C23]";

  return (
    <span
      className={`inline-flex flex-col items-center justify-center text-center leading-none ${styles.gap} ${className}`}
      aria-label={`${siteConfig.name}, ${siteConfig.nameArabic}, Since ${siteConfig.founded}`}
    >
      <span className={`font-cinzel font-bold uppercase ${styles.name} ${color}`}>
        {siteConfig.name}
      </span>
      <span className={`font-arabic font-bold ${styles.arabic} ${color}`} dir="rtl">
        {siteConfig.nameArabic}
      </span>
      <span className={`font-caveat italic ${styles.since} ${color}`}>
        Since {siteConfig.founded}
      </span>
    </span>
  );
}
