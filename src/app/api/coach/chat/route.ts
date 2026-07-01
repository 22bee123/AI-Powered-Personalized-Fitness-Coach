import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { appendChatMessages } from '@/lib/store';
import { createCoachReply } from '@/lib/fitness';
import type { ChatMessage } from '@/lib/types';

export const runtime = 'nodejs';

async function generateWithGemini(message: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(
    `You are an expert fitness coach. Answer in concise markdown with practical advice.\n\nUser message: ${message}`
  );

  return result.response.text();
}

export async function POST(request: Request) {
  const body = (await request.json()) as { message?: string };
  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json({ message: 'Message is required' }, { status: 400 });
  }

  const userMessage: ChatMessage = {
    id: `user_${Date.now()}`,
    sender: 'user',
    text: message,
    timestamp: new Date().toISOString(),
  };

  const aiText = (await generateWithGemini(message)) || createCoachReply(message);

  const aiMessage: ChatMessage = {
    id: `ai_${Date.now()}`,
    sender: 'ai',
    text: aiText,
    timestamp: new Date().toISOString(),
  };

  await appendChatMessages([userMessage, aiMessage]);

  return NextResponse.json({
    response: aiText,
    aiMessage,
  });
}

