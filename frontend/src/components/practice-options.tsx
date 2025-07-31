"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileQuestion, FileCheck } from "lucide-react"

interface PracticeOptionsProps {
  includePracticeProblems: boolean;
  includeMockExams: boolean;
  difficulty: string;
  quantity: number;
  onPracticeProblemsChange: (checked: boolean) => void;
  onMockExamsChange: (checked: boolean) => void;
  onDifficultyChange: (value: string) => void;
  onQuantityChange: (value: number) => void;
}

export default function PracticeOptions({
  includePracticeProblems,
  includeMockExams,
  difficulty,
  quantity,
  onPracticeProblemsChange,
  onMockExamsChange,
  onDifficultyChange,
  onQuantityChange,
}: PracticeOptionsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start space-x-3 space-y-0">
          <Checkbox
            id="practice-problems"
            className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            checked={includePracticeProblems}
            onCheckedChange={onPracticeProblemsChange}
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="practice-problems" className="flex items-center">
              <FileQuestion className="mr-2 h-4 w-4" />
              Practice Problems
            </Label>
            <p className="text-sm text-muted-foreground">Include practice problems with solutions</p>
          </div>
        </div>

        <div className="flex items-start space-x-3 space-y-0">
          <Checkbox
            id="mock-exams"
            className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            checked={includeMockExams}
            onCheckedChange={onMockExamsChange}
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="mock-exams" className="flex items-center">
              <FileCheck className="mr-2 h-4 w-4" />
              Mock Exams
            </Label>
            <p className="text-sm text-muted-foreground">Include full-length practice exams</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Problem Difficulty</Label>
        <Select value={difficulty} onValueChange={onDifficultyChange}>
          <SelectTrigger className="border-purple-200 focus:ring-purple-500">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
            <SelectItem value="mixed">Mixed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="problem-quantity">Problem Quantity</Label>
        </div>
        <input
          id="problem-quantity"
          type="number"
          min={1}
          max={100}
          value={quantity}
          onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
          className="w-full border border-purple-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
    </div>
  )
}
