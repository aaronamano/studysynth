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
import EventsDisplay from "./events-display"
import TopicInput from "./features/topic-input" // Input for strengths/weaknesses
import TopicPdfImport from "./features/topic-pdf-import" // Input for topics/concepts
import { toast } from "sonner" // For showing error notifications
import { safeLocalStorage } from "@/lib/storage"

export default function StudyGuideGenerator() {
  // State variables for form fields and UI state
  const [isGenerating, setIsGenerating] = useState(false) // Loading state
  const [studyGuide, setStudyGuide] = useState<string | null>(null) // Generated guide
  const [events, setEvents] = useState<any[]>([]) // Generated calendar events
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
    setEvents([]); // Reset events

    try {
      const perplexityApiKey = await getPerplexityApiKey();
      if (!perplexityApiKey) {
        setIsGenerating(false);
        return;
      }

      // --- AI Agent Integration ---
      // Prepare study data for the agent
      const studyDataForAgent = {
        strengths,
        weaknesses,
        mediaPreferences,
        studyPlan
      };
      
      const agentPrompt = constraints || "Generate a comprehensive study plan";
      const aiAgentRes = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: agentPrompt, 
          perplexity_api_key: perplexityApiKey,
          studyData: studyDataForAgent
        }),
      });
      
      if (aiAgentRes.ok) {
        const { studyGuide, events: generatedEvents } = await aiAgentRes.json();
        
        // Set the study guide
        setStudyGuide(studyGuide);
        
        // Set the events and save to calendar
        setEvents(generatedEvents || []);
        const token = safeLocalStorage.getItem('token');
        
        if (token && generatedEvents && generatedEvents.length > 0) {
          // Save all events to calendar with Google Calendar sync if available
          const savePromises = generatedEvents.map((event: any) => 
            fetch('/api/calendar/sync-events', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                title: event.title,
                startDate: event.startDate,
                endDate: event.endDate,
                description: event.description || '',
                syncToGoogle: true, // Automatically try to sync to Google Calendar
              }),
            })
          );
          
          try {
            const results = await Promise.allSettled(savePromises);
            let successful = 0;
            let googleSynced = 0;
            let failed = 0;
            
            for (const result of results) {
              if (result.status === 'fulfilled') {
                successful++;
                if (result.value?.googleEventId) {
                  googleSynced++;
                }
              } else {
                failed++;
              }
            }
            
            if (successful > 0) {
              let message = `Created ${successful} study event${successful > 1 ? 's' : ''} in your calendar!`;
              if (googleSynced > 0) {
                message += ` (${googleSynced} synced to Google Calendar)`;
              }
              toast.success(message);
            }
            if (failed > 0) {
              toast.error(`Failed to save ${failed} event${failed > 1 ? 's' : ''}.`);
            }
          } catch (error) {
            toast.error('Error saving calendar events.');
          }
        } else if (!generatedEvents || generatedEvents.length === 0) {
          toast.warning('No calendar events were generated.');
        }
      } else {
        toast.error('AI agent failed to generate study plan.');
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
                  Generating Complete Study Plan...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Results Display */}
      <div className="space-y-6">
        <StudyGuideDisplay studyGuide={studyGuide} isGenerating={isGenerating} />
        <EventsDisplay events={events} isGenerating={isGenerating} />
      </div>
    </div>
  )
}