"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Video, BookText, FileText, ImageIcon, ListChecks } from "lucide-react"

export default function MediaPreferences() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start space-x-3 space-y-0">
          <Checkbox
            id="videos"
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
            id="flashcards"
            className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            defaultChecked
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="flashcards" className="flex items-center">
              <ListChecks className="mr-2 h-4 w-4" />
              Flashcards
            </Label>
            <p className="text-sm text-muted-foreground">Include flashcards for key concepts</p>
          </div>
        </div>

        <div className="flex items-start space-x-3 space-y-0">
          <Checkbox
            id="diagrams"
            className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            defaultChecked
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
            className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            defaultChecked
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
