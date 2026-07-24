import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Allowed media types supported by Anthropic API
const ALLOWED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export async function POST(request) {
  try {
    // Safely parse JSON body
    const body = await request.json().catch(() => ({}));
    const { question, imageBase64 } = body;

    if (!question && !imageBase64) {
      return NextResponse.json(
        { error: "Please type a question or upload an image." },
        { status: 400 }
      );
    }

    const content = [];

    // Base64 & Media Type Validation
    if (imageBase64) {
      let base64Data = imageBase64;
      let mediaType = "image/jpeg"; // Default fallback

      if (imageBase64.includes(",")) {
        const parts = imageBase64.split(",");
        const header = parts[0];
        base64Data = parts[1];

        const match = header.match(/:(.*?);/);
        if (match && match[1]) {
          mediaType = match[1].toLowerCase();
        }
      }

      // Clean base64 string (remove accidental whitespace/newlines)
      base64Data = base64Data.replace(/\s/g, "");

      // Ensure media type is explicitly allowed by Claude API
      if (!ALLOWED_MEDIA_TYPES.includes(mediaType)) {
        mediaType = "image/jpeg";
      }

      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType,
          data: base64Data,
        },
      });
    }

    const textPrompt = question
      ? `You are a Pakistani BISE Board exam expert. Solve this question step by step.
- For numerical problems: show every step clearly with formulas
- For theory questions: give a complete but concise answer
- Use simple English. If the question is in Urdu, answer in Urdu.
- At the end, write the final answer clearly.

Question: ${question}`
      : `You are a Pakistani BISE Board exam expert. Look at this exam question image and solve it step by step.
- For numerical problems: show every step clearly with formulas
- For theory questions: give a complete but concise answer  
- Use simple English. If the question is in Urdu, answer in Urdu.
- At the end, write the final answer clearly.`;

    content.push({ type: "text", text: textPrompt });

    // Call Anthropic API
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      messages: [{ role: "user", content }],
    });

    // Safely find and extract the text block
    const textBlock = response.content.find((block) => block.type === "text");
    const solution = textBlock ? textBlock.text : "";

    if (!solution) {
      return NextResponse.json(
        { error: "Koi jawab generate nahi ho saka. Dobara try karein." },
        { status: 500 }
      );
    }

    return NextResponse.json({ solution });

  } catch (error) {
    console.error("API Error:", error);

    // Handle specific API errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "API key invalid hai. Environment variable check karein." },
        { status: 401 }
      );
    }

    if (error?.status === 400) {
      return NextResponse.json(
        { error: "Invalid request or image format not supported by Claude." },
        { status: 400 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Bohot zyada requests! Thori der baad try karein." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Jawab nahi mila. Dobara try karein." },
      { status: 500 }
    );
  }
}
