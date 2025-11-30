// backend/src/services/summarizeService.ts
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Summarize a list of note texts into a short digest
export async function summarizeNotes(notes: string[]): Promise<string> {
  if (!notes.length) {
    return "No notes yet. Add something to your LifeLog first.";
  }

  // Join notes and trim so we don't exceed token limits
  const joined = notes.join("\n\n").slice(-6000);

  const prompt = `
You are LifeLog AI. Summarize the user's personal notes into 4–6 concise bullet points.
Focus on: what they did, what they learned, and any important tasks or events.

Notes:
${joined}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // or gpt-4.1-mini if you prefer
    messages: [
      {
        role: "system",
        content:
          "You summarize a user's personal knowledge base and daily log.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 320,
  });

  return (
    response.choices[0].message.content ||
    "No summary generated. Try adding more notes."
  );
}
