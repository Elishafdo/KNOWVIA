import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  href?: string;
  inverted?: boolean;
}

export function KnowviaLogoMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="KNOWVIA Mark"
    >
      <rect width="36" height="36" rx="9" fill="currentColor" fillOpacity="0.08" />
      {/* Refined Geometric Knowledge Prism */}
      <path
        d="M10 8V28M10 18L24 8M16 14L26 28"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="8" r="2.5" fill="#0284c7" />
    </svg>
  );
}

export default function KnowviaLogo({
  className = "",
  size = "md",
  showTagline = false,
  href = "/",
  inverted = false,
}: LogoProps) {
  const iconSizes = {
    sm: 24,
    md: 30,
    lg: 38,
    xl: 48,
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className={inverted ? "text-white" : "text-zinc-900 dark:text-white"}>
        <KnowviaLogoMark size={iconSizes[size]} />
      </div>
      <div className="flex flex-col">
        <span
          className={`font-black tracking-tight uppercase leading-none font-sans ${textSizes[size]} ${
            inverted ? "text-white" : "text-zinc-900 dark:text-zinc-50"
          }`}
        >
          KNOW<span className="text-sky-600 dark:text-sky-400">VIA</span>
        </span>
        {showTagline && (
          <span
            className={`text-[10px] tracking-widest uppercase font-medium mt-0.5 ${
              inverted ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            Discover · Learn · Understand
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
