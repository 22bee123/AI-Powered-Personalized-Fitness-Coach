'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, User, Bot, Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/lib/types/fitness'

const SUGGESTED_PROMPTS = [
  {
    title: 'Workout plan',
    text: 'Create a 3-day workout split for a beginner focusing on full body strength',
    icon: '💪',
  },
  {
    title: 'Form tips',
    text: 'How can I improve my squat form and avoid common mistakes?',
    icon: '🦵',
  },
  {
    title: 'Recovery',
    text: "What should I eat after a heavy lifting session for best recovery?",
    icon: '🍎',
  },
  {
    title: 'Plateau',
    text: "I've been stuck at the same bench press weight for weeks. How do I break through?",
    icon: '📈',
  },
  {
    title: 'Motivation',
    text: "I'm feeling unmotivated this week. Give me a pep talk and some tips to get back on track.",
    icon: '🔥',
  },
  {
    title: 'Analyze my data',
    text: "Based on my recent workouts, what should I focus on next?",
    icon: '🧠',
  },
]

export function CoachView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hey there! I'm FlexAI, your personal fitness coach. I can see your workout history and help you train smarter. Ask me anything about training, form, recovery, nutrition, or motivation!",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: ChatMessage = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response || data.error || 'Sorry, I could not respond.',
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. Please try again in a moment!",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            AI Coach
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-3 w-3" />
              FlexAI
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your personal trainer — powered by AI, informed by your data
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat */}
        <Card className="lg:col-span-2 flex flex-col h-[600px]">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background pulse-ring" />
              </div>
              <div>
                <CardTitle className="text-base">FlexAI Coach</CardTitle>
                <CardDescription className="text-xs">
                  Online · Knows your workout history
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4"
          >
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'flex gap-2.5',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm',
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary shrink-0">
                      <User className="h-4 w-4 text-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2.5 justify-start"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-border/60 flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask FlexAI anything about fitness..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 w-10 shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </Card>

        {/* Suggested prompts */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Try Asking
              </CardTitle>
              <CardDescription>Tap a suggestion to start</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p.title}
                  onClick={() => sendMessage(p.text)}
                  disabled={loading}
                  className="flex items-start gap-2.5 w-full rounded-lg border border-border/60 p-2.5 text-left hover:bg-muted/50 hover:border-emerald-400/60 transition-colors disabled:opacity-50"
                >
                  <span className="text-lg leading-none mt-0.5">{p.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {p.text}
                    </p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/5 to-orange-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 shrink-0">
                  <Bot className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Personalized Advice</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    FlexAI sees your recent workouts and goals, so its advice is tailored
                    to your actual training history.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
