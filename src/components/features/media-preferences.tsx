// this component is used to select media preferences for study materials

"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Video, BookText, FileText, ImageIcon } from "lucide-react"
import type { MediaPreferencesProps } from "@/lib/types"

export default function MediaPreferences({ preferences, setPreferences }: MediaPreferencesProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start space-x-3 space-y-0">
          <Checkbox
            id="videos"
            checked={preferences.videos}
            onCheckedChange={checked => setPreferences({ ...preferences, videos: !!checked })}
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="videos" className="flex items-center text-amber-200/80">
              <Video className="mr-2 h-4 w-4" />
              Videos
            </Label>
            <p className="text-sm text-amber-400/60">Include video explanations and tutorials</p>
          </div>
        </div>

        <div className="flex items-start space-x-3 space-y-0">
          <Checkbox
            id="diagrams"
            checked={preferences.diagrams}
            onCheckedChange={checked => setPreferences({ ...preferences, diagrams: !!checked })}
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="diagrams" className="flex items-center text-amber-200/80">
              <ImageIcon className="mr-2 h-4 w-4" />
              Diagrams & Visuals
            </Label>
            <p className="text-sm text-amber-400/60">Include diagrams and visual aids</p>
          </div>
        </div>

        <div className="flex items-start space-x-3 space-y-0">
          <Checkbox
            id="readings"
            checked={preferences.readings}
            onCheckedChange={checked => setPreferences({ ...preferences, readings: !!checked })}
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="readings" className="flex items-center text-amber-200/80">
              <BookText className="mr-2 h-4 w-4" />
              Reading Materials
            </Label>
            <p className="text-sm text-amber-400/60">Include recommended readings</p>
          </div>
        </div>

        <div className="flex items-start space-x-3 space-y-0">
          <Checkbox
            id="summaries"
            checked={preferences.summaries}
            onCheckedChange={checked => setPreferences({ ...preferences, summaries: !!checked })}
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="summaries" className="flex items-center text-amber-200/80">
              <FileText className="mr-2 h-4 w-4" />
              Summaries
            </Label>
            <p className="text-sm text-amber-400/60">Include concept summaries</p>
          </div>
        </div>
      </div>

    </div>
  )
}
