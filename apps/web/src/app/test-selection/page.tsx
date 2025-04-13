"use client";

import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { SearchBar } from "@/components/ui/navigation/SearchBar";
import { TestCard } from "@/components/ui/cards/TestCard";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n";
import { useLanguage } from "@/contexts/LanguageContext";

interface Achievement {
  id: string;
  title: string;
  description: string;
}

interface TestData {
  testId: string;
  title: string;
  totalQuestions: number;
  answeredQuestions: number;
  achievements: Achievement[];
}

export default function TestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState<TestData>({
    testId: "",
    title: "",
    totalQuestions: 0,
    answeredQuestions: 0,
    achievements: [],
  });
  const { t } = useTranslation();
  const { fetchTests } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch test data using the language context
        const testsResponse = await fetchTests();
        
        if (testsResponse.tests && testsResponse.tests.length > 0) {
          const firstTest = testsResponse.tests[0];

          // Fetch progress for this test
          const progressResponse = await fetch(
            `/api/tests/${firstTest.testId}/progress`,
          );
          const progressData = await progressResponse.json();

          const answeredCount = progressData.answers
            ? Object.keys(progressData.answers).length
            : 0;

          setTestData({
            testId: firstTest.testId.toString(),
            title: firstTest.testName,
            totalQuestions: firstTest.totalQuestions || 0,
            answeredQuestions: answeredCount,
            achievements: firstTest.achievements || [],
          });
        } else {
          console.error("No tests found");
        }
      } catch (error) {
        console.error("Error fetching test data:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [fetchTests]);

  const handleSearch = (query: string) => {
    if (query.toLowerCase().includes(testData.title.toLowerCase())) {
      setTestData((prev) => ({ ...prev }));
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen">
      <div className="relative mb-8 overflow-hidden rounded-b-[4rem] border-b border-brand-tertiary/20 bg-brand-tertiary p-10 pb-12 pt-16 shadow-lg">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-20" />

        <motion.div
          className="relative z-10 mx-auto max-w-md space-y-4 text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-3 text-center">
            <Brain className="mx-auto h-10 w-10 text-[#E36C59]" />
            <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
              {t('testSelection.title')}
            </h1>
          </div>

          <p className="mx-auto max-w-sm text-base font-medium text-slate-200 sm:text-lg">
            {t('testSelection.description')}
          </p>

          <SearchBar
            onSearch={handleSearch}
            placeholder={t('testSelection.searchPlaceholder')}
            className="mx-auto w-full max-w-sm"
          />

          <div className="mt-4 rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-center text-sm text-white/90">
              {t('testSelection.achievementsSoon')}
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="flex flex-col items-center px-4 pb-20 sm:px-6 md:px-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <TestCard
              title={testData.title}
              totalQuestions={testData.totalQuestions}
              answeredQuestions={testData.answeredQuestions}
              achievements={testData.achievements}
              onCardClick={() =>
                router.push(`/tests/instructions?testId=${testData.testId}`)
              }
            />
            <div className="pointer-events-none opacity-40">
              <TestCard
                title={t('testSelection.personalityTest')}
                totalQuestions={50}
                answeredQuestions={0}
                achievements={[]}
                onCardClick={() => {}}
              />
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm font-medium text-gray-500">
          {t('testSelection.moreSoon')}
        </p>
      </motion.div>
    </div>
  );
}
