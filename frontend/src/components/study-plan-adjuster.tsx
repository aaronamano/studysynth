// this component adjusts the study plan based on user preferred intensity and learning style

"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StudyPlanAdjusterProps {
  studyPlan: {
    intensity: string;
    learningStyle: string;
  };
  setStudyPlan: (plan: { intensity: string; learningStyle: string }) => void;
}

export default function StudyPlanAdjuster({
  studyPlan,
  setStudyPlan
}: StudyPlanAdjusterProps) {
  // Handler for intensity change
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
        <Label>Study Intensity</Label>
        <RadioGroup value={studyPlan.intensity} onValueChange={handleIntensityChange} className="flex space-x-2">
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
        <Select value={studyPlan.learningStyle} onValueChange={handleLearningStyleChange}>
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
