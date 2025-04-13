"use client";

import { ActionCard } from "@/components/ui/cards/ActionCard";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FileChartColumn, Globe, Heart, Star, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n";

interface Test {
  testId: string;
  testName: string;
}

interface TestResult {
  title: string;
  backgroundColor: string;
  iconBgColor: string;
  Icon: LucideIcon;
  isEnabled: boolean;
  testId?: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const { t, language } = useTranslation();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/tests?lang=${language}`);
        const data = await response.json();

        const transformedResults = data.tests.map((test: Test) => ({
          title: test.testName || t('results.title'),
          backgroundColor: "#387478",
          iconBgColor: "#2C5154",
          Icon: Globe,
          isEnabled: true,
          testId: test.testId,
        }));

        const comingSoonCards = [
          {
            title: t('testSelection.personalityTest') + ` (${t('leaderboard.comingSoon')})`,
            backgroundColor: "#778BAD",
            iconBgColor: "#4A5A7A",
            Icon: Heart,
            isEnabled: false,
          },
          {
            title: t('leaderboard.comingSoon'),
            backgroundColor: "#DA9540",
            iconBgColor: "#A66B1E",
            Icon: Star,
            isEnabled: false,
          },
          {
            title: t('leaderboard.comingSoon'),
            backgroundColor: "#D87566",
            iconBgColor: "#A44C3D",
            Icon: Trophy,
            isEnabled: false,
          },
        ];

        setTestResults([...transformedResults, ...comingSoonCards]);
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [t, language]);

  const handleCardClick = (testId: string) => {
    router.push(`/insights?testId=${testId}&lang=${language}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen">
      <div className="bg-brand-tertiary rounded-b-[50px] shadow-lg pb-8 sm:pb-14 mb-6 sm:mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-20" />
        <motion.div
          className="relative z-10 w-full max-w-2xl mx-auto px-4 pt-16 sm:pt-20 space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center space-y-3">
            <FileChartColumn className="h-10 w-10 mx-auto text-[#E36C59]" />
            <h1 className="text-center text-white text-3xl sm:text-4xl md:text-5xl font-bold leading-tight sm:leading-[50px] mb-3 sm:mb-4">
              {t('results.title')}
            </h1>
          </div>

          <p className="text-center text-[#C9CDCE] text-lg font-normal leading-[25px]">
            {t('results.summary')}
          </p>
        </motion.div>
      </div>

      <motion.div
        className="w-full max-w-7xl mx-auto px-4 pb-20"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="grid grid-cols-2 gap-6 justify-items-center max-w-[400px] mx-auto">
          {testResults.map((test) => (
            <motion.div
              key={test.title}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: 0.3 + testResults.indexOf(test) * 0.1,
              }}
              className="contents"
            >
              <ActionCard
                title={test.title}
                backgroundColor={test.backgroundColor}
                iconBgColor={test.iconBgColor}
                Icon={test.Icon}
                isClickable={test.isEnabled}
                onClick={() =>
                  test.testId && test.isEnabled && handleCardClick(test.testId)
                }
                className={cn(
                  "transform transition-all duration-300",
                  "hover:scale-105 hover:-translate-y-1",
                  !test.isEnabled && "opacity-30 cursor-not-allowed",
                )}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
