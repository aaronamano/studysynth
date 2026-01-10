"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { safeLocalStorage } from "@/lib/storage"

export default function AccountPage() {
  const [perplexityApiKey, setPerplexityApiKey] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const token = safeLocalStorage.getItem("token")
    if (token) {
      fetch("/api/account/keys", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.perplexityKey) {
            setPerplexityApiKey(data.perplexityKey)
          }
        })
    }
  }, [])

  useEffect(() => {
    setIsSaved(false)
  }, [perplexityApiKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = safeLocalStorage.getItem("token")
    if (!token) {
      return
    }

    try {
      const res = await fetch("/api/account/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ perplexityApiKey }),
      })

      if (res.ok) {
        toast.success("API keys updated successfully!")
        setIsSaved(true)
      } else {
        await res.json()
      }
    } catch {
      //
    }
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-purple-900/10 to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-800/10 rounded-full blur-3xl"></div>
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-purple-900/10 to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-800/10 rounded-full blur-3xl"></div>
      <Link href="/" className="absolute top-4 left-4 z-20 flex items-center text-purple-300 hover:text-purple-200">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
      </Link>
      <div className="flex items-center justify-center min-h-screen relative z-10">
        <Card className="w-full max-w-2xl bg-black/60 backdrop-blur-md border-purple-500/20 shadow-lg shadow-purple-500/5">
        <CardHeader>
          <CardTitle className="text-purple-100">API Keys</CardTitle>
          <CardDescription className="text-purple-300">
            Add your Perplexity API key to personalize your experience.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="perplexity-api-key" className="text-purple-200">Perplexity API Key</Label>
              <Input
                id="perplexity-api-key"
                type="password"
                value={perplexityApiKey}
                onChange={(e) => setPerplexityApiKey(e.target.value)}
                className="bg-purple-950/50 border-purple-500/30 text-purple-100 placeholder:text-purple-400"
              />
            </div>

            {isSaved && <p className="text-green-400 text-sm">API key saved.</p>}
          </CardContent>
          
          <CardFooter>
            <Button type="submit" className="mt-4">Save</Button>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  )
}
