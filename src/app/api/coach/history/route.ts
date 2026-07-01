import { NextResponse } from 'next/server';
import { clearChatHistory, getChatHistory } from '@/lib/store';

export const runtime = 'nodejs';

export async function GET() {
  const chatHistory = await getChatHistory();
  return NextResponse.json({ chatHistory });
}

export async function DELETE() {
  await clearChatHistory();
  return NextResponse.json({ success: true });
}

