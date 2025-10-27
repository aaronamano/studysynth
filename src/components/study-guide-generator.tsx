"use client" // Enables React Server Components to use client-side features

import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, BookOpen, FileText, Calendar } from "lucide-react"
import MediaPreferences from "./media-preferences"
import StudyPlanAdjuster from "./study-plan-adjuster"
import PracticeOptions from "./practice-options"
import StudyGuideDisplay from "./study-guide-display"
import TopicInput from "./topic-input" // Input for strengths/weaknesses
import TopicTextarea from "./topic-textarea" // Input for topics/concepts
import { toast } from "sonner" // For showing error notifications
import StudyCalendar from "./study-calendar"

export default function StudyGuideGenerator() {
  // Add new state variable for practice materials
  const [practiceMaterials, setPracticeMaterials] = useState<string | null>(null);

  // Add new state variables
  const [intensity, setIntensity] = useState("balanced")
  const [learningStyle, setLearningStyle] = useState("visual")

  // Add new state variables for practice options
  const [practiceOptions, setPracticeOptions] = useState({
    includePracticeProblems: true,
    includeMockExams: false,
    difficulty: "mixed",
    quantity: 50,
  });

  // State variables for form fields and UI state
  const [isGenerating, setIsGenerating] = useState(false) // Loading state
  const [studyGuide, setStudyGuide] = useState<string | null>(null) // Generated guide
  const [topics, setTopics] = useState("") // Topics input
  const [constraints, setConstraints] = useState("") // Constraints input
  const [strengths, setStrengths] = useState([""]) // List of strengths
  const [weaknesses, setWeaknesses] = useState([""]) // List of weaknesses
  const [activeTab, setActiveTab] = useState("input") // Tabs: input/result

  // Handles the "Create Study Guide" button click
  const handleGenerateStudyGuide = async () => {
    setIsGenerating(true);

    try {
      // First, get practice materials if needed
      if (practiceOptions.includePracticeProblems || practiceOptions.includeMockExams) {
        const practiceMaterialsResponse = await fetch('/api/practice-materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topics,
            strengths: strengths.filter(s => s.trim()),
            weaknesses: weaknesses.filter(w => w.trim()),
            practiceOptions
          }),
        });

        if (!practiceMaterialsResponse.ok) {
          throw new Error('Failed to generate practice materials');
        }

        const practiceMaterialsData = await practiceMaterialsResponse.json();
        setPracticeMaterials(practiceMaterialsData.practiceMaterials);
      }

      // Then, get the study guide
      const studyGuideResponse = await fetch('/api/study-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics,
          constraints,
          strengths: strengths.filter(s => s.trim()),
          weaknesses: weaknesses.filter(w => w.trim()),
          mediaPreferences: {
            videos: (document.getElementById('videos') as HTMLInputElement | null)?.checked || false,
            flashcards: (document.getElementById('flashcards') as HTMLInputElement | null)?.checked || false,
            diagrams: (document.getElementById('diagrams') as HTMLInputElement | null)?.checked || false,
            readings: (document.getElementById('readings') as HTMLInputElement | null)?.checked || false,
            summaries: (document.getElementById('summaries') as HTMLInputElement | null)?.checked || false
          },
          studyPlan: { intensity, learningStyle }
        }),
      });

      if (!studyGuideResponse.ok) {
        throw new Error('Failed to generate study guide');
      }

      const studyGuideData = await studyGuideResponse.json();
      setStudyGuide(studyGuideData.studyGuide);
      setActiveTab('result');
    } catch {
      toast.error('Failed to generate study guide', {
        description: 'Please try again later',
      });
    } finally {
      setIsGenerating(false);
    }
  }

  // Main UI rendering
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Tab navigation for input/result */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-purple-100">
          {/* Input tab */}
          <TabsTrigger value="input" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <FileText className="mr-2 h-4 w-4" />
            Input Parameters
          </TabsTrigger>
          {/* Result tab */}
          <TabsTrigger value="result" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <BookOpen className="mr-2 h-4 w-4" />
            Study Guide
          </TabsTrigger>
          {/* Calendar tab */}
          <TabsTrigger value="calendar" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Calendar className="mr-2 h-4 w-4" />
            Study Calendar
          </TabsTrigger>
        </TabsList>

        {/* Input form content */}
        <TabsContent value="input" className="space-y-6 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Topics input */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-purple-700">Topics & Concepts</h2>
                  <TopicTextarea value={topics} onChange={setTopics} />
                </div>

                <Separator />

                {/* Constraints input */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-purple-700">Constraints & Requirements</h2>
                  <Label htmlFor="constraints">Study Constraints</Label>
                  <Textarea
                    id="constraints"
                    placeholder="Enter any constraints (e.g., time available, exam date, specific format requirements)"
                    className="mt-2"
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                  />
                </div>

                <Separator />

                {/* Media preferences checkboxes */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-purple-700">Media Preferences</h2>
                  <MediaPreferences />
                </div>

                <Separator />

                {/* Strengths and weaknesses input */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-purple-700">Strengths & Weaknesses</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <TopicInput
                        items={strengths}
                        setItems={setStrengths}
                        placeholder="Enter a strength"
                        label="Strengths"
                      />
                    </div>
                    <div>
                      <TopicInput
                        items={weaknesses}
                        setItems={setWeaknesses}
                        placeholder="Enter a weakness"
                        label="Weaknesses"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Study plan preferences (duration, intensity, etc.) */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-purple-700">Study Plan Preferences</h2>
                  <StudyPlanAdjuster
                    intensity={intensity}
                    learningStyle={learningStyle}
                    onIntensityChange={setIntensity}
                    onLearningStyleChange={setLearningStyle}
                  />
                </div>

                <Separator />

                {/* Practice materials options */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-purple-700">Practice Materials</h2>
                  <PracticeOptions
                    includePracticeProblems={practiceOptions.includePracticeProblems}
                    includeMockExams={practiceOptions.includeMockExams}
                    difficulty={practiceOptions.difficulty}
                    quantity={practiceOptions.quantity}
                    onPracticeProblemsChange={(checked) => 
                      setPracticeOptions(prev => ({ ...prev, includePracticeProblems: checked }))}
                    onMockExamsChange={(checked) => 
                      setPracticeOptions(prev => ({ ...prev, includeMockExams: checked }))}
                    onDifficultyChange={(value) => 
                      setPracticeOptions(prev => ({ ...prev, difficulty: value }))}
                    onQuantityChange={(value) => 
                      setPracticeOptions(prev => ({ ...prev, quantity: value }))}
                  />
                </div>

                {/* Generate button */}
                <Button
                  onClick={handleGenerateStudyGuide}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  size="lg"
                  disabled={isGenerating || !topics.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Study Guide...
                    </>
                  ) : (
                    "Create Study Guide"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Study guide result display */}
        <TabsContent value="result" className="mt-6">
          <StudyGuideDisplay 
            studyGuide={studyGuide} 
            practiceMaterials={practiceMaterials}
            isGenerating={isGenerating} 
          />
        </TabsContent>

        {/* Calendar display */}
        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <StudyCalendar />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}