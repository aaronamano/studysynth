"use client"

import { useState } from "react"
import { FileText, WalletCards, ListChecks, PenTool } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import StudyGuideGenerator from "@/components/study-guide-generator"
import PracticeProblemsDisplay from "@/components/practice-problems-display"
import MockExamDisplay from "@/components/mock-exam-display"
import { BookOpen } from "lucide-react"


export default function Home() {
  const [activeTab, setActiveTab] = useState("create-study-guide")

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-8 text-center py-8">
            <div className="flex justify-center items-center mb-4">
                <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-transparent bg-clip-text">
                    <h1 className="text-5xl font-bold tracking-tight leading-tight">
                        StudySynth
                    </h1>
                </div>
                <BookOpen className="h-12 w-12 text-purple-600 ml-3" />
            </div>
          <p className="text-lg text-purple-700">Generate personalized study guides tailored to your learning style</p>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-purple-100">
              {/* Create Study Guide tab */}
              <TabsTrigger value="create-study-guide" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <FileText className="mr-2 h-4 w-4" />
                Study Guide
              </TabsTrigger>
              {/* Flashcard tab */}
              <TabsTrigger value="flashcard" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <WalletCards className="mr-2 h-4 w-4" />
                Flashcard Lab
              </TabsTrigger>
              {/* Practice problems tab */}
              <TabsTrigger value="practice" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <ListChecks className="mr-2 h-4 w-4" />
                Practice Problems
              </TabsTrigger>
              {/* Mock exams tab */}
              <TabsTrigger value="exam" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
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
                    <p className="text-lg">Flashcard Lab is under construction!</p>
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
