"use client"

import { BookOpen, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
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

        <div className="max-w-4xl mx-auto bg-black/60 backdrop-blur-md border border-purple-500/20 p-8 rounded-xl shadow-lg shadow-purple-500/5">
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
            <Link href="/" passHref>
              <Button className="inline-flex items-center px-6 py-3 border border-purple-500/30 text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/20">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
