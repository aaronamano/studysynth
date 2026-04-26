// this component adjusts the study plan based on user preferred intensity and learning style

"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { StudyPlanAdjusterProps } from "@/lib/types"
import { useState } from "react"

export default function StudyPlanAdjuster(props?: StudyPlanAdjusterProps) {
  const [studyPlan, setStudyPlanState] = useState<StudyPlanAdjusterProps["studyPlan"]>(
    props?.studyPlan ?? { intensity: "balanced", learningStyle: "visual" }
  )

  const setStudyPlan = (plan: StudyPlanAdjusterProps["studyPlan"]) => {
    setStudyPlanState(plan)
    props?.setStudyPlan?.(plan)
  }

  const handleIntensityChange = (value: string) => {
    setStudyPlan({ ...studyPlan, intensity: value });
  };

  // Handler for learning style change
  const handleLearningStyleChange = (value: string) => {
    setStudyPlan({ ...studyPlan, learningStyle: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-amber-200/80">Study Intensity</Label>
        <RadioGroup value={studyPlan.intensity} onValueChange={handleIntensityChange} className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light" className="text-amber-300/70">Light</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="balanced" id="balanced" />
            <Label htmlFor="balanced" className="text-amber-300/70">Balanced</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="intensive" id="intensive" />
            <Label htmlFor="intensive" className="text-amber-300/70">Intensive</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label className="text-amber-200/80">Learning Style Priority</Label>
        <Select value={studyPlan.learningStyle} onValueChange={handleLearningStyleChange}>
          <SelectTrigger>
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
