"use client"

import { useState, useEffect } from "react"

interface FileWithContent extends File {
  extractedContent?: string;
}
import { LoginButton } from "@/components/login-button"
import { useGoogleAuth } from "@/hooks/use-google-auth"
import TopicInputSelector from "@/components/features/topic-input-selector"
import TopicInput from "@/components/features/topic-input"
import { CalendarView } from "@/components/calendar-view"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, BookOpen, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import ProgressWindow from "@/components/features/progress-window"

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
  const [studyStartDate, setStudyStartDate] = useState("")
  const [studyEndDate, setStudyEndDate] = useState("")
  const [strengths, setStrengths] = useState([""])
  const [weaknesses, setWeaknesses] = useState([""])
  const [isGenerating, setIsGenerating] = useState(false)
  const [studyGuideContent, setStudyGuideContent] = useState<string | null>(null)
  const [topicValue, setTopicValue] = useState<File | string | null>(null)
  const [progressData, setProgressData] = useState<Array<{ type: string; content: string; step?: number }>>([])
  const [showProgress, setShowProgress] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleGenerate = async () => {
    if (!studyStartDate || !studyEndDate) {
      window.alert('Please select both start and end dates')
      return
    }

    setIsGenerating(true)
    setProgressData([])
    setShowProgress(true)
    setIsComplete(false)

    try {
      let fileContent = undefined
      if (topicValue instanceof File) {
        fileContent = (topicValue as FileWithContent).extractedContent
      }

      const topicText = typeof topicValue === 'string' ? topicValue : ''
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Create a study guide for: ${topicText}`,
          studyData: {
            fileContent,
            strengths: strengths.filter(s => s.trim()),
            weaknesses: weaknesses.filter(w => w.trim()),
            dateRange: {
              startDate: studyStartDate,
              endDate: studyEndDate
            }
          },
          stream: true
        })
      })

      if (!response.ok) throw new Error('Failed to generate study plan')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'complete') {
              setIsComplete(true)
              setIsGenerating(false)
            } else if (data.type === 'error') {
              setProgressData(prev => [...prev, { type: 'error', content: data.content }])
              setIsGenerating(false)
            } else {
              setProgressData(prev => [...prev, data])
              if (data.type === 'study_guide' && data.content) {
                setStudyGuideContent(data.content)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to generate study plan:', error)
      setProgressData(prev => [...prev, { type: 'error', content: error instanceof Error ? error.message : 'Unknown error' }])
      setIsGenerating(false)
    }
  }

  const handleCloseProgress = () => {
    setShowProgress(false)
    if (isComplete) {
      setIsGenerating(false)
    }
  }

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

        <div className={`px-8 pb-16 md:px-16 transition-all duration-300 ${showProgress ? 'mr-96' : ''}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/2 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-px h-4 bg-amber-400/50" />
                <span className="text-xs tracking-[0.15em] text-white/40 uppercase">Input</span>
              </div>

              <div className="space-y-6">
                <TopicInputSelector onValueChange={setTopicValue} />

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

                <div className="space-y-3">
                  <label className="text-xs tracking-wide text-white/50">Study Period (Until Exam)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-white/30">Start Date</label>
                      <Input
                        type="date"
                        value={studyStartDate}
                        onChange={(e) => setStudyStartDate(e.target.value)}
                        className="bg-white/2 border-white/10 text-white/80 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/30">End Date (Exam Day)</label>
                      <Input
                        type="date"
                        value={studyEndDate}
                        onChange={(e) => setStudyEndDate(e.target.value)}
                        className="bg-white/2 border-white/10 text-white/80 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Study Plan'
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-white/2 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-px h-4 bg-amber-400/50" />
                <span className="text-xs tracking-[0.15em] text-white/40 uppercase">Schedule</span>
              </div>
              <CalendarView />
            </div>
          </div>

          {studyGuideContent && (
            <div className="mt-6 bg-white/2 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-px h-4 bg-amber-400/50" />
                <span className="text-xs tracking-[0.15em] text-white/40 uppercase">Study Guide</span>
              </div>
              <div className="text-white/80 text-sm whitespace-pre-wrap">{studyGuideContent}</div>
            </div>
          )}
        </div>
      </div>

      <ProgressWindow
        isOpen={showProgress}
        progressData={progressData}
        onClose={handleCloseProgress}
        isComplete={isComplete}
      />
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