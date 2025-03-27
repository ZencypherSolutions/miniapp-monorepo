import { getXataClient } from "@/lib/database/xata";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Language } from "@/i18n";

// Updated to match the type in translations.ts
export interface InsightResponse {
  insights?: Insight[];
  error?: string;
}

interface Insight {
  id: number;
  category: {
    id: number;
    name: string;
  };
  insight: string;
  lowerLimit: number;
  upperLimit: number;
}

export const dynamic = "force-dynamic";

/**
 * Fetches insights with translations based on the provided language
 * @route GET /api/insights
 */
export async function GET(request: NextRequest) {
  try {
    const xata = getXataClient();
    
    // Get language from query param or default to English
    const language = (request.nextUrl.searchParams.get("lang") || "en") as Language;
    const categoryId = request.nextUrl.searchParams.get("categoryId");
    
    // Process category ID if provided
    const parsedCategoryId = categoryId ? Number.parseInt(categoryId, 10) : undefined;
    
    // If language is English, fetch directly from Insights table
    if (language === 'en') {
      const filter = parsedCategoryId 
        ? { "category.category_id": parsedCategoryId }
        : {};
        
      const insights = await xata.db.Insights
        .filter(filter)
        .select([
          "insight_id", 
          "insight", 
          "lower_limit", 
          "upper_limit",
          "category.category_id",
          "category.category_name"
        ])
        .getAll();
        
      if (!insights || insights.length === 0) {
        return NextResponse.json({ 
          error: categoryId ? "No insights found for this category" : "No insights found" 
        }, { status: 404 });
      }
      
      const formattedInsights = insights.map(i => ({
        id: i.insight_id,
        insight: i.insight,
        lowerLimit: i.lower_limit,
        upperLimit: i.upper_limit,
        category: {
          id: i.category?.category_id,
          name: i.category?.category_name
        }
      }));
      
      return NextResponse.json({ insights: formattedInsights });
    }
    
    // For other languages, join with InsightsTranslate
    const insightsWithTranslations = await xata.db.InsightsTranslate
      .filter({
        "language.short": language
      })
      .select([
        "translated_text",
        "insight.insight_id",
        "insight.insight",
        "insight.lower_limit",
        "insight.upper_limit",
        "insight.category.category_id",
        "insight.category.category_name"
      ])
      .getAll();
    
    // Filter by category if categoryId is provided
    const filteredInsights = parsedCategoryId 
      ? insightsWithTranslations.filter(i => i.insight?.category?.category_id === parsedCategoryId)
      : insightsWithTranslations;
    
    if (!filteredInsights || filteredInsights.length === 0) {
      return NextResponse.json({ 
        error: categoryId 
          ? "No insights found for this category in the specified language" 
          : "No insights found in the specified language" 
      }, { status: 404 });
    }
    
    const formattedInsights = filteredInsights.map(i => {
      try {
        // Try to parse translated_text as JSON if it might contain full insight data
        const translatedData = JSON.parse(i.translated_text as string);
        return {
          id: i.insight?.insight_id,
          insight: translatedData.insight || i.insight?.insight,
          lowerLimit: i.insight?.lower_limit,
          upperLimit: i.insight?.upper_limit,
          category: {
            id: i.insight?.category?.category_id,
            name: i.insight?.category?.category_name
          }
        };
      } catch {
        // If not JSON, use it as the insight text
        return {
          id: i.insight?.insight_id,
          insight: i.translated_text || i.insight?.insight,
          lowerLimit: i.insight?.lower_limit,
          upperLimit: i.insight?.upper_limit,
          category: {
            id: i.insight?.category?.category_id,
            name: i.insight?.category?.category_name
          }
        };
      }
    });
    
    return NextResponse.json({ insights: formattedInsights });
    
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
