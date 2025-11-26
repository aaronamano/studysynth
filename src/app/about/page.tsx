"use client"

import { BookOpen, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
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
        </header>

        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-3xl font-semibold text-purple-800 mb-4">What is StudySynth?</h2>
          <p className="text-gray-700 mb-6">
            StudySynth leverages Perplexity AI to generate customizable study guides and study plans tailored to your needs and preferences to make studying underwhelming and more organized.
          </p>

          <h2 className="text-3xl font-semibold text-purple-800 mb-4">Key Features</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li><span className="font-semibold">Calendar Event Study Plan:</span> Generate recommended study plans with online resources onto your calendar.</li>
            <li><span className="font-semibold">Study Guide History:</span> Save generated study guides to refer to if needed.</li>
            <li><span className="font-semibold">API Key Integration:</span> Insert your own Perplexity API key.</li>
          </ul>

          <div className="text-center mt-8">
            <Link href="/" passHref>
              <Button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
