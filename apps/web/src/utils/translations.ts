import type { Language } from "@/i18n";

// Define response types for translation APIs
export interface Question {
  id: number;
  question: string;
  effect: unknown;
}

export interface QuestionResponse {
  questions?: Question[];
  error?: string;
}

export interface Test {
  testId: number;
  testName: string;
  description: string;
  totalQuestions: number;
  answeredQuestions: number;
  progressPercentage: number;
  status: "not_started" | "in_progress" | "completed";
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
}

export interface TestResponse {
  tests?: Test[];
  error?: string;
}

export interface Category {
  id: number;
  name: string;
  leftLabel: string;
  rightLabel: string;
}

export interface CategoryResponse {
  categories?: Category[];
  error?: string;
}

export interface Insight {
  id: number;
  category: {
    id: number;
    name: string;
  };
  insight: string;
  lowerLimit: number;
  upperLimit: number;
}

export interface InsightResponse {
  insights?: Insight[];
  error?: string;
}

export interface Ideology {
  id: number;
  name: string;
  scores: Record<string, number>;
}

export interface IdeologyResponse {
  ideologies?: Ideology[];
  error?: string;
}

/**
 * Fetches translated questions based on the provided language
 * @param language The language code ('en', 'es', etc.)
 * @param testId Optional test ID to filter questions
 * @returns Promise with questions array or error
 */
export async function fetchTranslatedQuestions(language: Language, testId?: number): Promise<QuestionResponse> {
  try {
    const url = new URL(`/api/tests/${testId}/questions`, window.location.origin);
    url.searchParams.append("lang", language);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch questions");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching translated questions:", error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Fetches translated tests based on the provided language
 * @param language The language code ('en', 'es', etc.)
 * @returns Promise with tests array or error
 */
export async function fetchTranslatedTests(language: Language): Promise<TestResponse> {
  try {
    const url = new URL("/api/tests", window.location.origin);
    url.searchParams.append("lang", language);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch tests");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching translated tests:", error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Fetches translated categories based on the provided language
 * @param language The language code ('en', 'es', etc.)
 * @param testId Optional test ID to filter categories
 * @returns Promise with categories array or error
 */
export async function fetchTranslatedCategories(language: Language, testId?: number): Promise<CategoryResponse> {
  try {
    const url = new URL("/api/categories", window.location.origin);
    url.searchParams.append("lang", language);
    
    if (testId) {
      url.searchParams.append("testId", testId.toString());
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch categories");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching translated categories:", error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Fetches translated insights based on the provided language
 * @param language The language code ('en', 'es', etc.)
 * @param categoryId Optional category ID to filter insights
 * @returns Promise with insights array or error
 */
export async function fetchTranslatedInsights(language: Language, categoryId?: number): Promise<InsightResponse> {
  try {
    const url = new URL("/api/insights", window.location.origin);
    url.searchParams.append("lang", language);
    
    if (categoryId) {
      url.searchParams.append("categoryId", categoryId.toString());
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch insights");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching translated insights:", error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Fetches translated ideologies based on the provided language
 * @param language The language code ('en', 'es', etc.)
 * @returns Promise with ideologies array or error
 */
export async function fetchTranslatedIdeologies(language: Language): Promise<IdeologyResponse> {
  try {
    const url = new URL("/api/ideologies", window.location.origin);
    url.searchParams.append("lang", language);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch ideologies");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching translated ideologies:", error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
} 