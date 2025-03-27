import { getXataClient } from "@/lib/database/xata";
import { jwtVerify } from "jose";
import type { JWTPayload } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface TokenPayload extends JWTPayload {
  address?: string;
}

interface CategoryScore {
  category_xata_id: string;
  score: number;
}

interface TestResult {
  category: string;
  insight: string;
  description: string;
  percentage: number;
}

interface ResultResponse {
  results?: TestResult[];
  error?: string;
}

interface UserScores {
  dipl: number;
  econ: number;
  govt: number;
  scty: number;
}

// Define the calculateSimilarity function locally
function calculateSimilarity(
  userScores: UserScores,
  ideologyScores: UserScores,
): number {
  // Calculate the Euclidean distance between two score vectors
  const diplDiff = userScores.dipl - ideologyScores.dipl;
  const econDiff = userScores.econ - ideologyScores.econ;
  const govtDiff = userScores.govt - ideologyScores.govt;
  const sctyDiff = userScores.scty - ideologyScores.scty;

  // Return the Euclidean distance (lower means more similar)
  return Math.sqrt(
    diplDiff * diplDiff +
    econDiff * econDiff +
    govtDiff * govtDiff +
    sctyDiff * sctyDiff
  );
}

/**
 * @swagger
 * /api/tests/{testId}/results:
 *   get:
 *     summary: Get test results and insights
 *     description: Retrieves test scores and generates insights based on user's answers
 *     parameters:
 *       - name: testId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved test results and insights
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                     example: "Economic"
 *                   insight:
 *                     type: string
 *                     example: "You relate more to..."
 *                   description:
 *                     type: string
 *                     example: "Centrist"
 *                   percentage:
 *                     type: number
 *                     example: 40
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Test progress not found
 *       500:
 *         description: Internal server error
 */

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export async function GET(
  _request: NextRequest,
  { params }: { params: { testId: string } },
) {
  try {
    const xata = getXataClient();
    const token = cookies().get("session")?.value;

    if (!token) {
      const response: ResultResponse = { error: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      const typedPayload = payload as TokenPayload;

      if (!typedPayload.address) {
        const response: ResultResponse = { error: "Invalid session" };
        return NextResponse.json(response, { status: 401 });
      }

      const user = await xata.db.Users.filter({
        wallet_address: typedPayload.address,
      }).getFirst();

      if (!user) {
        const response: ResultResponse = { error: "User not found" };
        return NextResponse.json(response, { status: 404 });
      }

      // Get test progress
      const progress = await xata.db.UserTestProgress.filter({
        "user.xata_id": user.xata_id,
        "test.test_id": Number.parseInt(params.testId, 10),
      }).getFirst();

      if (!progress) {
        const response: ResultResponse = { error: "Test progress not found" };
        return NextResponse.json(response, { status: 404 });
      }

      if (!progress.score) {
        const response: ResultResponse = { error: "Test not completed" };
        return NextResponse.json(response, { status: 400 });
      }

      // Get all categories with their names
      const categories = await xata.db.Categories.getAll();

      // Map scores to categories
      const categoryScores: CategoryScore[] = [
        {
          category_xata_id:
            categories.find((c) => c.category_name === "Economic")?.xata_id ||
            "",
          score: progress.score.econ,
        },
        {
          category_xata_id:
            categories.find((c) => c.category_name === "Civil")?.xata_id || "",
          score: progress.score.govt,
        },
        {
          category_xata_id:
            categories.find((c) => c.category_name === "Diplomatic")?.xata_id ||
            "",
          score: progress.score.dipl,
        },
        {
          category_xata_id:
            categories.find((c) => c.category_name === "Societal")?.xata_id ||
            "",
          score: progress.score.scty,
        },
      ].filter((cs) => cs.category_xata_id !== "");

      // Process each category score
      const results: TestResult[] = [];
      const test = await xata.db.Tests.filter({
        test_id: Number.parseInt(params.testId, 10),
      }).getFirst();

      if (!test) {
        const response: ResultResponse = { error: "Test not found" };
        return NextResponse.json(response, { status: 404 });
      }

      // Round all scores to integers
      for (const cs of categoryScores) {
        cs.score = Math.round(cs.score);
      }

      for (const categoryScore of categoryScores) {
        // Find matching insight based on score
        const insight = await xata.db.Insights.filter({
          "category.xata_id": categoryScore.category_xata_id,
          lower_limit: { $le: categoryScore.score },
          upper_limit: { $gt: categoryScore.score },
        }).getFirst();

        if (insight) {
          // Get category details
          const category = categories.find(
            (c) => c.xata_id === categoryScore.category_xata_id,
          );

          if (category) {
            // Save to InsightsPerUserCategory
            const latestInsight = await xata.db.InsightsPerUserCategory.sort(
              "insight_user_id",
              "desc",
            ).getFirst();
            const nextInsightId = (latestInsight?.insight_user_id || 0) + 1;

            // Get range description based on score
            let range = "neutral";
            if (categoryScore.score >= 45 && categoryScore.score <= 55) {
              range = "centrist";
            } else if (categoryScore.score >= 35 && categoryScore.score < 45) {
              range = "moderate";
            } else if (categoryScore.score >= 25 && categoryScore.score < 35) {
              range = "balanced";
            }

            await xata.db.InsightsPerUserCategory.create({
              category: category.xata_id,
              insight: insight.xata_id,
              test: test.xata_id,
              user: user.xata_id,
              description: range,
              percentage: categoryScore.score,
              insight_user_id: nextInsightId,
            });

            // Add to results
            results.push({
              category: category.category_name,
              insight: insight.insight,
              description: range,
              percentage: categoryScore.score,
            });
          }
        }
      }

      // Update progress status to completed
      await progress.update({
        status: "completed",
        completed_at: new Date(),
      });
      
      // Calculate and save the user's ideology
      console.log("Calculating and saving ideology for user after test completion");
      try {
        // Prepare the user's scores
        const userScores = {
          econ: progress.score.econ,
          dipl: progress.score.dipl,
          govt: progress.score.govt,
          scty: progress.score.scty
        };
        
        // Get all ideologies
        console.log('[Test Results API] Fetching all ideologies from database');
        const ideologies = await xata.db.Ideologies.getAll();

        if (!ideologies.length) {
          console.log('[Test Results API] No ideologies found in database');
        } else {
          console.log(`[Test Results API] Found ${ideologies.length} ideologies in database`);

          // Find best matching ideology
          let bestMatch = ideologies[0];
          let bestSimilarity = calculateSimilarity(
            userScores,
            ideologies[0].scores as typeof userScores,
          );

          for (const ideology of ideologies) {
            const similarity = calculateSimilarity(
              userScores,
              ideology.scores as typeof userScores,
            );
            if (similarity < bestSimilarity) {
              bestSimilarity = similarity;
              bestMatch = ideology;
            }
          }

          console.log(`[Test Results API] Best match found: ${bestMatch.name} with similarity: ${bestSimilarity}`);

          // Get latest ideology_user_id
          const latestIdeology = await xata.db.IdeologyPerUser.sort(
            "ideology_user_id",
            "desc",
          ).getFirst();
          const nextIdeologyId = (latestIdeology?.ideology_user_id || 0) + 1;

          // Store the English ideology name in the database
          console.log(`[Test Results API] Storing ideology in database with ID: ${nextIdeologyId}`);
          await xata.db.IdeologyPerUser.create({
            user: user.xata_id,
            ideology: bestMatch.xata_id,
            ideology_user_id: nextIdeologyId,
          });

          console.log(`[Test Results API] Successfully stored ideology: ${bestMatch.name}`);
        }
      } catch (ideologyError) {
        console.error("Error calculating ideology:", ideologyError);
        // Continue execution even if ideology calculation fails
      }

      const response: ResultResponse = { results };
      return NextResponse.json(response);
    } catch {
      const response: ResultResponse = { error: "Invalid session" };
      return NextResponse.json(response, { status: 401 });
    }
  } catch (error) {
    console.error("Error processing test results:", error);
    const response: ResultResponse = {
      error: "Failed to process test results",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { testId: string } },
) {
  try {
    const xata = getXataClient();
    const token = cookies().get("session")?.value;

    if (!token) {
      const response: ResultResponse = { error: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      const typedPayload = payload as TokenPayload;

      if (!typedPayload.address) {
        const response: ResultResponse = { error: "Invalid session" };
        return NextResponse.json(response, { status: 401 });
      }

      const user = await xata.db.Users.filter({
        wallet_address: typedPayload.address,
      }).getFirst();

      if (!user) {
        const response: ResultResponse = { error: "User not found" };
        return NextResponse.json(response, { status: 404 });
      }

      // Get test progress
      const progress = await xata.db.UserTestProgress.filter({
        "user.xata_id": user.xata_id,
        "test.test_id": Number.parseInt(params.testId, 10),
      }).getFirst();

      if (!progress) {
        const response: ResultResponse = { error: "Test progress not found" };
        return NextResponse.json(response, { status: 404 });
      }

      if (!progress.score) {
        const response: ResultResponse = { error: "Test not completed" };
        return NextResponse.json(response, { status: 400 });
      }

      // Get all categories with their names
      const categories = await xata.db.Categories.getAll();

      // Map scores to categories
      const categoryScores: CategoryScore[] = [
        {
          category_xata_id:
            categories.find((c) => c.category_name === "Economic")?.xata_id ||
            "",
          score: progress.score.econ,
        },
        {
          category_xata_id:
            categories.find((c) => c.category_name === "Civil")?.xata_id || "",
          score: progress.score.govt,
        },
        {
          category_xata_id:
            categories.find((c) => c.category_name === "Diplomatic")?.xata_id ||
            "",
          score: progress.score.dipl,
        },
        {
          category_xata_id:
            categories.find((c) => c.category_name === "Societal")?.xata_id ||
            "",
          score: progress.score.scty,
        },
      ].filter((cs) => cs.category_xata_id !== "");

      // Process each category score
      const results: TestResult[] = [];
      const test = await xata.db.Tests.filter({
        test_id: Number.parseInt(params.testId, 10),
      }).getFirst();

      if (!test) {
        const response: ResultResponse = { error: "Test not found" };
        return NextResponse.json(response, { status: 404 });
      }

      // Round all scores to integers
      for (const cs of categoryScores) {
        cs.score = Math.round(cs.score);
      }

      // Delete existing insights if forceUpdate is true
      const { forceUpdate } = await request.json();
      if (forceUpdate) {
        const existingInsights = await xata.db.InsightsPerUserCategory.filter({
          "user.xata_id": user.xata_id,
          "test.xata_id": test.xata_id,
        }).getMany();
        
        // Delete each insight individually
        for (const insight of existingInsights) {
          await insight.delete();
        }
      }

      for (const categoryScore of categoryScores) {
        // Find matching insight based on score
        const insight = await xata.db.Insights.filter({
          "category.xata_id": categoryScore.category_xata_id,
          lower_limit: { $le: categoryScore.score },
          upper_limit: { $gt: categoryScore.score },
        }).getFirst();

        if (insight) {
          // Get category details
          const category = categories.find(
            (c) => c.xata_id === categoryScore.category_xata_id,
          );

          if (category) {
            // Save to InsightsPerUserCategory
            const latestInsight = await xata.db.InsightsPerUserCategory.sort(
              "insight_user_id",
              "desc",
            ).getFirst();
            const nextInsightId = (latestInsight?.insight_user_id || 0) + 1;

            // Get range description based on score
            let range = "neutral";
            if (categoryScore.score >= 45 && categoryScore.score <= 55) {
              range = "centrist";
            } else if (categoryScore.score >= 35 && categoryScore.score < 45) {
              range = "moderate";
            } else if (categoryScore.score >= 25 && categoryScore.score < 35) {
              range = "balanced";
            }

            await xata.db.InsightsPerUserCategory.create({
              category: category.xata_id,
              insight: insight.xata_id,
              test: test.xata_id,
              user: user.xata_id,
              description: range,
              percentage: categoryScore.score,
              insight_user_id: nextInsightId,
            });

            // Add to results
            results.push({
              category: category.category_name,
              insight: insight.insight,
              description: range,
              percentage: categoryScore.score,
            });
          }
        }
      }

      // Update progress status to completed
      await progress.update({
        status: "completed",
        completed_at: new Date(),
      });

      // Calculate and save the user's ideology
      console.log("Calculating and saving ideology for user after test completion");
      try {
        // Prepare the user's scores
        const userScores = {
          econ: progress.score.econ,
          dipl: progress.score.dipl,
          govt: progress.score.govt,
          scty: progress.score.scty
        };
        
        // Get all ideologies
        console.log('[Test Results API] Fetching all ideologies from database');
        const ideologies = await xata.db.Ideologies.getAll();

        if (!ideologies.length) {
          console.log('[Test Results API] No ideologies found in database');
        } else {
          console.log(`[Test Results API] Found ${ideologies.length} ideologies in database`);

          // Find best matching ideology
          let bestMatch = ideologies[0];
          let bestSimilarity = calculateSimilarity(
            userScores,
            ideologies[0].scores as typeof userScores,
          );

          for (const ideology of ideologies) {
            const similarity = calculateSimilarity(
              userScores,
              ideology.scores as typeof userScores,
            );
            if (similarity < bestSimilarity) {
              bestSimilarity = similarity;
              bestMatch = ideology;
            }
          }

          console.log(`[Test Results API] Best match found: ${bestMatch.name} with similarity: ${bestSimilarity}`);

          // Get latest ideology_user_id
          const latestIdeology = await xata.db.IdeologyPerUser.sort(
            "ideology_user_id",
            "desc",
          ).getFirst();
          const nextIdeologyId = (latestIdeology?.ideology_user_id || 0) + 1;

          // Store the English ideology name in the database
          console.log(`[Test Results API] Storing ideology in database with ID: ${nextIdeologyId}`);
          await xata.db.IdeologyPerUser.create({
            user: user.xata_id,
            ideology: bestMatch.xata_id,
            ideology_user_id: nextIdeologyId,
          });

          console.log(`[Test Results API] Successfully stored ideology: ${bestMatch.name}`);
        }
      } catch (ideologyError) {
        console.error("Error calculating ideology:", ideologyError);
        // Continue execution even if ideology calculation fails
      }

      const response: ResultResponse = { results };
      return NextResponse.json(response);
    } catch (error) {
      console.error("Error processing request:", error);
      const response: ResultResponse = { error: "Invalid session" };
      return NextResponse.json(response, { status: 401 });
    }
  } catch (error) {
    console.error("Error processing test results:", error);
    const response: ResultResponse = {
      error: "Failed to process test results",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { testId: string } },
) {
  return POST(request, { params });
}
