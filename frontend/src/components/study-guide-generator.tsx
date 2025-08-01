// this component is used to handle study guide generation

"use client"

import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, BookOpen, FileText, WalletCards, Brain } from "lucide-react"
import MediaPreferences from "./media-preferences"
import StudyPlanAdjuster from "./study-plan-adjuster"
import StudyGuideDisplay from "./study-guide-display"
import PracticeOptionsDisplay from "./practice-options-display" // Import practice problems display
import TopicInput from "./topic-input" // Input for strengths/weaknesses
import TopicPdfImport from "./topic-pdf-import" // Input for topics/concepts
import { toast } from "sonner" // For showing error notifications

export default function StudyGuideGenerator() {

  // Add new state variables
  const [intensity, setIntensity] = useState("balanced")
  const [learningStyle, setLearningStyle] = useState("visual")

  // State variables for form fields and UI state
  const [isGenerating, setIsGenerating] = useState(false) // Loading state
  const [studyGuide, setStudyGuide] = useState<string | null>(null) // Generated guide
  const [pdfFile, setPdfFile] = useState<File | null>(null) // PDF file input
  const [constraints, setConstraints] = useState("") // Constraints input
  const [strengths, setStrengths] = useState([""]) // List of strengths
  const [weaknesses, setWeaknesses] = useState([""]) // List of weaknesses
  const [activeTab, setActiveTab] = useState("input") // Tabs: input/result

  // Handles the "Create Study Guide" button click
  const handleGenerateStudyGuide = async () => {
    setIsGenerating(true);

    // api route to generate study guide

    try {

      // Get the study guide
      const studyGuideResponse = await fetch('/api/study-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfFile,
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
        <TabsList className="grid w-full grid-cols-4 bg-purple-100">
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
          {/* Flashcard tab */}
          <TabsTrigger value="flashcard" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <WalletCards className="mr-2 h-4 w-4" />
            Flashcard Lab
          </TabsTrigger>
          {/* Practice problems tab */}
          <TabsTrigger value="practice" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Brain className="mr-2 h-4 w-4" />
            Practice Problems
          </TabsTrigger>
        </TabsList>

        {/* Input form content */}
        <TabsContent value="input" className="space-y-6 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* pdf input */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-purple-700">Topics & Concepts</h2>
                  <TopicPdfImport value={pdfFile} onChange={setPdfFile} />
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

                {/* Generate button */}
                <Button
                  onClick={handleGenerateStudyGuide}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  size="lg"
                  disabled={isGenerating}
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
            isGenerating={isGenerating} 
          />
        </TabsContent>

        <TabsContent value="flashcard" className="mt-6">
          {/* Placeholder for Flashcard Lab content */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <p className="text-lg">Flashcard Lab is under construction!</p>
                <p className="mt-2">Stay tuned for updates.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice" className="mt-6">
          {/* Placeholder for Practice Problems content */}
          <Card>
            <CardContent className="p-6">
              <PracticeOptionsDisplay />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}