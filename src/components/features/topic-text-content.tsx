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
        <Label htmlFor="topics-text" className="text-base text-purple-200">
          Enter topics and concepts
        </Label>
        <div className="flex items-center text-xs text-muted-foreground">
          <Info className="h-3 w-3 mr-1" />
          <span className="text-purple-500">Type or paste your content</span>
        </div>
      </div>

      <Textarea
        id="topics-text"
        placeholder="Enter your topics, concepts, study materials, or any content you want to create a study plan for..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-37.5 resize-none bg-black/40 border-purple-500/30 text-purple-300 placeholder:text-purple-500 focus:border-purple-500/50"
      />

      {value && (
        <div className="mt-2 p-2 border border-purple-500/30 rounded-xl bg-black/40 text-purple-300 text-xs max-h-32 overflow-auto">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-3 w-3 text-purple-400" />
            <span className="font-medium">Content Preview</span>
          </div>
          <div className="text-purple-300 whitespace-pre-wrap">
            {value.substring(0, 200)}
            {value.length > 200 && '...'}
          </div>
          <div className="mt-1 text-purple-400">
            {value.length} characters
          </div>
        </div>
      )}

      <p className="text-xs text-purple-500">
        Enter detailed descriptions of topics, concepts, or study materials for better personalized results.
      </p>
    </div>
  )
}