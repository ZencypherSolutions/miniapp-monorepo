"use client";

import type { Question as AppQuestion } from "@/app/types";
import { FilledButton } from "@/components/ui/buttons/FilledButton";
import { LoadingSpinner, ProgressBar } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Question as ApiQuestion } from "@/utils/translations";

// Convert API Question type to App Question type
function convertQuestion(apiQuestion: ApiQuestion): AppQuestion {
  return {
    id: apiQuestion.id,
    question: apiQuestion.question,
    effect: apiQuestion.effect as {
      econ: number;
      dipl: number;
      govt: number;
      scty: number;
    },
  };
}

export default function IdeologyTest() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = searchParams.get("testId") || "1";
  const { t, tWithVars } = useTranslation();
  const { fetchQuestions } = useLanguage();

  const answerOptions = [
    { label: t('ideologyTest.options.stronglyAgree'), multiplier: 1.0 },
    { label: t('ideologyTest.options.agree'), multiplier: 0.5 },
    { label: t('ideologyTest.options.neutral'), multiplier: 0.0 },
    { label: t('ideologyTest.options.disagree'), multiplier: -0.5 },
    { label: t('ideologyTest.options.stronglyDisagree'), multiplier: -1.0 },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<AppQuestion[]>([]);
  const [scores, setScores] = useState({ econ: 0, dipl: 0, govt: 0, scty: 0 });
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalAnswers, setOriginalAnswers] = useState<Record<string, number>>({});
  const [hasUnsavedChanges] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);

  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  // Auto-clear error message after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const loadProgress = async (loadedQuestions: AppQuestion[]) => {
      try {
        const response = await fetch(`/api/tests/${testId}/progress`);
        if (response.ok) {
          const data = await response.json();
          
          // Check if test is already completed
          if (data.status === "completed") {
            router.push(`/insights?testId=${testId}`);
            return;
          }
          
          if (data.answers && Object.keys(data.answers).length > 0) {
            const lastAnsweredId = Object.keys(data.answers).pop();
            const lastAnsweredIndex = loadedQuestions.findIndex(
              (q) => q.id.toString() === lastAnsweredId,
            );
            const nextQuestionIndex = Math.min(
              lastAnsweredIndex + 1,
              loadedQuestions.length - 1,
            );
            setCurrentQuestion(nextQuestionIndex);
            setScores(data.scores || { econ: 0, dipl: 0, govt: 0, scty: 0 });
            setUserAnswers(data.answers);
            setOriginalAnswers(data.answers);
          }
        }
      } catch (error) {
        console.error("Error loading progress:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchQuestionData = async () => {
      try {
        // Use the language context to fetch questions
        const parsedTestId = parseInt(testId, 10);
        const questionsResponse = await fetchQuestions(parsedTestId);
        
        if (!questionsResponse.questions || questionsResponse.questions.length === 0) {
          throw new Error(questionsResponse.error || "Failed to fetch questions");
        }
        
        // Convert API questions to app questions with the correct effect type
        const appQuestions = questionsResponse.questions.map(convertQuestion);
        setQuestions(appQuestions);
        await loadProgress(appQuestions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [testId, fetchQuestions]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleUnload = () => {
      if (hasUnsavedChanges) {
        void router.push('/');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [hasUnsavedChanges, router]);

  const handleEndTest = async () => {
    if (isSubmitting) return;

    const unansweredQuestions = Object.keys(userAnswers).length;
    if (unansweredQuestions < questions.length) {
      setError(
        `Please answer all questions before submitting. You have ${
          questions.length - unansweredQuestions
        } questions remaining.`,
      );
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      // Calculate scores first as we'll need them in both cases
      const maxEcon = questions.reduce(
        (sum, q) => sum + Math.abs(q.effect.econ),
        0,
      );
      const maxDipl = questions.reduce(
        (sum, q) => sum + Math.abs(q.effect.dipl),
        0,
      );
      const maxGovt = questions.reduce(
        (sum, q) => sum + Math.abs(q.effect.govt),
        0,
      );
      const maxScty = questions.reduce(
        (sum, q) => sum + Math.abs(q.effect.scty),
        0,
      );

      const econScore = ((scores.econ + maxEcon) / (2 * maxEcon)) * 100;
      const diplScore = ((scores.dipl + maxDipl) / (2 * maxDipl)) * 100;
      const govtScore = ((scores.govt + maxGovt) / (2 * maxGovt)) * 100;
      const sctyScore = ((scores.scty + maxScty) / (2 * maxScty)) * 100;

      const roundedScores = {
        econ: Math.round(econScore),
        dipl: Math.round(diplScore),
        govt: Math.round(govtScore),
        scty: Math.round(sctyScore),
      };

      // Check if insights exist
      const insightsResponse = await fetch(`/api/insights/${testId}`);
      const hasExistingInsights = insightsResponse.ok && 
        (await insightsResponse.json()).insights?.length > 0;

      // Check if answers have changed
      const hasAnswersChanged = Object.keys(originalAnswers).some(
        key => originalAnswers[key] !== userAnswers[key]
      );

      // Save progress and update scores
      const response = await fetch(`/api/tests/${testId}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: questions[currentQuestion].id,
          currentQuestion: questions[currentQuestion].id,
          scores: roundedScores,
          isComplete: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save final answers");
      }

      // Handle the three scenarios:
      // 1. If insights exist and no changes - just redirect
      if (hasExistingInsights && !hasAnswersChanged) {
        router.push(`/insights?testId=${testId}`);
        return;
      }

      // 2. If no insights exist - create new ones
      // 3. If answers changed - rewrite existing insights
      try {
        const resultsResponse = await fetch(`/api/tests/${testId}/results`, {
          method: hasExistingInsights ? "PUT" : "POST", // Use PUT to update existing insights
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ forceUpdate: hasAnswersChanged }),
        });

        if (!resultsResponse.ok) {
          const errorText = await resultsResponse.text();
          console.error("Failed to save final results:", {
            status: resultsResponse.status,
            statusText: resultsResponse.statusText,
            errorText
          });
          throw new Error(`Failed to save final results: ${resultsResponse.status} ${errorText}`);
        }

        // Calculate ideology based on final scores
        const ideologyResponse = await fetch("/api/ideology", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(roundedScores),
        });

        if (!ideologyResponse.ok) {
          console.error("Failed to calculate ideology:", { 
            status: ideologyResponse.status,
            statusText: ideologyResponse.statusText 
          });
          // Continue to results page even if ideology calculation fails
        }

        router.push(`/insights?testId=${testId}`);
      } catch (error) {
        console.error("Error processing results:", error);
        setError("Error saving results. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error ending test:", error);
      setIsSubmitting(false);
    }
  };

  const handleAnswer = async (multiplier: number) => {
    if (questions.length === 0 || isSubmitting || isProcessingAnswer) return;

    // Set the selected answer and processing state
    setSelectedAnswer(multiplier);
    setIsProcessingAnswer(true);

    const question = questions[currentQuestion];
    const updatedScores = {
      econ: scores.econ + multiplier * question.effect.econ,
      dipl: scores.dipl + multiplier * question.effect.dipl,
      govt: scores.govt + multiplier * question.effect.govt,
      scty: scores.scty + multiplier * question.effect.scty,
    };
    setScores(updatedScores);

    try {
      const response = await fetch(`/api/tests/${testId}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: question.id,
          answer: multiplier,
          currentQuestion: question.id,
          scores: updatedScores,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save progress");
      }

      setUserAnswers((prev) => ({
        ...prev,
        [question.id]: multiplier,
      }));

      // Add a delay before moving to the next question
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
        }
        setIsProcessingAnswer(false);
        setSelectedAnswer(null);
      }, 800); // 800ms delay to show the selected answer
    } catch (error) {
      console.error("Error saving progress:", error);
      setIsProcessingAnswer(false);
      setSelectedAnswer(null);
    }
  };

  const handleNext = async () => {
    if (currentQuestion < totalQuestions - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);

      try {
        await fetch(`/api/tests/${testId}/progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentQuestion: questions[nextQuestion].id,
            scores,
          }),
        });
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    }
  };

  const handlePrevious = async () => {
    if (currentQuestion > 0) {
      const prevQuestion = currentQuestion - 1;
      setCurrentQuestion(prevQuestion);

      try {
        await fetch(`/api/tests/${testId}/progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentQuestion: questions[prevQuestion].id,
            scores,
          }),
        });
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    }
  };

  const handleLeaveTest = async () => {
    try {
      await fetch(`/api/tests/${testId}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentQuestion: questions[currentQuestion].id,
          scores,
        }),
      });

      router.push("/test-selection");
    } catch (error) {
      console.error("Error saving progress:", error);
      router.push("/test-selection");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (
    !questions ||
    questions.length === 0 ||
    currentQuestion >= questions.length
  ) {
    return <div className="text-white text-center">No questions found.</div>;
  }

  return (
    <div className="fixed inset-0 bg-brand-tertiary overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 bg-brand-tertiary z-10 px-4 pt-4">
          <FilledButton
            variant="primary"
            size="sm"
            onClick={handleLeaveTest}
            className="bg-[#E36C59] hover:bg-[#E36C59]/90"
          >
            {t('ideologyTest.leaveTest')}
          </FilledButton>
        </div>

        <div className="absolute inset-0 pt-20 pb-[280px] overflow-y-auto">
          <div className="w-full max-w-md mx-auto px-4">
            <div className="space-y-6">
              <h1 className="text-center text-white text-2xl font-bold">
                {tWithVars('ideologyTest.questionCount', { current: currentQuestion + 1, total: totalQuestions })}
              </h1>

              <div className="flex justify-center">
                <ProgressBar progress={progress} variant="warning" />
              </div>

              <div className="text-center text-white text-xl font-bold min-h-[4rem] pt-4">
                {questions[currentQuestion].question}
              </div>
            </div>
          </div>
        </div>

        {/* Answer Buttons Section - Fixed at bottom */}
        <div className="absolute bottom-16 left-0 right-0 bg-brand-tertiary/95 backdrop-blur-sm border-t border-white/10">
          <div className="w-full max-w-md mx-auto px-4 py-4 space-y-2.5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {answerOptions.map((answer) => {
              const isSelected = 
                selectedAnswer === answer.multiplier || 
                userAnswers[questions[currentQuestion].id] === answer.multiplier;
              
              return (
                <FilledButton
                  key={`${answer.label}-${answer.multiplier}`}
                  variant="secondary"
                  size="lg"
                  className={`w-full ${
                    isSelected
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-[#387478] hover:bg-[#387478]/90"
                  } rounded-[30px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] text-white text-base font-bold`}
                  onClick={() => handleAnswer(answer.multiplier)}
                  disabled={isProcessingAnswer}
                >
                  {answer.label}
                </FilledButton>
              );
            })}

            <div className="flex justify-between pt-2">
              <div>
                {currentQuestion > 0 && (
                  <FilledButton
                    variant="primary"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0 || isProcessingAnswer}
                    className={cn(
                      "bg-[#E36C59] hover:bg-[#E36C59]/90",
                      (currentQuestion === 0 || isProcessingAnswer) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {t('ideologyTest.navigation.previous')}
                  </FilledButton>
                )}
              </div>

              {currentQuestion === totalQuestions - 1 ? (
                <FilledButton
                  variant="primary"
                  size="sm"
                  onClick={handleEndTest}
                  disabled={isSubmitting || isProcessingAnswer}
                  className={cn(
                    "bg-green-600 hover:bg-green-700",
                    (isSubmitting || isProcessingAnswer) && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {isSubmitting ? t('common.loading') : t('ideologyTest.navigation.finish')}
                </FilledButton>
              ) : (
                <FilledButton
                  variant="primary"
                  size="sm"
                  onClick={handleNext}
                  disabled={isProcessingAnswer}
                  className={cn(
                    "bg-[#E36C59] hover:bg-[#E36C59]/90",
                    isProcessingAnswer && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {t('ideologyTest.navigation.next')}
                </FilledButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
