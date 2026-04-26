"use client"

import { Moon } from "lucide-react"
import TopicInputSelector from "@/components/features/topic-input-selector"
import TopicInput from "@/components/features/topic-input"
import MediaPreferences from "@/components/features/media-preferences"
import StudyPlanAdjuster from "@/components/features/study-plan-adjuster"
import { LoginButton } from "@/components/login-button"
import { CalendarView } from "@/components/calendar-view"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useGoogleAuth } from "@/hooks/use-google-auth"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [constraints, setConstraints] = useState("")
  const [strengths, setStrengths] = useState([""])
  const [weaknesses, setWeaknesses] = useState([""])
  const { user, isAuthenticated, isLoading } = useGoogleAuth()

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0d0c0a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0d0c0a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,40,30,0.4)_0%,_transparent_70%)]"></div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-900/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-950/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDJiM2ZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-40 mix-blend-overlay"></div>
        
        <div className="container mx-auto px-8 py-6 relative z-10">
          <header className="mb-8 py-6">
            <div className="flex justify-center items-center">
              <div className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 text-transparent bg-clip-text">
                <h1 className="text-5xl font-bold tracking-tight leading-tight" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                  StudySynth
                </h1>
              </div>
              <Moon className="h-10 w-10 text-amber-400/80 ml-3" />
            </div>
            <p className="text-center text-amber-200/50 text-sm font-light tracking-widest uppercase">Late Night Study Sessions</p>
          </header>

          <div className="flex flex-col items-center justify-center py-20 space-y-8">
            <div className="bg-black/40 border border-amber-800/20 rounded-2xl p-8 backdrop-blur-md text-center max-w-md">
              <h2 className="text-2xl font-medium text-amber-200 mb-4">Welcome to StudySynth</h2>
              <p className="text-amber-300/60 mb-6">Sign in with Google to create personalized study guides and sync them to your calendar.</p>
              <LoginButton size="lg" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0d0c0a] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,40,30,0.4)_0%,_transparent_70%)]"></div>
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-900/8 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-950/10 rounded-full blur-3xl"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDJiM2ZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-40 mix-blend-overlay"></div>
      
      <div className="container mx-auto px-8 py-6 relative z-10">
        <header className="mb-8 py-6">
          <div className="flex justify-center items-center relative">
            <div className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 text-transparent bg-clip-text">
              <h1 className="text-5xl font-bold tracking-tight leading-tight" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                StudySynth
              </h1>
            </div>
            <Moon className="h-10 w-10 text-amber-400/80 ml-3" />
            <div className="absolute right-0 top-0">
              <LoginButton showUserInfo={true} />
            </div>
          </div>
          <p className="text-center text-amber-200/50 text-sm font-light tracking-widest uppercase">Late Night Study Sessions</p>
        </header>

        <div className="w-full space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-black/40 border border-amber-800/20 rounded-2xl p-6 backdrop-blur-md space-y-6">
              <div>
                <h2 className="text-xl font-medium text-amber-200 mb-4">Study Input</h2>
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
                  <label className="text-sm text-amber-300">Additional constraints or instructions</label>
                  <Textarea
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder="e.g., Focus on basic concepts, need help with specific problems..."
                    className="min-h-[100px] bg-black/60 border-amber-800/30 text-amber-100 placeholder:text-amber-500/50"
                  />
                </div>
              </div>
              
              <MediaPreferences />
              <StudyPlanAdjuster />
            </div>

            <div className="bg-black/40 border border-amber-800/20 rounded-2xl p-6 backdrop-blur-md">
              <CalendarView />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}