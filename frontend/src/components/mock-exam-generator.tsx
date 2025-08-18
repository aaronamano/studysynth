// this component is used to handle practice options like practice problems, mock exams, etc.

"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import TopicPdfImport from "./features/topic-pdf-import"
import TopicInput from "./features/topic-input" // Input for strengths/weaknesses
import { Card, CardContent } from "@/components/ui/card"


interface MockExamProps {
  difficulty: string;
  quantity: number;
  onDifficultyChange: (value: string) => void;
  onQuantityChange: (value: number) => void;
  onGenerate?: (materials: string) => void; // callback for generated materials
}

export default function MockExamOptions({
  difficulty,
  quantity,
  onDifficultyChange,
  onQuantityChange,
  onGenerate,
}: MockExamProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null) // PDF file input
  const [constraints, setConstraints] = useState("") // Constraints input
  const [strengths, setStrengths] = useState([""]) // List of strengths
  const [weaknesses, setWeaknesses] = useState([""]) // List of weaknesses
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      if (pdfFile) formData.append("pdf_file", pdfFile)
      formData.append("constraints", constraints)
      formData.append("strengths", JSON.stringify(strengths.filter(s => s)))
      formData.append("weaknesses", JSON.stringify(weaknesses.filter(w => w)))
      formData.append("practiceOptions", JSON.stringify({
        difficulty,
        quantity,
      }))
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/mock-exam`, {
        method: "POST",
        body: formData,
      })
      if (!res.ok) throw new Error("Failed to generate mock exam")
      const data = await res.json()
      if (onGenerate) onGenerate(data.mockExam)
    } catch (e: any) {
      setError(e.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-6">
          {/* pdf input */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-purple-700">Topics & Concepts</h2>
            <TopicPdfImport value={pdfFile} onChange={setPdfFile} />
          </div>

          <Separator />

          {/* Constraints input */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-purple-700">Constraints & Requirements</h2>
            <Label htmlFor="constraints">Study Constraints</Label>
            <Textarea
              id="constraints"
              placeholder="Enter any constraints (e.g., time available, exam date, specific format requirements)"
              className="mt-2"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
            />
          </div>

          <Separator />

          {/* Strengths and weaknesses input */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-purple-700">Strengths & Weaknesses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <TopicInput
                  items={strengths}
                  setItems={setStrengths}
                  placeholder="Enter a strength"
                  label="Strengths"
                />
              </div>
              <div>
                <TopicInput
                  items={weaknesses}
                  setItems={setWeaknesses}
                  placeholder="Enter a weakness"
                  label="Weaknesses"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Problem Difficulty</Label>
            <Select value={difficulty} onValueChange={onDifficultyChange}>
              <SelectTrigger className="border-purple-200 focus:ring-purple-500">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="problem-quantity">Problem Quantity</Label>
            </div>
            <input
              id="problem-quantity"
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
              className="w-full border border-purple-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {/* Generate button */}
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            size="lg"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Mock Exam"}
          </Button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
