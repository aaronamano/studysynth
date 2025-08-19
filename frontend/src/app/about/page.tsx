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
          <p className="text-lg text-purple-700">Your personalized AI-powered study partner.</p>
        </header>

        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-3xl font-semibold text-purple-800 mb-4">What is StudySynth?</h2>
          <p className="text-gray-700 mb-6">
            StudySynth is a revolutionary application designed to enhance your learning experience. We leverage the power of artificial intelligence to generate personalized study guides with accessible materials tailored to your unique needs and learning style. Whether you're preparing for an exam, trying to master a new subject, or simply looking to reinforce your knowledge, StudySynth is here to help.
          </p>

          <h2 className="text-3xl font-semibold text-purple-800 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-6">
            Our mission is to make learning more effective, efficient, and engaging for everyone. We believe that education should be accessible and adaptable. By providing tools that create customized study guides, practice problems, and mock exams, we empower learners to take control of their education and achieve their academic goals.
          </p>

          <h2 className="text-3xl font-semibold text-purple-800 mb-4">Key Features</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li><span className="font-semibold">Personalized Study Guides:</span> Generate comprehensive study guides from your course materials, notes, or PDFs.</li>
            <li><span className="font-semibold">Practice Problems:</span> Hone your skills with a wide range of practice questions, from easy to hard.</li>
            <li><span className="font-semibold">Mock Exams:</span> Simulate exam conditions and test your knowledge with custom-generated mock exams.</li>
            <li><span className="font-semibold">Adaptive Learning:</span> Tell us your strengths and weaknesses, and we'll focus on the areas where you need the most help.</li>
            <li><span className="font-semibold">Flexible Media Options:</span> Choose to include videos, diagrams, and reading materials in your study guides.</li>
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
