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
  const [openaiApiKey, setOpenaiApiKey] = useState("")
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
          if (data.openaiKey) {
            setOpenaiApiKey(data.openaiKey)
          }
        })
    }
  }, [])

  useEffect(() => {
    setIsSaved(false)
  }, [perplexityApiKey, openaiApiKey])

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
        body: JSON.stringify({ perplexityApiKey, openaiApiKey }),
      })

      if (res.ok) {
        toast.success("API keys updated successfully!")
        setIsSaved(true)
      } else {
        const data = await res.json()
      }
    } catch (error) {
    }
  }

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Link href="/" className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
      </Link>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Add your Perplexity and OpenAI API keys to personalize your experience.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="perplexity-api-key">Perplexity API Key</Label>
              <Input
                id="perplexity-api-key"
                type="password"
                value={perplexityApiKey}
                onChange={(e) => setPerplexityApiKey(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="openai-api-key">OpenAI API Key</Label>
              <Input
                id="openai-api-key"
                type="password"
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
              />
            </div>
            {isSaved && <p className="text-green-600 text-sm">API key saved.</p>}
          </CardContent>
          
          <CardFooter>
            <Button type="submit" className="mt-4">Save</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
