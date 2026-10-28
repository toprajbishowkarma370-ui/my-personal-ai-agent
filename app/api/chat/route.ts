import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ownerEmail = process.env.OWNER_EMAIL || "toprajbk81@gmail.com";
  if (session.user.email !== ownerEmail && process.env.NODE_ENV !== "development" && process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: "Access Denied: Owner only" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const message = body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "A valid message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is missing in environment variables" }, { status: 500 });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "You are a helpful Personal AI Business Agent. Support English, Nepali, and Roman Nepali. Help with business planning, leads, tasks, and website projects. Never claim you performed real actions unless they were actually completed. Ask for owner approval before external actions."
            }]
          },
          contents: [{
            role: "user",
            parts: [{ text: message.trim() }]
          }]
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || "Gemini request failed" }, { status: 502 });
    }

    const reply = (data?.candidates?.[0]?.content?.parts || [])
      .map((part: any) => part.text || "")
      .join("")
      .trim();

    if (!reply) {
      return NextResponse.json({ error: "Gemini returned an empty response" }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Server error while processing your message" }, { status: 500 });
  }
}
