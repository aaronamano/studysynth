"use client"

import { useState } from "react"
import { FileText, Bookmark, CalendarIcon, BookOpen, Moon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import StudyGuideGenerator from "@/components/study-guide-generator"
import { CalendarView } from "@/components/calendar-view"
import Link from "next/link"

export default function Home() {
  const [activeTab, setActiveTab] = useState("create-study-guide")
  const [calendarKey, setCalendarKey] = useState(0)

  return (
    <main className="min-h-screen bg-[#0d0c0a] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,40,30,0.4)_0%,_transparent_70%)]"></div>
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-900/8 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-950/10 rounded-full blur-3xl"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDJiM2ZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-40 mix-blend-overlay"></div>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        <header className="mb-10 py-8 relative">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 text-transparent bg-clip-text">
              <h1 className="text-5xl font-bold tracking-tight leading-tight" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                StudySynth
              </h1>
            </div>
            <Moon className="h-10 w-10 text-amber-400/80 ml-3" />
          </div>
          <p className="text-center text-amber-200/50 text-sm font-light tracking-widest uppercase mb-2">Late Night Study Sessions</p>
          <div className="absolute top-8 right-0 flex items-center space-x-4">
            <Link href="/history" passHref>
              <Button
                variant="outline"
                size="lg"
                className="px-6 py-3 border border-amber-700/40 text-amber-100/80 hover:text-amber-100 hover:border-amber-600/60 hover:bg-amber-900/20"
              >
                <Bookmark className="h-4 w-4 mr-2" />
                <span className="text-sm">Saved Guides</span>
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            if (value === 'calendar') {
              setCalendarKey(prev => prev + 1);
            }
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#1a1815]/80 border border-amber-800/20 backdrop-blur-md">
              <TabsTrigger
                value="create-study-guide"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-700/80 data-[state=active]:to-orange-800/80 data-[state=active]:text-amber-100 text-amber-300/60 hover:text-amber-200/80"
              >
                <FileText className="mr-2 h-4 w-4" />
                Study Guide
              </TabsTrigger>

              <TabsTrigger
                value="calendar"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-700/80 data-[state=active]:to-orange-800/80 data-[state=active]:text-amber-100 text-amber-300/60 hover:text-amber-200/80"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Calendar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create-study-guide" className="mt-6">
              <StudyGuideGenerator />
            </TabsContent>

            <TabsContent value="calendar" className="mt-6">
              <CalendarView key={calendarKey} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}