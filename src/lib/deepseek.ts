// Server-side DeepSeek API client (OpenAI-compatible)
// IMPORTANT: This module must only be imported in server code (API routes).

const API_KEY = process.env.DEEPSEEK_API_KEY
const BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1'
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

export interface ChatMessageInput {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface DeepSeekCompletionParams {
  messages: ChatMessageInput[]
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}

interface DeepSeekCompletionResult {
  content: string | null
  error?: string
}

export async function deepseekComplete(
  params: DeepSeekCompletionParams
): Promise<DeepSeekCompletionResult> {
  if (!API_KEY) {
    return { content: null, error: 'DeepSeek API key is not configured' }
  }

  try {
    const body: Record<string, unknown> = {
      model: MODEL,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 4096,
      stream: false,
    }
    if (params.jsonMode) {
      body.response_format = { type: 'json_object' }
    }

    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('DeepSeek API error:', res.status, errText)
      return {
        content: null,
        error: `DeepSeek API error (${res.status}): ${errText.slice(0, 200)}`,
      }
    }

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content ?? null
    return { content }
  } catch (err) {
    console.error('DeepSeek request failed:', err)
    return {
      content: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

export async function deepseekJson<T>(
  messages: ChatMessageInput[],
  temperature = 0.7
): Promise<{ data: T | null; error?: string; raw?: string }> {
  const { content, error } = await deepseekComplete({
    messages,
    temperature,
    jsonMode: true,
    maxTokens: 8192,
  })

  if (error) return { data: null, error }
  if (!content) return { data: null, error: 'Empty response from model' }

  // Try to extract JSON from the response (sometimes models wrap in markdown)
  let jsonStr = content.trim()
  // Strip markdown code fences if present
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim()
  }

  try {
    return { data: JSON.parse(jsonStr) as T, raw: content }
  } catch {
    // Try to find the first { ... } block
    const braceMatch = jsonStr.match(/\{[\s\S]*\}/)
    if (braceMatch) {
      try {
        return { data: JSON.parse(braceMatch[0]) as T, raw: content }
      } catch {
        // fall through
      }
    }
    return {
      data: null,
      error: 'Failed to parse JSON from model response',
      raw: content,
    }
  }
}
