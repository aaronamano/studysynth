// this component is used to select media preferences for study materials

"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Video, BookText, FileText, ImageIcon } from "lucide-react"

interface MediaPreferencesProps {
  preferences: {
    videos: boolean;
    diagrams: boolean;
    readings: boolean;
    summaries: boolean;
  };
  setPreferences: (prefs: MediaPreferencesProps["preferences"]) => void;
}

export default function MediaPreferences({ preferences, setPreferences }: MediaPreferencesProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start space-x-3 space-y-0">
          <Checkbox
            id="videos"
            checked={preferences.videos}
            onCheckedChange={checked => setPreferences({ ...preferences, videos: !!checked })}
            className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="videos" className="flex items-center">
              <Video className="mr-2 h-4 w-4" />
              Videos
            </Label>
            <p className="text-sm text-muted-foreground">Include video explanations and tutorials</p>
          </div>
        </div>

        <div className="flex items-start space-x-3 space-y-0">
          <Checkbox
            id="diagrams"
            checked={preferences.diagrams}
            onCheckedChange={checked => setPreferences({ ...preferences, diagrams: !!checked })}
            className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="diagrams" className="flex items-center">
              <ImageIcon className="mr-2 h-4 w-4" />
              Diagrams & Visuals
            </Label>
            <p className="text-sm text-muted-foreground">Include diagrams and visual aids</p>
          </div>
        </div>

        <div className="flex items-start space-x-3 space-y-0">
          <Checkbox
            id="readings"
            checked={preferences.readings}
            onCheckedChange={checked => setPreferences({ ...preferences, readings: !!checked })}
            className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="readings" className="flex items-center">
              <BookText className="mr-2 h-4 w-4" />
              Reading Materials
            </Label>
            <p className="text-sm text-muted-foreground">Include recommended readings</p>
          </div>
        </div>

        <div className="flex items-start space-x-3 space-y-0">
          <Checkbox
            id="summaries"
            checked={preferences.summaries}
            onCheckedChange={checked => setPreferences({ ...preferences, summaries: !!checked })}
            className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="summaries" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Summaries
            </Label>
            <p className="text-sm text-muted-foreground">Include concept summaries</p>
          </div>
        </div>
      </div>

    </div>
  )
}
