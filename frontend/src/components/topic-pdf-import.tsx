// this component is used to input the topics and concepts from a PDF file

"use client"

import { Label } from "@/components/ui/label"
import { Info } from "lucide-react"
import { useRef } from "react"

interface TopicTextareaProps {
  value: File | null
  onChange: (value: File | null) => void
}

export default function TopicPdfImport({ value, onChange }: TopicTextareaProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    onChange(file);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <Label htmlFor="topics-pdf" className="text-base">
          Import topics and concepts from PDF
        </Label>
        <div className="flex items-center text-xs text-muted-foreground">
          <Info className="h-3 w-3 mr-1" />
          <span>Upload a PDF to extract topics</span>
        </div>
      </div>

      <input
        ref={inputRef}
        id="topics-pdf"
        type="file"
        accept="application/pdf"
        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
        onChange={handleFileChange}
      />

      {value && (
        <div className="mt-2 p-2 border rounded bg-muted text-xs max-h-48 overflow-auto whitespace-pre-wrap">
          {value.name}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Upload a PDF file. The text will be extracted and used as your topics and concepts.
      </p>
    </div>
  )
}
