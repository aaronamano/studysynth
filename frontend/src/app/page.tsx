import StudyGuideGenerator from "@/components/study-guide-generator"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "StudySynth - Personalized Study Guide Generator",
  description: "Generate customized study guides tailored to your learning preferences and needs",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-8 text-center py-8">
            <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-transparent bg-clip-text">
              <h1 className="text-5xl font-bold tracking-tight mb-3 leading-tight align-baseline">StudySynth</h1>
            </div>
          <p className="text-lg text-purple-700">Generate personalized study guides tailored to your learning style</p>
        </header>

        <StudyGuideGenerator />
      </div>
    </main>
  )
}
