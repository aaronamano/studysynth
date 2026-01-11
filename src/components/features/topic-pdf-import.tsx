// this component is used to input the topics and concepts from a PDF file

"use client"

import { Label } from "@/components/ui/label"
import { Info } from "lucide-react"
import { useRef } from "react"
import type { TopicTextareaProps } from "@/lib/types"

export default function TopicPdfImport({ value, onChange }: TopicTextareaProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    onChange(file);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <Label htmlFor="topics-pdf" className="text-base text-purple-200">
          Import topics and concepts from PDF
        </Label>
        <div className="flex items-center text-xs text-muted-foreground">
          <Info className="h-3 w-3 mr-1" />
          <span className="text-purple-500">Upload a PDF to extract topics</span>
        </div>
      </div>

      <input
        ref={inputRef}
        id="topics-pdf"
        type="file"
        accept="application/pdf"
        className="block w-full text-sm text-purple-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:text-sm file:font-semibold file:bg-black/60 file:border file:border-purple-500/30 file:text-purple-300 hover:file:bg-purple-900/40 file:shadow-md file:shadow-purple-600/10"
        onChange={handleFileChange}
      />

      {value && (
        <div className="mt-2 p-2 border border-purple-500/30 rounded-xl bg-black/40 text-purple-300 text-xs max-h-48 overflow-auto whitespace-pre-wrap">
          {value.name}
        </div>
      )}

      <p className="text-xs text-purple-500">
        Please upload a PDF file, preferably 5 pages max.
      </p>
    </div>
  )
}
