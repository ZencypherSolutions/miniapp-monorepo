import { getXataClient } from "@/lib/database/xata";
import { jwtVerify } from "jose";
import type { JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { translations } from "@/i18n/translations";

// Define environment variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const secret = new TextEncoder().encode(JWT_SECRET);

interface TokenPayload extends JWTPayload {
  address?: string;
}

interface CelebrityResponse {
  celebrity?: string;
  error?: string;
  debug?: {
    figureId?: string;
    totalMatches?: number;
    ideologyId?: string;
    ideologyName?: string;
    note?: string;
    user?: string;
    languageRequested?: string;
    originalName?: string;
  }; // Add debug information with explicit types
}

/**
 * @swagger
 * /api/public-figures:
 *   get:
 *     summary: Get user's celebrity match
 *     description: Retrieves the user's current celebrity match from their latest test results
 *     tags:
 *       - Celebrity
 *     security:
 *       - SessionCookie: []
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *         description: Language code to get translated content (e.g., 'es' for Spanish)
 *     responses:
 *       200:
 *         description: Successfully retrieved user's celebrity match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 celebrity:
 *                   type: string
 *                   example: "Elon Musk"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User or celebrity match not found
 *       500:
 *         description: Internal server error
 */
export async function GET(request: Request) {
  try {
    // Get language from URL params
    const url = new URL(request.url);
    const lang = url.searchParams.get('lang') || 'en';
    
    console.log(`[PublicFigures API] Language requested: ${lang} from URL: ${request.url}`);
    
    // Get translated strings for the specified language
    const t = translations[lang as keyof typeof translations] || translations.en;
    
    const xata = getXataClient();
    const token = cookies().get("session")?.value;

    if (!token) {
      console.log(`[PublicFigures API] No session token found`);
      const response: CelebrityResponse = { error: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      const typedPayload = payload as TokenPayload;

      if (!typedPayload.address) {
        console.log(`[PublicFigures API] No address in token payload`);
        const response: CelebrityResponse = { error: "Invalid session" };
        return NextResponse.json(response, { status: 401 });
      }

      console.log(`[PublicFigures API] User wallet address: ${typedPayload.address}`);
      const user = await xata.db.Users.filter({
        wallet_address: typedPayload.address,
      }).getFirst();

      if (!user) {
        console.log(`[PublicFigures API] User not found for wallet: ${typedPayload.address}`);
        const response: CelebrityResponse = { error: "User not found" };
        return NextResponse.json(response, { status: 404 });
      }

      console.log(`[PublicFigures API] Found user with ID: ${user.xata_id}`);

      // Get user's latest ideology
      const userIdeology = await xata.db.IdeologyPerUser.filter({
        "user.xata_id": user.xata_id,
      })
        .sort("ideology_user_id", "desc")
        .select(["ideology.xata_id", "ideology.name"])
        .getFirst();

      if (!userIdeology?.ideology?.xata_id) {
        console.log(`[PublicFigures API] No ideology found for user: ${user.xata_id}`);
        const response: CelebrityResponse = { 
          error: "No ideology found for user",
          debug: { user: user.xata_id }
        };
        return NextResponse.json(response, { status: 404 });
      }

      console.log(`[PublicFigures API] Found ideology: ${userIdeology.ideology.name} with ID: ${userIdeology.ideology.xata_id}`);

      // Get all public figures with matching ideology
      console.log(`[PublicFigures API] Searching for public figures with ideology ID: ${userIdeology.ideology.xata_id}`);

      // Check query to debug
      const queryParams = {
        "ideology.xata_id": userIdeology.ideology.xata_id,
      };
      console.log(`[PublicFigures API] Query params:`, queryParams);

      // First try to find exact ideology match
      console.log(`[PublicFigures API] Executing query with ideology ID: ${userIdeology.ideology.xata_id}`);
      const matchingFigures = await xata.db.PublicFigures
        .filter(queryParams)
        .select(["name", "xata_id", "ideology.xata_id"])
        .getMany();

      console.log(`[PublicFigures API] Found ${matchingFigures.length} exactly matching public figures`);

      // Show the found records for debugging
      if (matchingFigures.length > 0) {
        console.log('[PublicFigures API] Matching figures:');
        matchingFigures.forEach((figure, index) => {
          console.log(`[${index}] Figure: ${figure.name}, ID: ${figure.xata_id}`);
        });
      }

      // If no exact matches, try a fallback approach
      if (!matchingFigures.length) {
        // Log all available public figures for debugging
        console.log(`[PublicFigures API] No exact matches found. Getting all public figures for debugging.`);
        const allFigures = await xata.db.PublicFigures.getAll();
        console.log(`[PublicFigures API] Total public figures in DB: ${allFigures.length}`);
        
        if (allFigures.length > 0) {
          console.log(`[PublicFigures API] Available figure ideologies:`);
          for (const figure of allFigures) {
            const ideologyId = figure.ideology?.xata_id;
            console.log(`- Figure: ${figure.name}, Ideology ID: ${ideologyId || 'Unknown'}`);
          }
          
          // Use any available figure as fallback
          const selectedFigure = allFigures[0];
          console.log(`[PublicFigures API] Using fallback figure: ${selectedFigure.name}`);
          
          // Try to find a translation for the public figure name
          const nameKey = selectedFigure.name?.toLowerCase().replace(/\s+/g, '') || '';
          let translatedName = selectedFigure.name;
          
          // Check if we have a translation for this public figure
          const publicFigures = t.publicFigures as Record<string, string> | undefined;
          if (publicFigures && publicFigures[nameKey]) {
            translatedName = publicFigures[nameKey];
            console.log(`[PublicFigures API] Found translation for ${nameKey}: ${translatedName}`);
          }
          
          const response: CelebrityResponse = { 
            celebrity: translatedName,
            debug: {
              figureId: selectedFigure.xata_id,
              totalMatches: 0,
              ideologyId: userIdeology.ideology.xata_id,
              ideologyName: userIdeology.ideology.name,
              languageRequested: lang,
              originalName: selectedFigure.name,
              note: "Fallback figure used (no ideology match)"
            }
          };
          return NextResponse.json(response);
        }
        
        // If still no figures, return error
        console.log(`[PublicFigures API] No public figures found at all`);
        const response: CelebrityResponse = { 
          error: "No public figures found in the database",
          debug: { 
            ideologyId: userIdeology.ideology.xata_id,
            ideologyName: userIdeology.ideology.name,
            languageRequested: lang
          }
        };
        return NextResponse.json(response, { status: 404 });
      }

      // Randomly select one matching public figure
      const randomIndex = Math.floor(Math.random() * matchingFigures.length);
      const selectedFigure = matchingFigures[randomIndex];

      // Log the selected figure for debugging
      console.log(`[PublicFigures API] Selected figure: ${selectedFigure.name} (${selectedFigure.xata_id})`);
      
      // Try to find a translation for the public figure name
      // Convert the name to a format suitable for lookup (lowercase, no spaces)
      const nameKey = selectedFigure.name?.toLowerCase().replace(/\s+/g, '') || '';
      let translatedName = selectedFigure.name;
      
      // Check if we have a translation for this public figure
      const publicFigures = t.publicFigures as Record<string, string> | undefined;
      if (publicFigures && publicFigures[nameKey]) {
        translatedName = publicFigures[nameKey];
        console.log(`[PublicFigures API] Found translation for ${nameKey}: ${translatedName}`);
      } else {
        console.log(`[PublicFigures API] No translation found for key: ${nameKey}, using original name`);
      }
      
      console.log(`[PublicFigures API] Using figure name: ${translatedName}`);

      const response: CelebrityResponse = { 
        celebrity: translatedName,
        debug: {
          figureId: selectedFigure.xata_id,
          totalMatches: matchingFigures.length,
          ideologyId: userIdeology.ideology.xata_id,
          ideologyName: userIdeology.ideology.name,
          languageRequested: lang,
          originalName: selectedFigure.name
        }
      };
      return NextResponse.json(response);
    } catch (error) {
      console.error("[PublicFigures API] Error verifying session:", error);
      const response: CelebrityResponse = { error: "Invalid session" };
      return NextResponse.json(response, { status: 401 });
    }
  } catch (error) {
    console.error("[PublicFigures API] Error finding celebrity match:", error);
    const response: CelebrityResponse = { error: "Failed to find celebrity match" };
    return NextResponse.json(response, { status: 500 });
  }
}
