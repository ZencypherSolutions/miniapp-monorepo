import { Canvas as ResultsCanvas } from "@/components/features";
import { FilledButton } from "@/components/ui/buttons/FilledButton";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { useTranslation } from "@/i18n";
import { motion } from "framer-motion";
import { RefObject, useEffect, useRef } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: RefObject<HTMLCanvasElement>;
  scores: { econ: number; dipl: number; govt: number; scty: number };
  publicFigure: string;
  ideology: string;
  onShare: () => Promise<void>;
  isCanvasLoading: boolean;
  onCanvasLoad: () => void;
}

export function ShareModal({
  isOpen,
  onClose,
  canvasRef,
  scores,
  publicFigure,
  ideology,
  onShare,
  isCanvasLoading,
  onCanvasLoad,
}: ShareModalProps) {
  const { t, language } = useTranslation();
  const hasLoggedRef = useRef(false);
  
  // Clean up ideology for display in the canvas
  let displayIdeology = ideology;
  
  if (!ideology || ideology === "undefined") {
    displayIdeology = t('ideology.centrist');
  } else if (ideology.includes("(Default)")) {
    // Extract the actual ideology name without the "(Default)" suffix
    displayIdeology = ideology.replace(" (Default)", "");
  }
  
  // Clean up public figure for display
  let displayPublicFigure = publicFigure;
  
  if (!publicFigure || publicFigure === "undefined" || publicFigure.trim() === '') {
    console.log('ShareModal - Empty public figure, using default message');
    displayPublicFigure = t('insights.noMatchAvailable');
  }
  
  // Move console logs to an effect to prevent render loops
  useEffect(() => {
    if (isOpen && !hasLoggedRef.current) {
      // Debug log
      console.log('ShareModal - Current language:', language);
      console.log('ShareModal - Public figure:', publicFigure);
      console.log('ShareModal - Ideology before cleaning:', ideology);
      console.log('ShareModal - Display ideology after cleaning:', displayIdeology);
      hasLoggedRef.current = true;
    }
  }, [isOpen, language, publicFigure, ideology, displayIdeology]);
  
  // Reset the logged flag when modal closes or key props change
  useEffect(() => {
    if (!isOpen || ideology !== displayIdeology) {
      hasLoggedRef.current = false;
    }
  }, [isOpen, ideology, displayIdeology]);

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-2xl bg-gradient-to-b from-brand-tertiary/20 to-brand-tertiary/5 border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-tertiary/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative p-6 pb-4 text-center border-b border-white/10 bg-white/5">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors hover:bg-white/10 p-2 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-label="Close"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
            {t('insights.shareYourResults')}
          </h2>
        </div>

        <div className="p-6 text-center max-h-[70vh] overflow-y-auto scrollbar-custom">
          <div className="w-full max-w-md mx-auto">
            {isCanvasLoading && (
              <div className="flex items-center justify-center min-h-[200px]">
                <LoadingSpinner />
              </div>
            )}
            <ResultsCanvas
              ref={canvasRef}
              econ={scores.econ}
              dipl={scores.dipl}
              govt={scores.govt}
              scty={scores.scty}
              closestMatch={displayPublicFigure}
              ideology={displayIdeology}
              onLoad={onCanvasLoad}
            />
          </div>
        </div>

        <div className="flex justify-center p-6 border-t border-white/10 bg-[#162026]/80">
          <FilledButton
            variant="primary"
            onClick={onShare}
            aria-label="Share results"
            className="w-full max-w-sm py-4 text-base font-medium bg-[#E36C59] hover:bg-[#E36C59]/90
                 flex items-center justify-center gap-3
                 focus:ring-2 focus:ring-offset-2 focus:ring-[#E36C59]
                 transition-all duration-300 hover:scale-[1.02]
                 sm:text-lg sm:py-5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 sm:h-7 sm:w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            <span className="whitespace-nowrap">{t('insights.shareResults')}</span>
          </FilledButton>
        </div>
      </motion.div>
    </motion.div>
  );
}