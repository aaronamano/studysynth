"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { safeLocalStorage } from "@/lib/storage"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        const data = await res.json();
        safeLocalStorage.setItem("token", data.token);
        safeLocalStorage.setItem("userId", data.userId);
        router.push("/");
      } else {
        const data = await res.json()
        setError(data.message || "Something went wrong")
      }
    } catch (error) {
      setError("Something went wrong")
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-purple-900/10 to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-800/10 rounded-full blur-3xl"></div>
      <div className="flex items-center justify-center min-h-screen relative z-10">
        <Card className="w-full max-w-sm bg-black/60 backdrop-blur-md border-purple-500/20 shadow-lg shadow-purple-500/5">
          <CardHeader className="space-y-1">
            <div className="flex flex-col items-start space-y-2">
              <Link href="/" className="flex items-center text-purple-300 hover:text-purple-100">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Link>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-transparent bg-clip-text">Login</CardTitle>
            </div>
            <CardDescription>Enter your email below to login to your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white mt-4">Sign in</Button>
              <div className="mt-4 text-center text-sm">
                Don't have an account?{" "}
                <Link href="/signup" className="underline text-purple-400 hover:text-purple-300">
                  Sign up
                </Link>
              </div>
              <div className="mt-2 text-center text-sm">
                <Link href="/reset" className="underline text-purple-400 hover:text-purple-300">
                  Forgot your password?
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}