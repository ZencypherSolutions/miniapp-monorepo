import { FilledButton } from "@/components/ui/buttons/FilledButton";
import { InsightResultCard } from "@/components/ui/cards/InsightResultCard";
import { useTranslation } from "@/i18n";
import { motion } from "framer-motion";
import { Insight } from "@/hooks/useInsightsData";

interface InsightsListProps {
  insights: Insight[];
  onShareClick: () => void;
}

export function InsightsList({ insights, onShareClick }: InsightsListProps) {
  const { t } = useTranslation();
  
  // Format the category title - capitalize first letter and append 'Perspective'
  const formatCategoryTitle = (category: string): string => {
    const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
    return `${capitalizedCategory} ${t('insights.perspective')}`;
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto px-6 space-y-8 pb-16"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {Array.isArray(insights) && insights.length > 0 ? (
        insights.map((insight) => (
          <motion.div
            key={`${insight.category}-${insight.percentage}`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <InsightResultCard
              title={formatCategoryTitle(insight.category)}
              insight={insight.insight}
              description={insight.description}
              percentage={insight.percentage}
              left_label={insight.left_label}
              right_label={insight.right_label}
              values={insight.values}
            />
          </motion.div>
        ))
      ) : (
        <motion.p
          className="text-slate-200 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {t('insights.noInsightsAvailable')}
        </motion.p>
      )}

      {/* Share Button */}
      <div className="flex justify-center pt-8">
        <FilledButton
          onClick={onShareClick}
          variant="primary"
          className="px-12 py-6 text-lg transform transition-all duration-300 hover:scale-105 bg-gradient-to-r from-accent-red to-[#FF8066]"
        >
          {t('insights.shareResults')}
        </FilledButton>
      </div>
    </motion.div>
  );
}