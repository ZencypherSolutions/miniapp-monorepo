"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n";

interface IdeologyTagProps {
  scale: number;
  className?: string;
}

function validateScale(scale: number): void {
  if (scale < 0 || scale > 100) {
    throw new RangeError("scale must be between 0 and 100");
  }
}

// Define valid ideology values as a type for better type checking
type IdeologyValue = 'centrist' | 'moderate' | 'balanced' | 'neutral';

export function IdeologyTag({ scale, className = "" }: IdeologyTagProps) {
  validateScale(scale);

  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getIdeology = (scale: number): IdeologyValue => {
    if (scale >= 45 && scale <= 55) return "centrist";
    if (scale >= 35 && scale < 45) return "moderate";
    if (scale >= 25 && scale < 35) return "balanced";
    return "neutral";
  };

  const ideologyValue = getIdeology(scale);

  if (!mounted) {
    return null;
  }

  // Translate the ideology value with fallback
  const translatedIdeology = t(`ideology.${ideologyValue}`) || ideologyValue;

  return (
    <div
      className={`inline-flex rounded-full bg-emerald-400 px-4 py-1.5 text-sm font-bold text-emerald-950 shadow-md transition-shadow duration-300 hover:shadow-lg sm:text-base ${className}`}
    >
      {translatedIdeology}
    </div>
  );
}
