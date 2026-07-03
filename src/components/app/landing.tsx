'use client'

import { motion } from 'framer-motion'
import {
  Activity,
  Dumbbell,
  Salad,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Check,
  Zap,
  Target,
  Heart,
  ArrowRight,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface LandingProps {
  onGetStarted: () => void
}

export function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
              <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight leading-none">
                Fit<span className="text-emerald-500">Forge</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                AI Fitness Coach
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how" className="hover:text-foreground transition-colors">
              How it Works
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </a>
          </nav>
          <Button
            onClick={onGetStarted}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Get Started
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-transparent to-transparent dark:from-emerald-950/20" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-orange-400/15 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left"
            >
              <Badge
                variant="secondary"
                className="mb-5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by DeepSeek AI
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Your AI-powered
                <span className="block bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  personal fitness coach
                </span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Get a custom workout and nutrition plan built for your body, your
                goals, and your schedule — generated in seconds by advanced AI.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={onGetStarted}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-7 text-base"
                >
                  Build My Plan Free
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <a href="#how">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-7 text-base w-full sm:w-auto"
                  >
                    See How It Works
                  </Button>
                </a>
              </div>
              <div className="mt-8 flex items-center gap-5 justify-center lg:justify-start text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-500" />
                  No credit card
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-500" />
                  60-second setup
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Cancel anytime
                </div>
              </div>
            </motion.div>

            {/* Hero visual - app preview card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative"
            >
              <div className="relative mx-auto max-w-sm">
                {/* Phone frame mockup */}
                <div className="relative rounded-[2rem] border-8 border-foreground/90 bg-foreground/90 shadow-2xl shadow-emerald-500/20 overflow-hidden">
                  <div className="rounded-[1.4rem] overflow-hidden bg-background">
                    {/* Mock app header */}
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-emerald-50/80">Welcome back,</p>
                          <p className="font-bold text-lg">Alex 👋</p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                          <Dumbbell className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="rounded-xl bg-white/15 backdrop-blur p-3">
                        <p className="text-xs text-emerald-50/80 mb-1">Today&apos;s Focus</p>
                        <p className="font-semibold">Upper Body Strength</p>
                        <div className="mt-2 h-1.5 rounded-full bg-white/20 overflow-hidden">
                          <div className="h-full w-3/4 bg-white rounded-full" />
                        </div>
                      </div>
                    </div>
                    {/* Mock content */}
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Workouts', value: '12' },
                          { label: 'Calories', value: '4.2k' },
                          { label: 'Streak', value: '7d' },
                        ].map((s) => (
                          <div key={s.label} className="rounded-lg bg-muted/60 p-2.5 text-center">
                            <div className="text-base font-bold">{s.value}</div>
                            <div className="text-[9px] text-muted-foreground">{s.label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-xl border border-border/60 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Salad className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-semibold">Nutrition</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Protein</span>
                            <span className="font-medium">165g</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full w-4/5 bg-emerald-500 rounded-full" />
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl bg-emerald-500/10 p-3 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">FlexAI:</span> Great
                          work this week! Ready for leg day?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="absolute -bottom-4 -left-4 sm:-left-8 rounded-xl bg-white dark:bg-card shadow-xl border border-border/60 p-3 flex items-center gap-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
                    <Zap className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-none">AI Generated</p>
                    <p className="text-[10px] text-muted-foreground">in 10 seconds</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '50k+', label: 'Plans Generated' },
              { value: '4.9/5', label: 'User Rating' },
              { value: '92%', label: 'Goal Success' },
              { value: '24/7', label: 'AI Coach Access' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="secondary" className="mb-4">
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Everything you need to transform
            </h2>
            <p className="mt-4 text-muted-foreground">
              Three powerful AI-driven tools that adapt to your body and grow with
              your progress.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Dumbbell,
                title: 'AI Workout Plans',
                desc: 'Get a personalized training program with the exact exercises, sets, reps, and rest periods tailored to your goals and schedule.',
                color: 'emerald',
                points: ['Progressive overload', 'Goal-specific exercises', 'Flexible scheduling'],
              },
              {
                icon: Salad,
                title: 'Smart Nutrition',
                desc: 'Receive a daily meal plan with calorie and macro targets calculated for your body, plus foods to eat and avoid.',
                color: 'orange',
                points: ['Macro-calculated meals', 'Diet preference aware', 'Allergy-safe foods'],
              },
              {
                icon: MessageSquare,
                title: 'AI Coach Chat',
                desc: 'Ask your AI coach anything — form tips, motivation, plateaus, substitutions. It knows your plan and adapts its advice.',
                color: 'teal',
                points: ['Context-aware advice', '24/7 availability', 'Personalized to you'],
              },
            ].map((f, i) => {
              const Icon = f.icon
              const colorMap: Record<string, string> = {
                emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
                teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
              }
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="group relative h-full rounded-2xl border border-border/60 bg-card p-6 hover:border-emerald-400/50 hover:shadow-lg transition-all">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${colorMap[f.color]}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{f.desc}</p>
                    <ul className="space-y-1.5">
                      {f.points.map((p) => (
                        <li key={p} className="flex items-center gap-2 text-sm">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="text-muted-foreground">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 sm:py-28 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="secondary" className="mb-4">
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Three steps to your best self
            </h2>
            <p className="mt-4 text-muted-foreground">
              No spreadsheets, no guesswork. Just answer a few questions and let AI
              do the heavy lifting.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Target,
                title: 'Tell us about you',
                desc: 'Share your goals, age, body stats, and preferences in a quick 60-second form.',
              },
              {
                step: '02',
                icon: Sparkles,
                title: 'AI builds your plan',
                desc: 'DeepSeek AI generates a personalized workout and nutrition plan in seconds.',
              },
              {
                step: '03',
                icon: Heart,
                title: 'Train & track',
                desc: 'Follow your plan, chat with your AI coach, and adjust as you progress.',
              },
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative text-center"
                >
                  <div className="relative inline-flex mb-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background border-2 border-emerald-500 text-xs font-bold text-emerald-600">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    {s.desc}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="secondary" className="mb-4">
              Testimonials
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Loved by thousands
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  'The AI built me a plan that actually fits my schedule. Down 12 pounds in 8 weeks!',
                name: 'Sarah M.',
                role: 'Lost 12 lbs',
              },
              {
                quote:
                  'Having a coach I can text anytime is a game changer. The form tips are spot on.',
                name: 'James K.',
                role: 'Gained 8 lbs muscle',
              },
              {
                quote:
                  'Finally a nutrition plan I can stick to. The meals are realistic and tasty.',
                name: 'Priya R.',
                role: '3 months in',
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-border/60 bg-card p-6"
              >
                <div className="flex gap-0.5 mb-4">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 font-semibold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 p-8 sm:p-12 text-center text-white shadow-2xl shadow-emerald-500/20">
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-orange-400/20 blur-2xl" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Ready to forge your best self?
              </h2>
              <p className="text-emerald-50/90 text-lg max-w-xl mx-auto mb-8">
                Get your personalized AI fitness plan in under a minute. It&apos;s
                free to start.
              </p>
              <Button
                size="lg"
                onClick={onGetStarted}
                className="bg-white text-emerald-700 hover:bg-emerald-50 h-12 px-8 text-base font-semibold"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-emerald-50/70 text-xs mt-4">
                No credit card required · Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                  <Activity className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-extrabold">
                  Fit<span className="text-emerald-500">Forge</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered fitness coaching that adapts to you. Built with DeepSeek
                AI and Next.js.
              </p>
            </div>
            <div className="flex gap-12 text-sm">
              <div>
                <p className="font-semibold mb-3">Product</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li><a href="#features" className="hover:text-foreground">Features</a></li>
                  <li><a href="#how" className="hover:text-foreground">How it Works</a></li>
                  <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-3">Company</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground">About</a></li>
                  <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                  <li><a href="#" className="hover:text-foreground">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/40 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} FitForge. All rights reserved. Always
            consult a healthcare professional before starting any fitness program.
          </div>
        </div>
      </footer>
    </div>
  )
}
