"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen } from "lucide-react"

export default function AboutPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page which will show appropriate content based on auth state
    router.push("/")
  }, [router])

  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-purple-900/10 to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-800/10 rounded-full blur-3xl"></div>
      <div className="flex items-center justify-center min-h-screen relative z-10">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    </main>
  )
}
