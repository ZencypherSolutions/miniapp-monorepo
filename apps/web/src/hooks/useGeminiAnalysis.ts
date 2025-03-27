import { useState, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { useSearchParams } from "next/navigation";

interface Scores {
  econ: number;
  dipl: number;
  govt: number;
  scty: number;
}

export function useGeminiAnalysis(isProUser: boolean, isModalOpen: boolean, scores: Scores) {
  const [fullAnalysis, setFullAnalysis] = useState<string>("");
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const { language } = useTranslation();
  const searchParams = useSearchParams();
  
  // Get language from URL params if available, otherwise use the one from useTranslation
  const langParam = searchParams.get("lang");
  const currentLanguage = langParam || language;

  useEffect(() => {
    async function fetchGeminiAnalysis() {
      if (!isProUser || !isModalOpen) return;
      
      setIsGeminiLoading(true);
      try {
        const geminiResponse = await fetch("/api/gemini-flash", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            econ: scores.econ || 0,
            dipl: scores.dipl || 0,
            govt: scores.govt || 0,
            scty: scores.scty || 0,
            language: currentLanguage, // Pass the current language to the API
          }),
        });

        if (geminiResponse.status === 200) {
          const geminiData = await geminiResponse.json();
          setFullAnalysis(geminiData.analysis);
        } else {
          console.error(
            "Error fetching Gemini analysis:",
            geminiResponse.statusText,
          );
          // Show error message in the current language
          if (currentLanguage === 'es') {
            setFullAnalysis(
              "No se pudo generar el análisis. Por favor, inténtelo más tarde.",
            );
          } else {
            setFullAnalysis(
              "Failed to generate analysis. Please try again later.",
            );
          }
        }
      } catch (error) {
        console.error("Error fetching Gemini analysis:", error);
        // Show error message in the current language
        if (currentLanguage === 'es') {
          setFullAnalysis(
            "No se pudo generar el análisis. Por favor, inténtelo más tarde.",
          );
        } else {
          setFullAnalysis(
            "Failed to generate analysis. Please try again later.",
          );
        }
      } finally {
        setIsGeminiLoading(false);
      }
    }

    void fetchGeminiAnalysis();
  }, [isProUser, isModalOpen, scores, currentLanguage]);

  return { fullAnalysis, isGeminiLoading };
}