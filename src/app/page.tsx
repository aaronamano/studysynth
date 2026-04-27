"use client"

import { useState, useEffect } from "react"
import { LoginButton } from "@/components/login-button"
import { useGoogleAuth } from "@/hooks/use-google-auth"
import TopicInputSelector from "@/components/features/topic-input-selector"
import TopicInput from "@/components/features/topic-input"
import MediaPreferences from "@/components/features/media-preferences"
import StudyPlanAdjuster from "@/components/features/study-plan-adjuster"
import { CalendarView } from "@/components/calendar-view"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, BookOpen, Calendar } from "lucide-react"

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 100)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div 
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {children}
    </div>
  )
}

function AuthScreen() {
  return (
    <main className="min-h-screen bg-[#0a0908] relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-150 h-150 bg-[#1a1815] rounded-full blur-[180px] opacity-60" />
        <div className="absolute bottom-[-30%] right-[-10%] w-200 h-200 bg-[#15120f] rounded-full blur-[200px] opacity-50" />
        <div className="absolute top-[20%] right-[10%] w-75 h-75 bg-amber-900/5 rounded-full blur-[100px]" />
      </div>
      
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSDpc3RhbmRhcmRzaXplIiBoZWlnaHQ9Ijc1Ij48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMTExMTEiIGZpbGwtb3BhY2l0eT0iMC4wNCIvPjwvc3ZnPg==')] opacity-30" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="px-8 py-8 md:px-16 md:py-12">
          <AnimatedSection delay={0}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-100 to-amber-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#0a0908]" />
                </div>
                <span className="text-xl font-light tracking-tight text-white/90" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                  StudySynth
                </span>
              </div>
              <div className="text-xs tracking-[0.2em] text-white/30 uppercase">Late Night Studio</div>
            </div>
          </AnimatedSection>
        </header>

        <main className="flex-1 flex items-center justify-center px-8 md:px-16">
          <div className="max-w-2xl w-full">
            <AnimatedSection delay={1}>
              <div className="mb-6">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[1.1] text-white mb-8" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                  <span className="bg-linear-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
                    Agentic
                  </span>
                  <br />
                  <span className="text-white/60 font-extralight">
                    Study Planning
                  </span>
                </h1>
                <p className="text-lg text-white/40 max-w-xl leading-relaxed font-light">
                  Making personalized study plans organized and efficient.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={2}>
              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <LoginButton size="lg" className="h-14 px-8 text-base" />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={3}>
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                {[
                  { icon: BookOpen, label: "Smart Guides", value: "AI-powered" },
                  { icon: Calendar, label: "Calendar Sync", value: "Google" },
                ].map((item, i) => (
                  <div key={i} className="text-center group">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <item.icon className="w-4 h-4 text-amber-400/60" />
                    </div>
                    <div className="text-xs tracking-wider text-white/30 uppercase mb-1">{item.label}</div>
                    <div className="text-sm text-white/60">{item.value}</div>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </main>
      </div>
    </main>
  )
}

function Dashboard() {
  const [constraints, setConstraints] = useState("")
  const [strengths, setStrengths] = useState([""])
  const [weaknesses, setWeaknesses] = useState([""])

  return (
    <main className="min-h-screen bg-[#0a0908] relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-150 h-150 bg-[#1a1815] rounded-full blur-[180px] opacity-40" />
        <div className="absolute bottom-[-30%] right-[-10%] w-200 h-200 bg-[#15120f] rounded-full blur-[200px] opacity-30" />
      </div>

      <div className="relative z-10">
        <header className="px-8 py-8 md:px-16 md:py-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-100 to-amber-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#0a0908]" />
              </div>
              <span className="text-xl font-light tracking-tight text-white/90" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                StudySynth
              </span>
            </div>
            <LoginButton showUserInfo={true} />
          </div>
        </header>

        <div className="px-8 pb-16 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/2 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-px h-4 bg-amber-400/50" />
                <span className="text-xs tracking-[0.15em] text-white/40 uppercase">Input</span>
              </div>
              
              <div className="space-y-6">
                <TopicInputSelector />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TopicInput 
                    label="Strengths" 
                    items={strengths} 
                    setItems={setStrengths} 
                    placeholder="Areas you're confident in..." 
                  />
                  
                  <TopicInput 
                    label="Weaknesses" 
                    items={weaknesses} 
                    setItems={setWeaknesses} 
                    placeholder="Areas that need improvement..." 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs tracking-wide text-white/50">Additional constraints</label>
                  <Textarea
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder="e.g., Focus on basic concepts..."
                    className="min-h-25 bg-white/2 border-white/10 text-white/80 placeholder:text-white/20 text-sm"
                  />
                </div>
              </div>
              
              <MediaPreferences />
              <StudyPlanAdjuster />
            </div>

            <div className="bg-white/2 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-px h-4 bg-amber-400/50" />
                <span className="text-xs tracking-[0.15em] text-white/40 uppercase">Schedule</span>
              </div>
              <CalendarView />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function Home() {
  const { isAuthenticated, isLoading } = useGoogleAuth()

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0a0908] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-amber-400/60 animate-spin mx-auto mb-4" />
          <p className="text-xs tracking-[0.2em] text-white/30 uppercase">Loading</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <AuthScreen />
  }

  return <Dashboard />
}