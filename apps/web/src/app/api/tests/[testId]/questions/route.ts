import { getXataClient } from "@/lib/database/xata";
import type { Language } from "@/i18n";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface Question {
  id: number;
  question: string;
  effect: unknown;
}

interface QuestionResponse {
  questions?: Question[];
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { testId: string } },
) {
  try {
    const testId = Number.parseInt(params.testId, 10);
    
    // Get language from query param or default to English
    const language = (request.nextUrl.searchParams.get("lang") || "en") as Language;

    // Validate the test ID
    if (Number.isNaN(testId) || testId <= 0) {
      const response: QuestionResponse = { error: "Invalid test ID" };
      return NextResponse.json(response, { status: 400 });
    }

    const xata = getXataClient();

    // If language is English, fetch directly from Questions table
    if (language === 'en') {
      // Fetch all questions for the specified test
      const questions = await xata.db.Questions.filter({ "test.test_id": testId })
        .select(["question_id", "question", "effect", "sort_order"])
        .sort("sort_order", "asc")
        .getAll();

      // Check if questions were found
      if (!questions || questions.length === 0) {
        const response: QuestionResponse = {
          error: "No questions found for this test",
        };
        return NextResponse.json(response, { status: 404 });
      }

      // Transform the questions to match the expected format
      const formattedQuestions = questions.map((q) => ({
        id: q.question_id,
        question: q.question,
        effect: q.effect, // Use the effect values from the database
      }));

      const response: QuestionResponse = { questions: formattedQuestions };
      return NextResponse.json(response);
    }
    
    // For other languages, join with QuestionsTranslate
    const questionsWithTranslations = await xata.db.QuestionsTranslate
      .filter({
        "language.short": language
      })
      .select([
        "translated_text",
        "question.question_id",
        "question.effect",
        "question.sort_order",
        "question.test.test_id"
      ])
      .getAll();

    // Filter by test
    const filteredQuestions = questionsWithTranslations.filter(q => q.question?.test?.test_id === testId);
    
    // Sort by sort_order
    filteredQuestions.sort((a, b) => {
      const orderA = a.question?.sort_order || 0;
      const orderB = b.question?.sort_order || 0;
      return orderA - orderB;
    });

    // Check if questions were found
    if (!filteredQuestions || filteredQuestions.length === 0) {
      const response: QuestionResponse = {
        error: "No questions found for this test in the specified language",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Map to match the expected format
    const formattedQuestions = filteredQuestions.map(qt => ({
      id: qt.question?.question_id as number,
      question: qt.translated_text as string,
      effect: qt.question?.effect,
    }));

    const response: QuestionResponse = { questions: formattedQuestions };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching questions:", error);
    const response: QuestionResponse = { error: "Failed to fetch questions" };
    return NextResponse.json(response, { status: 500 });
  }
}
