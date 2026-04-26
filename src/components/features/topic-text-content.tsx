// this component is used to input topics and concepts from text content

"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Info, FileText } from "lucide-react"

interface TopicTextContentProps {
  value: string
  onChange: (value: string) => void
}

export default function TopicTextContent({ value, onChange }: TopicTextContentProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <Label htmlFor="topics-text" className="text-base text-amber-200 font-serif">
          Enter topics and concepts
        </Label>
        <div className="flex items-center text-xs text-muted-foreground">
          <Info className="h-3 w-3 mr-1" />
          <span className="text-amber-400/60">Type or paste your content</span>
        </div>
      </div>

      <Textarea
        id="topics-text"
        placeholder="Enter your topics, concepts, study materials, or any content you want to create a study plan for..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-37.5 resize-none bg-[#1a1815]/60 border-amber-700/25 text-amber-200/80 placeholder:text-amber-400/50 focus:border-amber-500"
      />

      {value && (
        <div className="mt-2 p-2 border border-amber-800/20 rounded-xl bg-[#1a1815]/60 text-amber-200/80 text-xs max-h-32 overflow-auto">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-3 w-3 text-amber-400/60" />
            <span className="font-medium">Content Preview</span>
          </div>
          <div className="text-amber-200/80 whitespace-pre-wrap">
            {value.substring(0, 200)}
            {value.length > 200 && '...'}
          </div>
          <div className="mt-1 text-amber-400/60">
            {value.length} characters
          </div>
        </div>
      )}

      <p className="text-xs text-amber-400/50">
        Enter detailed descriptions of topics, concepts, or study materials for better personalized results.
      </p>
    </div>
  )
}