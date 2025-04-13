import { getXataClient } from "@/lib/database/xata";
import { jwtVerify } from "jose";
import type { JWTPayload } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Language } from "@/i18n";

interface TokenPayload extends JWTPayload {
  address?: string;
}

interface UserScores {
  dipl: number;
  econ: number;
  govt: number;
  scty: number;
}

interface IdeologyResponse {
  ideology?: string;
  error?: string;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const secret = new TextEncoder().encode(JWT_SECRET);

/**
 * Calculate the similarity between user scores and ideology scores
 * Lower score means more similar
 */
function calculateSimilarity(
  userScores: UserScores,
  ideologyScores: UserScores,
): number {
  const diff = {
    dipl: Math.abs(userScores.dipl - ideologyScores.dipl),
    econ: Math.abs(userScores.econ - ideologyScores.econ),
    govt: Math.abs(userScores.govt - ideologyScores.govt),
    scty: Math.abs(userScores.scty - ideologyScores.scty),
  };

  // Return average difference (lower is better)
  return (diff.dipl + diff.econ + diff.govt + diff.scty) / 4;
}

/**
 * @swagger
 * /api/ideology:
 *   post:
 *     summary: Calculate user's ideology based on scores
 *     description: Matches user's scores with closest ideology and updates IdeologyPerUser table
 *     tags:
 *       - Ideology
 *     security:
 *       - SessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dipl
 *               - econ
 *               - govt
 *               - scty
 *             properties:
 *               dipl:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               econ:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               govt:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               scty:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Successfully matched and saved ideology
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ideology:
 *                   type: string
 *                   example: "Social Democracy"
 *                 similarity:
 *                   type: number
 *                   example: 85.5
 *       400:
 *         description: Invalid scores provided
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    // Log the start of the request
    console.log('[Ideology API - POST] Starting to calculate ideology based on scores');
    
    const xata = getXataClient();
    const token = cookies().get("session")?.value;

    if (!token) {
      console.log('[Ideology API - POST] No session token found');
      const response: IdeologyResponse = { error: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      const typedPayload = payload as TokenPayload;

      if (!typedPayload.address) {
        console.log('[Ideology API - POST] No address in token payload');
        const response: IdeologyResponse = { error: "Invalid session" };
        return NextResponse.json(response, { status: 401 });
      }

      console.log(`[Ideology API - POST] Looking up user with wallet address: ${typedPayload.address}`);
      const user = await xata.db.Users.filter({
        wallet_address: typedPayload.address,
      }).getFirst();

      if (!user) {
        console.log('[Ideology API - POST] User not found');
        const response: IdeologyResponse = { error: "User not found" };
        return NextResponse.json(response, { status: 404 });
      }

      console.log(`[Ideology API - POST] Found user: ${user.xata_id}`);
      
      // Get user scores from request body
      const userScores = (await request.json()) as UserScores;
      console.log(`[Ideology API - POST] Received scores:`, userScores);

      // Validate scores
      const scores = [
        userScores.dipl,
        userScores.econ,
        userScores.govt,
        userScores.scty,
      ];
      if (
        scores.some(
          (score) => score < 0 || score > 100 || !Number.isFinite(score),
        )
      ) {
        console.log('[Ideology API - POST] Invalid scores provided');
        const response: IdeologyResponse = {
          error: "Invalid scores. All scores must be between 0 and 100",
        };
        return NextResponse.json(response, { status: 400 });
      }

      // Get all ideologies
      console.log('[Ideology API - POST] Fetching all ideologies from database');
      const ideologies = await xata.db.Ideologies.getAll();

      if (!ideologies.length) {
        console.log('[Ideology API - POST] No ideologies found in database');
        const response: IdeologyResponse = {
          error: "No ideologies found in database",
        };
        return NextResponse.json(response, { status: 404 });
      }

      console.log(`[Ideology API - POST] Found ${ideologies.length} ideologies in database`);

      // Find best matching ideology
      let bestMatch = ideologies[0];
      let bestSimilarity = calculateSimilarity(
        userScores,
        ideologies[0].scores as UserScores,
      );

      for (const ideology of ideologies) {
        const similarity = calculateSimilarity(
          userScores,
          ideology.scores as UserScores,
        );
        if (similarity < bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = ideology;
        }
      }

      console.log(`[Ideology API - POST] Best match found: ${bestMatch.name} with similarity: ${bestSimilarity}`);

      // Get latest ideology_user_id
      const latestIdeology = await xata.db.IdeologyPerUser.sort(
        "ideology_user_id",
        "desc",
      ).getFirst();
      const nextIdeologyId = (latestIdeology?.ideology_user_id || 0) + 1;

      // Always store the English ideology name in the database
      console.log(`[Ideology API - POST] Storing ideology in database with ID: ${nextIdeologyId}`);
      await xata.db.IdeologyPerUser.create({
        user: user.xata_id,
        ideology: bestMatch.xata_id,
        ideology_user_id: nextIdeologyId,
      });

      console.log(`[Ideology API - POST] Successfully stored ideology: ${bestMatch.name}`);
      const response: IdeologyResponse = { ideology: bestMatch.name };
      return NextResponse.json(response);
    } catch (error) {
      console.error('[Ideology API - POST] JWT verification or other error:', error);
      const response: IdeologyResponse = { error: "Invalid session" };
      return NextResponse.json(response, { status: 401 });
    }
  } catch (error) {
    console.error("[Ideology API - POST] Error calculating ideology:", error);
    const response: IdeologyResponse = {
      error: "Failed to calculate ideology",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * @swagger
 * /api/ideology:
 *   get:
 *     summary: Get user's ideology
 *     description: Retrieves the user's current ideology from their latest test results
 *     tags:
 *       - Ideology
 *     security:
 *       - SessionCookie: []
 *     parameters:
 *       - name: lang
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [en, es]
 *           default: en
 *     responses:
 *       200:
 *         description: Successfully retrieved user's ideology
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ideology:
 *                   type: string
 *                   example: "Social Democracy"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User or ideology not found
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[Ideology API - GET] Starting request with params:', request.nextUrl.searchParams.toString());
    const xata = getXataClient();
    const token = cookies().get("session")?.value;
    
    // Get language from query params or default to English
    const language = (request.nextUrl.searchParams.get("lang") || "en") as Language;
    console.log('[Ideology API - GET] Using language:', language);

    if (!token) {
      console.log('[Ideology API - GET] No session token found');
      const response: IdeologyResponse = { error: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      const typedPayload = payload as TokenPayload;

      if (!typedPayload.address) {
        console.log('[Ideology API - GET] No address in token payload');
        const response: IdeologyResponse = { error: "Invalid session" };
        return NextResponse.json(response, { status: 401 });
      }

      console.log('[Ideology API - GET] Looking up user with wallet address:', typedPayload.address);
      const user = await xata.db.Users.filter({
        wallet_address: typedPayload.address,
      }).getFirst();

      if (!user) {
        console.log('[Ideology API - GET] User not found with wallet address:', typedPayload.address);
        const response: IdeologyResponse = { error: "User not found" };
        return NextResponse.json(response, { status: 404 });
      }
      
      console.log('[Ideology API - GET] Found user:', user.xata_id);

      // Get user's latest ideology from IdeologyPerUser
      console.log('[Ideology API - GET] Fetching latest ideology for user:', user.xata_id);
      const userIdeology = await xata.db.IdeologyPerUser.filter({
        "user.xata_id": user.xata_id,
      })
        .sort("ideology_user_id", "desc")
        .select(["ideology.xata_id", "ideology.name", "ideology.ideology_id"])
        .getFirst();

      console.log('[Ideology API - GET] User ideology query result:', userIdeology);

      if (!userIdeology) {
        console.log('[Ideology API - GET] No ideology record found for user');
        const response: IdeologyResponse = {
          ideology: undefined,  // Will be omitted in the JSON
        };
        return NextResponse.json(response);
      }
      
      // Make sure we have an ideology object with a name
      if (!userIdeology.ideology?.name) {
        console.log('[Ideology API - GET] Ideology record exists but has no name property');
        
        // Try to fetch the ideology directly using the xata_id if available
        if (userIdeology.ideology?.xata_id) {
          console.log('[Ideology API - GET] Attempting to fetch ideology directly by ID:', userIdeology.ideology.xata_id);
          const ideology = await xata.db.Ideologies.read(userIdeology.ideology.xata_id);
          
          if (ideology && ideology.name) {
            console.log('[Ideology API - GET] Successfully fetched ideology by ID:', ideology.name);
            
            // If language is English, just return the English name
            if (language === 'en') {
              const response: IdeologyResponse = {
                ideology: ideology.name,
              };
              return NextResponse.json(response);
            }
            
            // Otherwise, look for a translation
            goto_translation:
            try {
              console.log('[Ideology API - GET] Fetching translation for ideology:', ideology.xata_id, 'in language:', language);
              const ideologyTranslation = await xata.db.IdeologiesTranslate
                .filter({
                  "language.short": language,
                  "ideology.xata_id": ideology.xata_id
                })
                .select(["translated_text"])
                .getFirst();

              if (ideologyTranslation?.translated_text) {
                try {
                  const translatedData = JSON.parse(ideologyTranslation.translated_text as string);
                  console.log('[Ideology API - GET] Parsed translated data:', translatedData);
                  const response: IdeologyResponse = {
                    ideology: translatedData.name || ideology.name,
                  };
                  return NextResponse.json(response);
                } catch {
                  console.log('[Ideology API - GET] Translation is not valid JSON, using as plain text:', ideologyTranslation.translated_text);
                  const response: IdeologyResponse = {
                    ideology: ideologyTranslation.translated_text as string,
                  };
                  return NextResponse.json(response);
                }
              } else {
                console.log('[Ideology API - GET] No translation found, fallback to English:', ideology.name);
                const response: IdeologyResponse = {
                  ideology: ideology.name,
                };
                return NextResponse.json(response);
              }
            } catch (e) {
              console.error('[Ideology API - GET] Error fetching translation:', e);
              const response: IdeologyResponse = {
                ideology: ideology.name,
              };
              return NextResponse.json(response);
            }
          }
        }
        
        // If we still don't have an ideology, return undefined
        const response: IdeologyResponse = {
          ideology: undefined,
        };
        return NextResponse.json(response);
      }
      
      console.log('[Ideology API - GET] Found ideology:', userIdeology.ideology.name, 'with ID:', userIdeology.ideology.xata_id);
      
      // If language is English, use the default name
      if (language === 'en') {
        console.log('[Ideology API - GET] Using English ideology name:', userIdeology.ideology.name);
        const response: IdeologyResponse = {
          ideology: userIdeology.ideology.name,
        };
        return NextResponse.json(response);
      }
      
      // For other languages, fetch the translation if available
      console.log('[Ideology API - GET] Fetching translation for ideology:', userIdeology.ideology.xata_id, 'in language:', language);
      const ideologyTranslation = await xata.db.IdeologiesTranslate
        .filter({
          "language.short": language,
          "ideology.xata_id": userIdeology.ideology.xata_id
        })
        .select(["translated_text"])
        .getFirst();

      console.log('[Ideology API - GET] Translation query result:', ideologyTranslation);

      if (ideologyTranslation?.translated_text) {
        // Try to parse as JSON if needed
        try {
          const translatedData = JSON.parse(ideologyTranslation.translated_text as string);
          console.log('[Ideology API - GET] Parsed translated data:', translatedData);
          const response: IdeologyResponse = {
            ideology: translatedData.name || userIdeology.ideology.name,
          };
          return NextResponse.json(response);
        } catch {
          console.log('[Ideology API - GET] Translation is not valid JSON, using as plain text:', ideologyTranslation.translated_text);
          // If not JSON, use as plain text
          const response: IdeologyResponse = {
            ideology: ideologyTranslation.translated_text as string,
          };
          return NextResponse.json(response);
        }
      }
      
      // Fallback to English if no translation found
      console.log('[Ideology API - GET] No translation found, fallback to English:', userIdeology.ideology.name);
      const response: IdeologyResponse = {
        ideology: userIdeology.ideology.name,
      };
      return NextResponse.json(response);
      
    } catch (error) {
      console.error('[Ideology API - GET] JWT verification or other error:', error);
      const response: IdeologyResponse = { error: "Invalid session" };
      return NextResponse.json(response, { status: 401 });
    }
  } catch (error) {
    console.error("[Ideology API - GET] Error fetching ideology:", error);
    const response: IdeologyResponse = { error: "Failed to fetch ideology" };
    return NextResponse.json(response, { status: 500 });
  }
}
