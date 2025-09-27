"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileText, WalletCards, ListChecks, PenTool, User, History } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import StudyGuideGenerator from "@/components/study-guide-generator"
import PracticeProblemsDisplay from "@/components/practice-problems-display"
import MockExamDisplay from "@/components/mock-exam-display"

export default function Home() {
  const [activeTab, setActiveTab] = useState("create-study-guide")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [firstName, setFirstName] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token");
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
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    setFirstName("")
    router.push("/")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-8 py-8 relative">
          <div className="absolute top-8 right-0 flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <p className="text-lg font-medium text-purple-600">Welcome {firstName}, glad to have you here. Now time to lock tf in!</p>
                <Link href="/history" passHref>
                  <Button
                    className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <History className="h-5 w-5 mr-2" />
                    History
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  Logout
                </Button>
                <Link href="/account" passHref>
                  <Button
                    size="icon"
                    className="px-3 py-3 border border-transparent text-base font-medium rounded-4xl text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <User className="h-6 w-6" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/about" passHref>
                  <Button className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                    About StudySynth
                  </Button>
                </Link>
                <Link href="/login" passHref>
                  <Button
                    size="icon"
                    className="px-3 py-3 border border-transparent text-base font-medium rounded-4xl text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <User className="h-6 w-6" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-purple-100">
              {/* Create Study Guide tab */}
              <TabsTrigger
                value="create-study-guide"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <FileText className="mr-2 h-4 w-4" />
                Study Guide
              </TabsTrigger>

              {/* Flashcard tab */}
              {/*
              <TabsTrigger
                value="flashcard"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <WalletCards className="mr-2 h-4 w-4" />
                Flashcard Lab
              </TabsTrigger>
              */}
              
              {/* Practice problems tab */}
              <TabsTrigger
                value="practice"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <ListChecks className="mr-2 h-4 w-4" />
                Practice Problems
              </TabsTrigger>
              {/* Mock exams tab */}
              <TabsTrigger
                value="exam"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <PenTool className="mr-2 h-4 w-4" />
                Mock Exams
              </TabsTrigger>
            </TabsList>

            {/* Create Study Guide tab content */}
            <TabsContent value="create-study-guide" className="mt-6">
              <StudyGuideGenerator />
            </TabsContent>

            {/* Other tabs */}
            <TabsContent value="flashcard" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-gray-500">
                    <p className="text-lg">
                      Flashcard Lab is under construction!
                    </p>
                    <p className="mt-2">Stay tuned for updates.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="practice" className="mt-6">
              <PracticeProblemsDisplay />
            </TabsContent>

            <TabsContent value="exam" className="mt-6">
              <MockExamDisplay />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
