'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, User, Bot, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import type {
  ChatMessage,
  UserProfile,
  WorkoutPlan,
  NutritionPlan,
} from '@/lib/types/app'
import { storage } from '@/lib/storage'

interface ChatTabProps {
  profile: UserProfile | null
  workoutPlan: WorkoutPlan | null
  nutritionPlan: NutritionPlan | null
}

const SUGGESTED_PROMPTS = [
  { icon: '💪', text: 'Can you adjust my workout for a home session today?' },
  { icon: '🥗', text: 'What should I eat pre-workout for energy?' },
  { icon: '📈', text: 'How do I break through a plateau on bench press?' },
  { icon: '🔥', text: 'I missed two days. How do I get back on track?' },
  { icon: '😴', text: 'How important is sleep for muscle recovery?' },
  { icon: '⚖️', text: 'How long until I see results with my plan?' },
]

export function ChatTab({ profile, workoutPlan, nutritionPlan }: ChatTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Load chat history on mount
  useEffect(() => {
    const saved = storage.getChat()
    if (saved.length > 0) {
      setMessages(saved)
    } else {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content:
            profile
              ? `Hey ${profile.name}! 👋 I'm FlexAI, your personal fitness coach. I can see your workout and nutrition plans, so ask me anything — form tips, substitutions, motivation, or how to adjust your program. What's on your mind?`
              : "Hey there! I'm FlexAI, your AI fitness coach. Ask me anything about training, nutrition, or recovery!",
          timestamp: Date.now(),
        },
      ])
    }
  }, [profile])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const persist = (msgs: ChatMessage[]) => {
    setMessages(msgs)
    storage.setChat(msgs)
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    }
    const newMessages = [...messages, userMsg]
    persist(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role, content: m.content })),
          profile,
          workoutPlan,
          nutritionPlan,
        }),
      })

      const data = await res.json()
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content:
          data.response ||
          data.error ||
          "I'm having trouble responding right now. Try again?",
        timestamp: Date.now(),
      }
      persist([...newMessages, assistantMsg])
    } catch {
      persist([
        ...newMessages,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. Please check your connection and try again.",
          timestamp: Date.now(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    storage.clearChat()
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Fresh start! What would you like to talk about?',
        timestamp: Date.now(),
      },
    ])
    toast({ title: 'Chat cleared', duration: 1500 })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
              <Bot className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
          </div>
          <div>
            <p className="font-semibold text-sm leading-none">FlexAI Coach</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Knows your plan · Online
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={handleClear}
          title="Clear chat"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
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
                  'max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm',
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

      {/* Suggested prompts (only show when few messages) */}
      {messages.length <= 1 && !loading && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Try asking
          </p>
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 -mx-1 px-1">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p.text}
                onClick={() => sendMessage(p.text)}
                className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs whitespace-nowrap hover:border-emerald-400/60 hover:bg-emerald-500/5 transition-colors shrink-0"
              >
                <span>{p.icon}</span>
                <span className="text-muted-foreground">{p.text.slice(0, 32)}...</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          sendMessage(input)
        }}
        className="p-3 border-t border-border/40 flex items-center gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your coach anything..."
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
    </div>
  )
}
