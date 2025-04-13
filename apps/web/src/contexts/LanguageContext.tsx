"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Language } from "@/i18n";
import { 
  fetchTranslatedQuestions, 
  fetchTranslatedTests,
  fetchTranslatedCategories,
  fetchTranslatedInsights,
  fetchTranslatedIdeologies,
  type QuestionResponse,
  type TestResponse,
  type CategoryResponse,
  type InsightResponse,
  type IdeologyResponse
} from "@/utils/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  fetchQuestions: (testId?: number) => Promise<QuestionResponse>;
  fetchTests: () => Promise<TestResponse>;
  fetchCategories: (testId?: number) => Promise<CategoryResponse>;
  fetchInsights: (categoryId?: number) => Promise<InsightResponse>;
  fetchIdeologies: () => Promise<IdeologyResponse>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Initialize language from localStorage or default to English
    const storedLanguage = localStorage.getItem("language") as Language;
    if (storedLanguage && (storedLanguage === "en" || storedLanguage === "es")) {
      setLanguageState(storedLanguage);
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem("language", newLanguage);
    document.cookie = `language=${newLanguage}; Path=/; Max-Age=86400; SameSite=Lax`;
  };

  // Translation fetchers with types from the utility
  const fetchQuestions = (testId?: number) => fetchTranslatedQuestions(language, testId);
  const fetchTests = () => fetchTranslatedTests(language);
  const fetchCategories = (testId?: number) => fetchTranslatedCategories(language, testId);
  const fetchInsights = (categoryId?: number) => fetchTranslatedInsights(language, categoryId);
  const fetchIdeologies = () => fetchTranslatedIdeologies(language);

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage,
        fetchQuestions,
        fetchTests,
        fetchCategories,
        fetchInsights,
        fetchIdeologies
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
} 