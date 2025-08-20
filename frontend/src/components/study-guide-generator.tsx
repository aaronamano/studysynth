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
    const token = localStorage.getItem("token");
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
        throw new Error("Failed to fetch API key.");
      }

      const data = await res.json();
      return data.perplexityKey;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error('Failed to fetch API key', {
        description: message,
      });
      return null;
    }
  };


  // Handles the "Create Study Guide" button click
  const handleGenerateStudyGuide = async () => {
    setIsGenerating(true);
    setStudyGuide(""); // Reset the study guide content

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

      // strengths and weaknesses as arrays (JSON string)
      formData.append("strengths", JSON.stringify(strengths));
      formData.append("weaknesses", JSON.stringify(weaknesses));

      // Use lifted mediaPreferences state
      formData.append("mediaPreferences", JSON.stringify(mediaPreferences));
      formData.append("studyPlan", JSON.stringify(studyPlan));

      // Correct: use formData for multipart/form-data
      const studyGuideResponse = await fetch(`http://127.0.0.1:8000/study-guide`, {
        method: 'POST',
        body: formData,
      });

      if (!studyGuideResponse.ok) {
        const errorText = await studyGuideResponse.text();
        throw new Error(`Failed to generate study guide: ${errorText}`);
      }

      if (!studyGuideResponse.body) {
        throw new Error("Response body is empty.");
      }

      const reader = studyGuideResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (part.startsWith('data: ')) {
            const dataStr = part.substring(6);
            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
              }
              if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                setStudyGuide((prev) => (prev || '') + data.choices[0].delta.content);
              }
            } catch (e) {
              console.error("Error parsing stream data:", dataStr, e);
            }
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error('Failed to generate study guide', {
        description: message,
      });
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

