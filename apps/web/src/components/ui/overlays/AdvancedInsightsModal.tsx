import { FilledButton } from "@/components/ui/buttons/FilledButton";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { useTranslation } from "@/i18n";
import { motion } from "framer-motion";

interface AdvancedInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isProUser: boolean;
  fullAnalysis: string;
  isGeminiLoading: boolean;
  onShareAnalysis: () => void;
  onUpgradeToPro: () => void;
}

export function AdvancedInsightsModal({
  isOpen,
  onClose,
  isProUser,
  fullAnalysis,
  isGeminiLoading,
  onShareAnalysis,
  onUpgradeToPro,
}: AdvancedInsightsModalProps) {
  const { t } = useTranslation();

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
        className="relative w-full max-w-md mx-4 bg-brand-tertiary border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-tertiary via-transparent to-transparent pointer-events-none" />

        <div className="relative p-6 pb-4 text-center">
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
              aria-label="Close modal"
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
          <h2 className="text-2xl font-bold text-slate-100">
            {isProUser
              ? t('insights.advancedIdeologicalAnalysis')
              : t('insights.unlockAdvancedInsightsTitle')}
          </h2>
        </div>

        <div className="p-6 text-center max-h-[70vh] overflow-y-auto scrollbar-custom">
          {isProUser ? (
            <div className="w-full max-w-3xl mx-auto">
              {isGeminiLoading ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <LoadingSpinner />
                </div>
              ) : (
                <p className="text-white/90 leading-relaxed text-base whitespace-pre-wrap">
                  {fullAnalysis}
                </p>
              )}
            </div>
          ) : (
            <div className="w-full max-w-md mx-auto space-y-4">
              <p className="text-white text-lg">
                {t('insights.proDescription')}
              </p>
              <div className="flex justify-center pt-2">
                <FilledButton
                  variant="primary"
                  onClick={onUpgradeToPro}
                  className="bg-[#E36C59] hover:bg-[#E36C59]/90 transform transition-all duration-300 hover:scale-105"
                >
                  {t('insights.upgradeToPro')}
                </FilledButton>
              </div>
            </div>
          )}
        </div>

        {isProUser && (
          <div className="flex justify-between gap-3 p-4 border-t border-white/10 bg-[#162026]/80">
            <FilledButton
              variant="primary"
              onClick={onShareAnalysis}
              className="flex-1 py-3 text-sm bg-[#E36C59] flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-label="Share analysis"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              <span className="whitespace-nowrap">{t('insights.shareAnalysis')}</span>
            </FilledButton>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}