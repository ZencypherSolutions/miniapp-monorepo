import { getXataClient } from "@/lib/database/xata";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Language } from "@/i18n";

interface Ideology {
  id: number;
  name: string;
  scores: Record<string, number>;
}

export interface IdeologyResponse {
  ideologies?: Ideology[];
  error?: string;
}

export const dynamic = "force-dynamic";

/**
 * Fetches ideologies with translations based on the provided language
 * @route GET /api/ideologies
 */
export async function GET(request: NextRequest) {
  try {
    const xata = getXataClient();
    
    // Get language from query param or default to English
    const language = (request.nextUrl.searchParams.get("lang") || "en") as Language;
    
    // If language is English, fetch directly from Ideologies table
    if (language === 'en') {
      const ideologies = await xata.db.Ideologies
        .select(["ideology_id", "name", "scores"])
        .sort("ideology_id", "asc")
        .getAll();
        
      if (!ideologies || ideologies.length === 0) {
        return NextResponse.json({ error: "No ideologies found" }, { status: 404 });
      }
      
      const formattedIdeologies = ideologies.map(i => ({
        id: i.ideology_id,
        name: i.name,
        scores: i.scores as Record<string, number>
      }));
      
      return NextResponse.json({ ideologies: formattedIdeologies });
    }
    
    // For other languages, join with IdeologiesTranslate
    const ideologiesWithTranslations = await xata.db.IdeologiesTranslate
      .filter({
        "language.short": language
      })
      .select([
        "translated_text",
        "ideology.ideology_id",
        "ideology.name",
        "ideology.scores"
      ])
      .sort("ideology.ideology_id", "asc")
      .getAll();
    
    if (!ideologiesWithTranslations || ideologiesWithTranslations.length === 0) {
      return NextResponse.json({ error: "No ideologies found in the specified language" }, { status: 404 });
    }
    
    // Format ideologies with translations
    const formattedIdeologies = ideologiesWithTranslations.map(i => {
      try {
        // Try to parse translated_text as JSON if it contains additional data
        const translatedData = JSON.parse(i.translated_text as string);
        return {
          id: i.ideology?.ideology_id,
          name: translatedData.name || i.ideology?.name,
          scores: i.ideology?.scores as Record<string, number>
        };
      } catch {
        // If not JSON, use it as the ideology name
        return {
          id: i.ideology?.ideology_id,
          name: i.translated_text || i.ideology?.name,
          scores: i.ideology?.scores as Record<string, number>
        };
      }
    });
    
    return NextResponse.json({ ideologies: formattedIdeologies });
    
  } catch (error) {
    console.error("Error fetching ideologies:", error);
    return NextResponse.json({ error: "Failed to fetch ideologies" }, { status: 500 });
  }
} 