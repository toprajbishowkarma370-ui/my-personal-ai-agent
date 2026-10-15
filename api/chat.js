import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
try {
const session = await getAuthSession();

if (!session || (session.user as any)?.role !== "ADMIN") {
  return NextResponse.json(
    { error: "Unauthorized: Owner session required" },
    { status: 401 }
  );
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  return NextResponse.json(
    { error: "GEMINI_API_KEY is missing in server environment" },
    { status: 500 }
  );
}

let body: unknown;

try {
  body = await req.json();
} catch {
  return NextResponse.json(
    { error: "Invalid JSON request body" },
    { status: 400 }
  );
}

const message =
  typeof body === "object" &&
  body !== null &&
  "message" in body &&
  typeof (body as { message?: unknown }).message === "string"
    ? (body as { message: string }).message.trim()
    : "";

if (!message) {
  return NextResponse.json(
    { error: 'Message must be a non-empty string' },
    { status: 400 }
  );
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const result = await model.generateContent(message);
const reply = result.response.text().trim();

if (!reply) {
  return NextResponse.json(
    { error: "Gemini returned an empty response" },
    { status: 502 }
  );
}

return NextResponse.json({ reply });

} catch (error: unknown) {
console.error("AI command error:", error);

return NextResponse.json(
  { error: "AI request failed. Check server configuration and logs." },
  { status: 500 }
);

}
}

export async function GET() {
return NextResponse.json(
{ error: "Method not allowed" },
{ status: 405 }
);
  }
