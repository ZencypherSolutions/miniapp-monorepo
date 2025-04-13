import { getXataClient } from "@/lib/database/xata";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Language } from "@/i18n";

interface Category {
  id: number;
  name: string;
  leftLabel: string;
  rightLabel: string;
}

// Response type matches utility functions
export interface CategoryResponse {
  categories?: Category[];
  error?: string;
}

export const dynamic = "force-dynamic";

/**
 * Fetches categories with translations based on the provided language
 * @route GET /api/categories
 */
export async function GET(request: NextRequest) {
  try {
    const xata = getXataClient();
    
    // Get language from query param or default to English
    const language = (request.nextUrl.searchParams.get("lang") || "en") as Language;
    const testId = request.nextUrl.searchParams.get("testId");
    
    // Process test ID if provided
    const parsedTestId = testId ? Number.parseInt(testId, 10) : undefined;
    
    // If language is English, fetch directly from Categories table
    if (language === 'en') {
      const filter = parsedTestId 
        ? { "test.test_id": parsedTestId }
        : {};
        
      const categories = await xata.db.Categories
        .filter(filter)
        .select(["category_id", "category_name", "left_label", "right_label"])
        .getAll();
        
      if (!categories || categories.length === 0) {
        return NextResponse.json({ 
          error: testId ? "No categories found for this test" : "No categories found" 
        }, { status: 404 });
      }
      
      const formattedCategories = categories.map(c => ({
        id: c.category_id,
        name: c.category_name,
        leftLabel: c.left_label,
        rightLabel: c.right_label
      }));
      
      return NextResponse.json({ categories: formattedCategories });
    }
    
    // For other languages, join with CategoriesTranslate
    const categoriesWithTranslations = await xata.db.CategoriesTranslate
      .filter({
        "language.short": language
      })
      .select([
        "translated_text",
        "category.category_id",
        "category.category_name",
        "category.left_label",
        "category.right_label",
        "category.test.test_id"
      ])
      .getAll();
    
    // Filter by test if testId is provided
    const filteredCategories = parsedTestId 
      ? categoriesWithTranslations.filter(c => c.category?.test?.test_id === parsedTestId)
      : categoriesWithTranslations;
    
    if (!filteredCategories || filteredCategories.length === 0) {
      return NextResponse.json({ 
        error: testId ? "No categories found for this test in the specified language" : "No categories found in the specified language" 
      }, { status: 404 });
    }
    
    // In this example, we're assuming translated_text contains a JSON with translated fields
    // You may need to adjust this based on your actual data structure
    const formattedCategories = filteredCategories.map(c => {
      // Try to parse translated_text as JSON if it might contain full category data
      try {
        const translatedData = JSON.parse(c.translated_text as string);
        return {
          id: c.category?.category_id,
          name: translatedData.name || c.category?.category_name,
          leftLabel: translatedData.leftLabel || c.category?.left_label,
          rightLabel: translatedData.rightLabel || c.category?.right_label
        };
      } catch {
        // If not JSON, use it as the category name
        return {
          id: c.category?.category_id,
          name: c.translated_text || c.category?.category_name,
          leftLabel: c.category?.left_label,
          rightLabel: c.category?.right_label
        };
      }
    });
    
    return NextResponse.json({ categories: formattedCategories });
    
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
} 