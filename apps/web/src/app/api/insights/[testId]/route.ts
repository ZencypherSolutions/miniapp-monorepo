import { getXataClient } from "@/lib/database/xata";
import { jwtVerify } from "jose";
import type { JWTPayload } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Language } from "@/i18n";
import { translations } from "@/i18n/translations";

interface TokenPayload extends JWTPayload {
  address?: string;
}

interface Insight {
  category?: string;
  percentage?: number;
  description?: string;
  insight?: string;
  left_label?: string;
  right_label?: string;
}

interface InsightResponse {
  insights?: Insight[];
  error?: string;
}

/**
 * @swagger
 * /api/insights/{testId}:
 *   get:
 *     summary: Get insights for a specific test
 *     description: Retrieves all insights for a test, organized by category
 *     parameters:
 *       - name: testId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: lang
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [en, es]
 *           default: en
 *     responses:
 *       200:
 *         description: Successfully retrieved test insights
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 insights:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                       left_percentage:
 *                         type: number
 *                       right_percentage:
 *                         type: number
 *                       description:
 *                         type: string
 *                       insight:
 *                         type: string
 *       400:
 *         description: Invalid test ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Test, user, or insights not found
 *       500:
 *         description: Internal server error
 */

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export async function GET(
  request: NextRequest,
  { params }: { params: { testId: string } },
) {
  try {
    const xata = getXataClient();
    const token = cookies().get("session")?.value;
    
    // Get language from query params or default to English
    const language = (request.nextUrl.searchParams.get("lang") || "en") as Language;

    if (!token) {
      const response: InsightResponse = { error: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      const typedPayload = payload as TokenPayload;

      if (!typedPayload.address) {
        const response: InsightResponse = { error: "Invalid session" };
        return NextResponse.json(response, { status: 401 });
      }

      const user = await xata.db.Users.filter({
        wallet_address: typedPayload.address,
      }).getFirst();

      if (!user) {
        const response: InsightResponse = { error: "User not found" };
        return NextResponse.json(response, { status: 404 });
      }

      // Validate test ID
      const testId = Number.parseInt(params.testId, 10);
      if (Number.isNaN(testId) || testId <= 0) {
        const response: InsightResponse = { error: "Invalid test ID" };
        return NextResponse.json(response, { status: 400 });
      }

      // Get test
      const test = await xata.db.Tests.filter({ test_id: testId }).getFirst();
      if (!test) {
        const response: InsightResponse = { error: "Test not found" };
        return NextResponse.json(response, { status: 404 });
      }

      // Get insights for this test
      const userInsights = await xata.db.InsightsPerUserCategory.filter({
        "user.xata_id": user.xata_id,
        "test.test_id": testId,
      })
        .select([
          "category.category_name",
          "category.xata_id",
          "insight.insight",
          "insight.xata_id",
          "percentage",
          "description",
          "category.right_label",
          "category.left_label",
        ])
        .getMany();

      if (!userInsights.length) {
        const response: InsightResponse = {
          error: "No insights found for this test",
        };
        return NextResponse.json(response, { status: 404 });
      }
      
      // If language is Spanish, fetch translations for categories and insights
      const categoryTranslations = new Map();
      const insightTranslations = new Map();
      
      if (language === 'es') {
        // Get all category IDs and insight IDs from user insights
        const categoryIds = userInsights
          .map(record => record.category?.xata_id)
          .filter(Boolean) as string[];
          
        const insightIds = userInsights
          .map(record => record.insight?.xata_id)
          .filter(Boolean) as string[];
        
        // Fetch category translations
        const translatedCategories = await xata.db.CategoriesTranslate
          .filter({
            "language.short": language,
            "category.xata_id": { $any: categoryIds }
          })
          .select(["translated_text", "category.xata_id"])
          .getAll();
          
        // Store category translations in a map for quick lookup
        translatedCategories.forEach(cat => {
          if (cat.category?.xata_id && cat.translated_text) {
            try {
              // Try to parse as JSON which might contain name, left_label, right_label
              const translatedData = JSON.parse(cat.translated_text as string);
              categoryTranslations.set(cat.category.xata_id, {
                name: translatedData.name || '',
                left_label: translatedData.left_label || '',
                right_label: translatedData.right_label || '',
              });
            } catch {
              // If not JSON, use it as just the category name
              categoryTranslations.set(cat.category.xata_id, {
                name: cat.translated_text,
                left_label: '',
                right_label: '',
              });
            }
          }
        });
        
        // Fetch insight translations
        const translatedInsights = await xata.db.InsightsTranslate
          .filter({
            "language.short": language,
            "insight.xata_id": { $any: insightIds }
          })
          .select(["translated_text", "insight.xata_id"])
          .getAll();
          
        // Store insight translations in a map for quick lookup
        translatedInsights.forEach(ins => {
          if (ins.insight?.xata_id) {
            insightTranslations.set(ins.insight.xata_id, ins.translated_text);
          }
        });
      }
      
      // Function to translate description
      const translateDescription = (description: string | undefined): string => {
        if (!description) return '';
        
        const lowercaseDesc = description.toLowerCase();
        
        // For specific ideology values, use translations if available
        if (['centrist', 'moderate', 'balanced', 'neutral'].includes(lowercaseDesc)) {
          // Safely access the translation using type assertion for the key
          const key = lowercaseDesc as 'centrist' | 'moderate' | 'balanced' | 'neutral';
          return translations[language]?.ideology?.[key] || description;
        }
        
        return description;
      };
      
      // Function to normalize axis labels for consistency
      const normalizeAxisLabel = (label: string | undefined): string => {
        if (!label) return '';
        
        // Convert to lowercase and trim for normalization
        const normalizedLabel = label.toLowerCase().trim();
        
        // Map of common variations to standardized keys
        const axisLabelMap: Record<string, string> = {
          'equality': 'equality',
          'markets': 'markets',
          'liberty': 'liberty',
          'authority': 'authority',
          'nation': 'nation',
          'globe': 'globe',
          'tradition': 'tradition',
          'progress': 'progress',
          // Add any variations or synonyms here
          'igualdad': 'equality',
          'mercados': 'markets',
          'libertad': 'liberty',
          'autoridad': 'authority',
          'nación': 'nation',
          'global': 'globe',
          'tradición': 'tradition',
          'progreso': 'progress'
        };
        
        // Return the normalized form if it exists in our map
        return axisLabelMap[normalizedLabel] || label;
      };

      // Transform and organize insights
      const insights = userInsights
        .map((record) => {
          // Get translated category name and labels if available
          let categoryName = record.category?.category_name || '';
          let leftLabel = record.category?.left_label || '';
          let rightLabel = record.category?.right_label || '';
          let insightText = record.insight?.insight || '';
          
          if (language === 'es' && record.category?.xata_id) {
            const catTranslation = categoryTranslations.get(record.category.xata_id);
            if (catTranslation) {
              categoryName = catTranslation.name || categoryName;
              leftLabel = catTranslation.left_label || leftLabel;
              rightLabel = catTranslation.right_label || rightLabel;
            }
          }
          
          if (language === 'es' && record.insight?.xata_id) {
            const insTranslation = insightTranslations.get(record.insight.xata_id);
            if (insTranslation) {
              insightText = insTranslation || insightText;
            }
          }
          
          // Normalize the axis labels to ensure consistent translation client-side
          const normalizedLeftLabel = normalizeAxisLabel(leftLabel);
          const normalizedRightLabel = normalizeAxisLabel(rightLabel);
          
          return {
            category: categoryName,
            percentage: record.percentage,
            description: translateDescription(record.description),
            insight: insightText,
            left_label: normalizedLeftLabel,
            right_label: normalizedRightLabel,
          };
        })
        .filter((insight) => insight.category && insight.insight); // Filter out any incomplete records

      const response: InsightResponse = { insights };
      return NextResponse.json(response);
    } catch {
      const response: InsightResponse = { error: "Invalid session" };
      return NextResponse.json(response, { status: 401 });
    }
  } catch (error) {
    console.error("Error fetching test insights:", error);
    const response: InsightResponse = { error: "Internal server error" };
    return NextResponse.json(response, { status: 500 });
  }
}
