import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/i18n";
import { useSearchParams } from "next/navigation";

export interface Insight {
  category: string;
  percentage: number;
  insight: string;
  description: string;
  left_label: string;
  right_label: string;
  values: {
    left: number;
    right: number;
    label: string;
  };
}

export function useInsightsData(testId: string | null) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProUser, setIsProUser] = useState(false);
  const [ideology, setIdeology] = useState<string>("");
  const [scores, setScores] = useState({ econ: 0, dipl: 0, govt: 0, scty: 0 });
  const [publicFigure, setPublicFigure] = useState("");
  const { t, language } = useTranslation();
  const searchParams = useSearchParams();
  
  // Add a ref to track if a particular fetch is in progress
  const isFetchingRef = useRef(false);
  
  // Get language from URL params if available, otherwise use the one from useTranslation
  const langParam = searchParams.get("lang");
  const currentLanguage = langParam || language;
  
  // Store the previous values to avoid unnecessary re-fetches
  const prevTestIdRef = useRef<string | null>(null);
  const prevLanguageRef = useRef<string>(currentLanguage);

  useEffect(() => {
    // Skip fetching if:
    // - testId is null
    // - already fetching
    // - testId and language haven't changed
    if (!testId || 
        isFetchingRef.current ||
        (testId === prevTestIdRef.current && currentLanguage === prevLanguageRef.current)) {
      if (!testId) setLoading(false);
      return;
    }
    
    // Mark that we're starting a fetch
    isFetchingRef.current = true;
    
    // Update previous values
    prevTestIdRef.current = testId;
    prevLanguageRef.current = currentLanguage;
    
    async function fetchInsights() {
      try {
        // Check user's pro status
        const userResponse = await fetch("/api/user/subscription");
        if (!userResponse.ok) {
          throw new Error("Failed to fetch subscription status");
        }
        const userData = await userResponse.json();
        setIsProUser(userData.isPro);

        // Fetch ideology with language parameter
        const ideologyResponse = await fetch(`/api/ideology?lang=${currentLanguage}`);

        if (ideologyResponse.ok) {
          const ideologyData = await ideologyResponse.json();
            
          // Check if ideology exists for the user
          if (ideologyData.ideology) {
            setIdeology(ideologyData.ideology);
          } else {
            // If no ideology found, fetch a default one from the ideologies endpoint
            const defaultIdeologyResponse = await fetch(`/api/ideologies?lang=${currentLanguage}`);
            if (defaultIdeologyResponse.ok) {
              const defaultData = await defaultIdeologyResponse.json();
              if (defaultData.ideologies && defaultData.ideologies.length > 0) {
                // Use first ideology as default (typically Centrist)
                const defaultIdeology = defaultData.ideologies[0].name;
                setIdeology(`${defaultIdeology} (Default)`);
              } else {
                setIdeology("Centrist (Default)");
              }
            } else {
              setIdeology("Centrist (Default)");
            }
          }
        } else {
          setIdeology("Centrist (Default)");
        }

        // Fetch insights directly from API with language parameter
        const response = await fetch(`/api/insights/${testId}?lang=${currentLanguage}`);
        if (response.ok) {
          const data = await response.json();
          setInsights(data.insights);
        }

        // Get scores from database
        const scoresResponse = await fetch(`/api/tests/${testId}/progress`);
        if (scoresResponse.ok) {
          const scoresData = await scoresResponse.json();
          setScores(scoresData.scores);
        }

        // Get public figure match with language parameter
        try {
          console.log(`[useInsightsData] Fetching public figure with params: testId=${testId}, lang=${currentLanguage}`);
          const figureResponse = await fetch(`/api/public-figures?lang=${currentLanguage}`);
          
          if (!figureResponse.ok) {
            console.error(`[useInsightsData] Public figure fetch failed: ${figureResponse.status}`);
            const errorText = await figureResponse.text();
            console.error(`[useInsightsData] Error response: ${errorText}`);
            // Use default message in the appropriate language
            setPublicFigure(t('insights.noMatchAvailable'));
            return;
          }
          
          // Log the raw response for debugging
          const responseText = await figureResponse.text();
          console.log(`[useInsightsData] Public figure raw response: ${responseText}`);
          
          try {
            // Parse the response text
            const figureData = JSON.parse(responseText);
            console.log('[useInsightsData] Public figure parsed data:', figureData);
            
            if (figureData.celebrity) {
              console.log(`[useInsightsData] Setting public figure to: ${figureData.celebrity}`);
              setPublicFigure(figureData.celebrity);
            } else {
              console.warn('[useInsightsData] No celebrity found in response, using default');
              console.log('[useInsightsData] Response debug info:', figureData.debug || 'No debug info');
              setPublicFigure(t('insights.noMatchAvailable'));
            }
          } catch (parseError) {
            console.error('[useInsightsData] Error parsing public figure JSON:', parseError);
            setPublicFigure(t('insights.noMatchAvailable'));
          }
        } catch (error) {
          console.error("[useInsightsData] Error fetching public figure match:", error);
          setPublicFigure(t('insights.noMatchAvailable'));
        }

      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setLoading(false);
        // Mark that we've finished fetching
        isFetchingRef.current = false;
      }
    }

    void fetchInsights();
  }, [testId, currentLanguage, t]);

  return {
    insights,
    ideology,
    scores,
    publicFigure,
    isProUser,
    loading
  };
}