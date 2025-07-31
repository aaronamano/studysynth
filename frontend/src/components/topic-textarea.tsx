"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Info } from "lucide-react"

interface TopicTextareaProps {
  value: string
  onChange: (value: string) => void
}

export default function TopicTextarea({ value, onChange }: TopicTextareaProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <Label htmlFor="topics" className="text-base">
          Enter your topics and concepts
        </Label>
        <div className="flex items-center text-xs text-muted-foreground">
          <Info className="h-3 w-3 mr-1" />
          <span>Separate topics with line breaks or commas</span>
        </div>
      </div>

      <Textarea
        id="topics"
        placeholder="Example:
Photosynthesis
Cell division
Cellular respiration
DNA structure and replication"
        className="min-h-[180px] border-purple-200 focus-visible:ring-purple-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <p className="text-xs text-muted-foreground">
        Add as many topics as you need. The more specific you are, the more tailored your study guide will be.
      </p>
    </div>
  )
}
