import { getXataClient } from "@/lib/xata";
import { NextResponse } from "next/server";
//import { auth } from "@clerk/nextjs";

/**
 * @swagger
 * /api/fetch-test:
 *   get:
 *     summary: Fetch all tests with user progress
 *     description: |
 *       Retrieves all available tests along with:
 *       - Test details (name, description)
 *       - Total number of questions per test
 *       - User's progress (answered questions)
 *       - Test status
 *       - Achievements (if any)
 *       
 *     tags:
 *       - Tests
 *     security:
 *       - ClerkAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved tests with progress
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     required:
 *                       - testId
 *                       - testName
 *                       - description
 *                       - totalQuestions
 *                       - answeredQuestions
 *                       - status
 *                     properties:
 *                       testId:
 *                         type: integer
 *                         description: Unique identifier for the test
 *                         example: 1
 *                       testName:
 *                         type: string
 *                         description: Name of the test
 *                         example: "Personality Assessment"
 *                       description:
 *                         type: string
 *                         description: Detailed description of the test
 *                         example: "Comprehensive personality assessment test"
 *                       totalQuestions:
 *                         type: integer
 *                         description: Total number of questions in the test
 *                         example: 20
 *                       answeredQuestions:
 *                         type: integer
 *                         description: Number of questions answered by the user
 *                         example: 8
 *                       status:
 *                         type: string
 *                         description: Current status of the test for the user
 *                         enum: [not_started, in_progress, completed]
 *                         example: "in_progress"
 *                       achievements:
 *                         type: array
 *                         description: List of achievements earned for this test
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               description: Unique identifier for the achievement
 *                               example: "ach_123"
 *                             title:
 *                               type: string
 *                               description: Title of the achievement
 *                               example: "Quick Thinker"
 *                             description:
 *                               type: string
 *                               description: Description of the achievement
 *                               example: "Completed test in under 10 minutes"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch tests"
 */
export async function GET() {
  try {
    // const { userId } = auth();
    // if (!userId) {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    const xata = getXataClient();
    
    // Fetch all tests
    const tests = await xata.db.Tests.getAll({
      columns: ["test_id", "test_name", "test_description"],
      sort: { "test_id": "asc" }
    });

    // For each test, get the questions count and user progress
    const testsWithProgress = await Promise.all(tests.map(async (test) => {
      // Get total questions for this test
      const questions = await xata.db.Questions.filter({
        "test.test_id": test.test_id
      }).getMany();
      
      const totalQuestions = questions.length;

      // Get user's progress for this test
      const userProgress = await xata.db.UserTestProgress.filter({
        "test.test_id": test.test_id,
        "user.user_uuid": userId
      }).getFirst();

      // Count answered questions from the progress
      const answeredQuestions = userProgress?.answers 
        ? Object.keys(userProgress.answers as object).length 
        : 0;

      return {
        testId: test.test_id,
        testName: test.test_name,
        description: test.test_description,
        totalQuestions,
        answeredQuestions,
        status: userProgress?.status || "not_started",
        // TODO: Add achievements when implemented
        achievements: [] 
      };
    }));

    return NextResponse.json(
      { tests: testsWithProgress },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching tests:", error);
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    );
  }
}
