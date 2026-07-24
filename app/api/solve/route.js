import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { question, imageBase64 } = await request.json();

    if (!question && !imageBase64) {
      return Response.json(
        { error: "Please type a question or upload an image." },
        { status: 400 }
      );
    }

    const content = [];

    if (imageBase64) {
      const [header, base64Data] = imageBase64.split(",");
      const mediaType = header.match(/:(.*?);/)[1];

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

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content }],
    });

    const solution = response.content[0].text;
    return Response.json({ solution });

  } catch (error) {
    console.error("API Error:", error);

    if (error.status === 401) {
      return Response.json(
        { error: "API key invalid hai. Environment variable check karein." },
        { status: 401 }
      );
    }
    if (error.status === 429) {
      return Response.json(
        { error: "Bohot zyada requests! Thori der baad try karein." },
        { status: 429 }
      );
    }

    return Response.json(
      { error: "Jawab nahi mila. Dobara try karein." },
      { status: 500 }
    );
  }
}
