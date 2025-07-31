"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StudyPlanAdjusterProps {
  intensity: string;
  learningStyle: string;
  onIntensityChange: (value: string) => void;
  onLearningStyleChange: (value: string) => void;
}

export default function StudyPlanAdjuster({
  intensity,
  learningStyle,
  onIntensityChange,
  onLearningStyleChange
}: StudyPlanAdjusterProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Study Intensity</Label>
        <RadioGroup value={intensity} onValueChange={onIntensityChange} className="flex space-x-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="light" id="light" className="border-purple-300 text-purple-600" />
            <Label htmlFor="light">Light</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="balanced" id="balanced" className="border-purple-300 text-purple-600" />
            <Label htmlFor="balanced">Balanced</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="intensive" id="intensive" className="border-purple-300 text-purple-600" />
            <Label htmlFor="intensive">Intensive</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Learning Style Priority</Label>
        <Select value={learningStyle} onValueChange={onLearningStyleChange}>
          <SelectTrigger className="border-purple-200 focus:ring-purple-500">
            <SelectValue placeholder="Select learning style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="visual">Visual</SelectItem>
            <SelectItem value="auditory">Auditory</SelectItem>
            <SelectItem value="reading">Reading/Writing</SelectItem>
            <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
