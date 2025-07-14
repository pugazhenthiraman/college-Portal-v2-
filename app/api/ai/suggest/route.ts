import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { content } = await req.json();
  if (!content) {
    return NextResponse.json({ error: 'No content provided.' }, { status: 400 });
  }

  // TODO: Replace this with a real AI call
  return NextResponse.json({
    suggestions: `• Check grammar and spelling.\n• Use more action verbs.\n• Add relevant keywords for your target job.\n\n(Your content: "${content.slice(0, 100)}...")`
  });
}