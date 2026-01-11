"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileText, User, Bookmark, CalendarIcon, BookOpen } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import StudyGuideGenerator from "@/components/study-guide-generator"
import { CalendarView } from "@/components/calendar-view"
import { safeLocalStorage } from "@/lib/storage"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("create-study-guide")
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
    const token = safeLocalStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      // Fetch user's first name from an API endpoint
      fetch("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.firstName) {
            setFirstName(data.firstName);
          }
        });
      
      // Check if we should redirect to calendar tab
      const redirectToCalendar = safeLocalStorage.getItem('redirect_to_calendar');
      if (redirectToCalendar === 'true') {
        setActiveTab('calendar');
        safeLocalStorage.removeItem('redirect_to_calendar');
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear authentication data
    safeLocalStorage.removeItem("token")
    
    // Clear cache data
    safeLocalStorage.removeItem("calendar_events_cache")
    safeLocalStorage.removeItem("google_calendar_status_cache")
    safeLocalStorage.removeItem("history_cache")
    safeLocalStorage.removeItem("studysynth_history_cache")
    
    // Clear user data
    safeLocalStorage.removeItem("userId")
    
    // Clear local state
    setIsLoggedIn(false)
    setFirstName("")
    
    // Redirect to home
    router.push("/")
  }

  // If not authenticated, show about page content
  if (!isMounted) {
    return (
      <main className="min-h-screen bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-purple-900/10 to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-800/10 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 py-6 relative z-10 flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      </main>
    )
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-purple-900/10 to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-800/10 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 py-6 relative z-10">
          <header className="mb-8 text-center py-8">
            <div className="flex justify-center items-center mb-4">
              <div className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 text-transparent bg-clip-text">
                <h1 className="text-5xl font-bold tracking-tight leading-tight">
                  StudySynth
                </h1>
              </div>
              <BookOpen className="h-12 w-12 text-purple-400 ml-3" />
            </div>
          </header>

          <div className="max-w-4xl mx-auto bg-black/60 border border-purple-500/20 p-8 rounded-2xl shadow-lg shadow-purple-500/10 backdrop-blur-md">
            <h2 className="text-3xl font-semibold text-purple-300 mb-4">What is StudySynth?</h2>
            <p className="text-purple-200 mb-6">
              StudySynth leverages Perplexity AI to generate customizable study guides and study plans tailored to your needs and preferences to make studying underwhelming and more organized.
            </p>

            <h2 className="text-3xl font-semibold text-purple-300 mb-4">Key Features</h2>
            <ul className="list-disc list-inside text-purple-200 space-y-2 mb-6">
              <li><span className="font-semibold text-purple-100">Calendar Event Study Plan:</span> Generate recommended study plans with online resources onto your calendar.</li>
              <li><span className="font-semibold text-purple-100">Study Guide History:</span> Save generated study guides to refer to if needed.</li>
              <li><span className="font-semibold text-purple-100">API Key Integration:</span> Insert your own Perplexity API key.</li>
              <li><span className="font-semibold text-purple-100">Google Calendar Integration:</span> Integrate and sync Google Calendar using your own Google account.</li>
            </ul>

            <div className="text-center mt-8">
              <Link href="/login" passHref>
                <Button className="inline-flex items-center px-6 py-3 border border-purple-500/30 text-base font-medium rounded-full text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/20">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Authenticated user dashboard
  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-purple-900/10 to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-800/10 rounded-full blur-3xl"></div>
      <div className="container mx-auto px-4 py-6 relative z-10">
        <header className="mb-8 py-8 relative">
          <div className="absolute top-8 right-0 flex items-center space-x-4">
            <p className="text-lg font-medium text-purple-400">Welcome {firstName}, glad to have you here. Now time to lock tf in!</p>
            <Link href="/history" passHref>
              <Button
                className="px-6 py-3 border border-purple-500/30 text-base font-medium rounded-full text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/20"
              >
                <Bookmark className="h-5 w-5" />
                <div className="text-sm">
                  Saved Guides
                </div>
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              className="px-6 py-3 border border-purple-500/30 text-base font-medium rounded-full text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/20"
            >
              Logout
            </Button>
            <Link href="/account" passHref>
              <Button
                size="icon"
                className="px-3 py-3 border border-purple-500/30 text-base font-medium rounded-full text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/20"
              >
                <User className="h-6 w-6" />
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/50 border border-purple-500/20 backdrop-blur-md shadow-lg shadow-purple-500/5">
              <TabsTrigger
                value="create-study-guide"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-800 data-[state=active]:text-white text-purple-500 hover:text-purple-300"
              >
                <FileText className="mr-2 h-4 w-4" />
                Study Guide
              </TabsTrigger>

              <TabsTrigger
                value="calendar"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-800 data-[state=active]:text-white text-purple-500 hover:text-purple-300"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Calendar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create-study-guide" className="mt-6">
              <StudyGuideGenerator />
            </TabsContent>

            <TabsContent value="calendar" className="mt-6">
              <CalendarView />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}