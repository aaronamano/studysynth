// this component is used to handle study guide generation

"use client"

import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import MediaPreferences from "./features/media-preferences"
import StudyPlanAdjuster from "./features/study-plan-adjuster"
import StudyGuideDisplay from "./study-guide-display"
import TopicInput from "./features/topic-input" // Input for strengths/weaknesses
import TopicPdfImport from "./features/topic-pdf-import" // Input for topics/concepts
import { toast } from "sonner" // For showing error notifications
import { safeLocalStorage } from "@/lib/storage"

export default function StudyGuideGenerator() {
  // State variables for form fields and UI state
  const [isGenerating, setIsGenerating] = useState(false) // Loading state
  const [studyGuide, setStudyGuide] = useState<string | null>(null) // Generated guide
  const [pdfFile, setPdfFile] = useState<File | null>(null) // PDF file input
  const [constraints, setConstraints] = useState("") // Constraints input
  const [strengths, setStrengths] = useState([""]) // List of strengths
  const [weaknesses, setWeaknesses] = useState([""]) // List of weaknesses
  const [studyPlan, setStudyPlan] = useState({
    intensity: "balanced",
    learningStyle: "visual",
  }); // Study plan preferences
  const [mediaPreferences, setMediaPreferences] = useState({
    videos: true,
    diagrams: false,
    readings: true,
    summaries: false,
  });

  const getPerplexityApiKey = async () => {
    const token = safeLocalStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to generate a study guide.");
      return null;
    }

    try {
      const res = await fetch("/api/account/keys", {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      return data.perplexityKey;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      return null;
    }
  };


  // Handles the "Create Study Guide" button click
  const handleGenerateStudyGuide = async () => {
    setIsGenerating(true);
    setStudyGuide(null); // Reset the study guide content

    try {
      const perplexityApiKey = await getPerplexityApiKey();
      if (!perplexityApiKey) {
        setIsGenerating(false);
        return;
      }
      // Prepare FormData for FastAPI endpoint
      const formData = new FormData();
      if (pdfFile) {
        formData.append("pdf_file", pdfFile);
      }
      formData.append("constraints", constraints);
      formData.append("perplexity_api_key", perplexityApiKey);
      formData.append("strengths", JSON.stringify(strengths));
      formData.append("weaknesses", JSON.stringify(weaknesses));
      formData.append("mediaPreferences", JSON.stringify(mediaPreferences));
      formData.append("studyPlan", JSON.stringify(studyPlan));

      // Correct: use formData for multipart/form-data
      const studyGuideResponse = await fetch('/api/study-guide', {
        method: 'POST',
        body: formData,
      });

      if (!studyGuideResponse.ok) {
        const errorText = await studyGuideResponse.text();
        toast.error("Failed to generate study guide.", { description: errorText });
        throw new Error(`Failed to generate study guide: ${errorText}`);
      }

      const data = await studyGuideResponse.json();
      setStudyGuide(data.study_guide);

      // --- AI Agent Integration ---
      // Compose the prompt (could be the constraints, or the generated study guide, or both)
      const agentPrompt = constraints || data.study_guide || "";
      if (agentPrompt) {
        const aiAgentRes = await fetch('/api/ai-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: agentPrompt, perplexity_api_key: perplexityApiKey }),
        });
        if (aiAgentRes.ok) {
          const { event } = await aiAgentRes.json();
          if (event && event.title && event.start && event.end) {
            // Save event to calendar
            const token = safeLocalStorage.getItem('token');
            if (token) {
              const calendarRes = await fetch('/api/calendar/events', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  title: event.title,
                  startDate: event.start,
                  endDate: event.end,
                  description: event.description || '',
                }),
              });
              if (calendarRes.ok) {
                toast.success('Calendar event created!', { description: event.title });
              } else {
                toast.error('Failed to save calendar event.');
              }
            }
          }
        } else {
          toast.error('AI agent failed to suggest a calendar event.');
        }
      }
      // --- End AI Agent Integration ---

    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error("An error occurred while generating the study guide.", { description: message });
    } finally {
      setIsGenerating(false);
    }
  }

  // Main UI rendering
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Generator Form */}
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-6">
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
              <MediaPreferences
                preferences={mediaPreferences}
                setPreferences={setMediaPreferences}
              />
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
                studyPlan={studyPlan}
                setStudyPlan={setStudyPlan}
              />
            </div>

            <Separator />

            {/* Generate button */}
            <Button
              onClick={handleGenerateStudyGuide}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              size="lg"
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
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Study Guide Display */}
      <div>
        <StudyGuideDisplay studyGuide={studyGuide} isGenerating={isGenerating} />
      </div>
    </div>
  )
}