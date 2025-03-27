import { FilledButton } from "@/components/ui/buttons/FilledButton";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useEffect, useRef } from "react";

interface HeaderProps {
  ideology: string;
  isProUser: boolean;
  onAdvancedInsightsClick: () => void;
}

export function Header({ ideology, isProUser, onAdvancedInsightsClick }: HeaderProps) {
  const { t } = useTranslation();
  const debugLoggedRef = useRef(false);
  
  // Move debug logs to useEffect to prevent render loops
  useEffect(() => {
    if (!debugLoggedRef.current) {
      // Debug log for ideology
      console.log('Ideology in InsightsHeader component:', ideology);
      debugLoggedRef.current = true;
    }
  }, [ideology]);
  
  // Reset debug logged flag when ideology changes
  useEffect(() => {
    if (ideology) {
      debugLoggedRef.current = false;
    }
  }, [ideology]);
  
  // Clean up the ideology display - remove "(Default)" text for UI display but keep informative styles
  let displayIdeology = ideology;
  let isDefaultIdeology = false;

  if (!ideology || ideology === "undefined") {
    displayIdeology = t('ideology.centrist');
    isDefaultIdeology = true;
  } else if (ideology.includes("(Default)")) {
    // Extract the actual ideology name without the "(Default)" suffix
    displayIdeology = ideology.replace(" (Default)", "");
    isDefaultIdeology = true;
  }

  return (
    <div className="bg-brand-tertiary p-10 pt-16 pb-12 rounded-b-[4rem] shadow-lg border-b border-brand-tertiary/20 relative overflow-hidden mb-12">
      <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-20" />
      <motion.div
        className="relative z-10 text-center max-w-md mx-auto space-y-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-3">
          <BookOpen className="h-10 w-10 mx-auto text-[#E36C59]" />
          <h1 className="text-4xl font-bold text-slate-100 mb-4 tracking-tight">
            {t('insights.title')}
          </h1>
        </div>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`bg-white/10 rounded-xl p-4 backdrop-blur-sm border ${isDefaultIdeology ? 'border-orange-400/30' : 'border-white/20'} flex flex-col items-center justify-center min-h-[100px] mt-4`}
        >
          <h2 className="text-3xl font-semibold text-slate-100 m-0">
            {displayIdeology}
          </h2>
          {isDefaultIdeology && (
            <span className="mt-2 text-sm text-orange-300 bg-orange-500/10 px-2 py-1 rounded-md">
              {t('insights.estimatedIdeology')}
            </span>
          )}
        </motion.div>
        <p className="text-slate-200/90 text-lg mb-4 max-w-sm mx-auto font-medium leading-relaxed">
          {t('insights.description')}
        </p>

        <motion.div
          className="flex justify-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <FilledButton
            onClick={onAdvancedInsightsClick}
            variant={isProUser ? "primary" : "primary"}
            className={cn(
              "mt-4",
              "transform transition-all duration-300 hover:scale-105",
              "bg-gradient-to-r from-accent-red to-[#FF8066]"
            )}
          >
            {isProUser ? t('insights.advancedInsights') : t('insights.unlockAdvancedInsights')}
          </FilledButton>
        </motion.div>
      </motion.div>
    </div>
  );
}