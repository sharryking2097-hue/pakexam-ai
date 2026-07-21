import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { question, imageBase64 } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Server Key missing" }, { status: 500 });
    }

    const systemPrompt = `You are an expert Pakistani BISE Board Examiner. Solve exam questions strictly following board patterns:
1. Given Data
2. Formula Used
3. Step-by-Step Solution
4. Final Answer with Units (Bold)`;

    const parts = [{ text: `${systemPrompt}\n\nQuestion:\n${question || "Solve image problem"}` }];

    if (imageBase64) {
      const mimeType = imageBase64.substring(imageBase64.indexOf(":") + 1, imageBase64.indexOf(";"));
      const base64Data = imageBase64.split(",")[1];
      parts.push({
        inline_data: { mime_type: mimeType || "image/jpeg", data: base64Data }
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }] })
    });

    const data = await response.json();
    const solution = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";

    return NextResponse.json({ solution });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
