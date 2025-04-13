import { jwtVerify } from "jose";
import type { JWTPayload } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface IdeologyScores {
  econ: number;
  dipl: number;
  govt: number;
  scty: number;
}

interface GeminiResponseCandidate {
  content: {
    parts: [
      {
        text: string;
      },
    ];
  };
}

interface GeminiResponse {
  candidates: GeminiResponseCandidate[];
}

interface ApiResponse {
  analysis?: string;
  error?: string;
}

interface TokenPayload extends JWTPayload {
  address?: string;
}

// English prompt template
function getEnglishPrompt(econ: number, dipl: number, govt: number, scty: number): string {
  return `[ROLE]
Act as a senior political scientist specializing in ideological analysis. Write in a direct, dynamic, and encouraging tone, addressing the user as "you" and "your." Demonstrate advanced knowledge of political ideologies and offer practical, real-world context. Encourage introspection and growth by highlighting key tensions, policy implications, and potential personal dilemmas.
[INPUT]
Economic: ${econ} | Diplomatic: ${dipl} | Government: ${govt} | Social: ${scty} (All 0-100)
[STRUCTURE]
Return your analysis in EXACTLY 5 sections with these headers:
Your Ideological Breakdown
Your Closest Ideological Matches
Your Likely Policy Preferences
Your Key Philosophical Tensions
Your Growth Opportunities
[REQUIREMENTS]
Breakdown
Begin each axis analysis with "Your [Axis] score of [X] suggests..."
Provide a concise descriptor (for example, "regulated capitalism with a welfare focus").
Offer a real-world analogy (such as, "similar to Sweden's mixed-market approach").
Give a brief explanation of how this orientation might shape your worldview.
Matches
Compare the user to 2-3 real-world political movements/parties.
Use percentage alignments only for broad ideological frameworks.
Highlight at least one area of divergence from each movement/party.
Preferences
Introduce policies with "You would likely support..."
Provide a concrete policy example (for instance, "universal childcare systems like Canada's 2023 Bill C-35").
Briefly explain the connection between the user's scores and the policy stance.
Tensions
Present contradictions as reflective questions, framed as real-world challenges.
Provide at least one historical or contemporary example illustrating how a similar tension has unfolded.
Growth
Recommend one academic resource that aligns with the user's scores.
Suggest one practical action step (for example, joining a local advocacy group).
Offer one reflective exercise (for example, writing a short essay that balances global cooperation with local autonomy).
[CONSTRAINTS]
Aim for approximately 600 words (±50).
Use AP style.
Do not use markdown formatting.
Avoid passive voice.
Explain technical terms in parentheses, for example, "multilateralism (global cooperation)."
Conclude with exactly 2 open-ended reflection questions for the user.
Begin the response immediately with the header "1. Your Ideological Breakdown"`;
}

// Spanish prompt template - translated version of the English prompt
function getSpanishPrompt(econ: number, dipl: number, govt: number, scty: number): string {
  return `[ROL]
Actúa como un politólogo senior especializado en análisis ideológico. Escribe en un tono directo, dinámico y alentador, dirigiéndote al usuario como "tú" y "tu". Demuestra un conocimiento avanzado de las ideologías políticas y ofrece un contexto práctico del mundo real. Fomenta la introspección y el crecimiento destacando tensiones clave, implicaciones políticas y posibles dilemas personales.
[ENTRADA]
Económico: ${econ} | Diplomático: ${dipl} | Gobierno: ${govt} | Social: ${scty} (Todos 0-100)
[ESTRUCTURA]
Devuelve tu análisis en EXACTAMENTE 5 secciones con estos encabezados:
Tu Desglose Ideológico
Tus Coincidencias Ideológicas Más Cercanas
Tus Probables Preferencias Políticas
Tus Tensiones Filosóficas Clave
Tus Oportunidades de Crecimiento
[REQUISITOS]
Desglose
Comienza cada análisis de eje con "Tu puntuación de [Eje] de [X] sugiere..."
Proporciona un descriptor conciso (por ejemplo, "capitalismo regulado con enfoque en el bienestar").
Ofrece una analogía del mundo real (como "similar al enfoque de mercado mixto de Suecia").
Da una breve explicación de cómo esta orientación podría dar forma a tu visión del mundo.
Coincidencias
Compara al usuario con 2-3 movimientos/partidos políticos reales.
Usa alineaciones porcentuales solo para marcos ideológicos amplios.
Destaca al menos un área de divergencia de cada movimiento/partido.
Preferencias
Introduce políticas con "Probablemente apoyarías..."
Proporciona un ejemplo concreto de política (por ejemplo, "sistemas universales de cuidado infantil como el Proyecto de Ley C-35 de Canadá de 2023").
Explica brevemente la conexión entre las puntuaciones del usuario y la postura política.
Tensiones
Presenta contradicciones como preguntas reflexivas, enmarcadas como desafíos del mundo real.
Proporciona al menos un ejemplo histórico o contemporáneo que ilustre cómo se ha desarrollado una tensión similar.
Crecimiento
Recomienda un recurso académico que se alinee con las puntuaciones del usuario.
Sugiere un paso práctico de acción (por ejemplo, unirse a un grupo local de defensa).
Ofrece un ejercicio reflexivo (por ejemplo, escribir un breve ensayo que equilibre la cooperación global con la autonomía local).
[RESTRICCIONES]
Apunta a aproximadamente 600 palabras (±50).
Utiliza el estilo AP.
No uses formato markdown.
Evita la voz pasiva.
Explica términos técnicos entre paréntesis, por ejemplo, "multilateralismo (cooperación global)".
Concluye con exactamente 2 preguntas abiertas de reflexión para el usuario.
Comienza la respuesta inmediatamente con el encabezado "1. Tu Desglose Ideológico"`;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export async function POST(request: NextRequest) {
  // Define isSpanish outside the try block to make it accessible in the catch block
  let isSpanish = false;
  
  try {
    const token = cookies().get("session")?.value;

    if (!token) {
      const response: ApiResponse = { error: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    const { payload: tokenPayload } = await jwtVerify(token, secret);
    const typedPayload = tokenPayload as TokenPayload;

    if (!typedPayload.address) {
      const response: ApiResponse = { error: "Invalid session" };
      return NextResponse.json(response, { status: 401 });
    }

    // Parse and validate input
    const body = await request.json();
    const scores = body as IdeologyScores & { language?: string };
    const { econ, dipl, govt, scty, language } = scores;
    isSpanish = language === 'es';

    if (
      econ === undefined ||
      dipl === undefined ||
      govt === undefined ||
      scty === undefined
    ) {
      return NextResponse.json(
        { error: isSpanish ? "Faltan campos requeridos" : "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate that each score is a number between 0 and 100
    for (const [key, value] of Object.entries({ econ, dipl, govt, scty })) {
      const score = Number(value);
      if (Number.isNaN(score) || score < 0 || score > 100) {
        return NextResponse.json(
          { 
            error: isSpanish 
              ? `Puntuación de ${key} inválida. Debe ser un número entre 0 y 100` 
              : `Invalid ${key} score. Must be a number between 0 and 100` 
          },
          { status: 400 },
        );
      }
    }

    // Get the prompt template based on language
    const promptTemplate = isSpanish ? getSpanishPrompt(econ, dipl, govt, scty) : getEnglishPrompt(econ, dipl, govt, scty);

    // Prepare Gemini API URL and payload
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not set in environment");
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // Gemini expects the prompt in a "contents" array with "parts"
    const payload = {
      contents: [
        {
          parts: [{ text: promptTemplate }],
        },
      ],
    };

    // Make the POST request to the Gemini API
    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini API error: ${errorText}`);
    }

    // Parse the response and extract the text from the first candidate
    const data = (await geminiResponse.json()) as GeminiResponse;
    const analysis =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      (isSpanish ? "No hay análisis disponible." : "No analysis available.");

    const response: ApiResponse = { analysis };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Gemini API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const response: ApiResponse = { 
      error: isSpanish 
        ? `Error: ${message}` 
        : message 
    };
    return NextResponse.json(response, { status: 500 });
  }
}
