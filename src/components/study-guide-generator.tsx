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
import { CalendarEvent } from "@/lib/types"
import TopicInputSelector from "./features/topic-input-selector" // Unified input for topics/concepts
import { toast } from "sonner" // For showing error notifications
import { safeLocalStorage } from "@/lib/storage"
import type { PdfFileWithContent } from "@/lib/types"

export default function StudyGuideGenerator() {
  // State variables for form fields and UI state
  const [isGenerating, setIsGenerating] = useState(false) // Loading state
  const [studyGuide, setStudyGuide] = useState<string | null>(null) // Generated guide
  const [events, setEvents] = useState<CalendarEvent[]>([]) // Generated calendar events
  const [topicContent, setTopicContent] = useState<File | string | null>(null) // Topic content (PDF file or text)
  const [inputType, setInputType] = useState<'pdf' | 'text'>('pdf') // Input type selector
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
    } catch {
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

      // --- AI Agent Integration with SSE ---
      // Prepare study data for the agent
      const studyDataForAgent = {
        strengths,
        weaknesses,
        mediaPreferences,
        studyPlan
      };
      
      // Build comprehensive prompt with PDF content if available
      let agentPrompt = constraints || "Generate a comprehensive study plan";
      
      let contentSource = '';
      
      if (inputType === 'pdf' && topicContent instanceof File && (topicContent as PdfFileWithContent).extractedContent) {
        const pdfContent = (topicContent as PdfFileWithContent).extractedContent;
        if (pdfContent) {
          contentSource = pdfContent;
        }
      } else if (inputType === 'text' && typeof topicContent === 'string') {
        contentSource = topicContent;
      }
      
      if (contentSource) {
        agentPrompt = `
CONTENT TO STUDY:
${contentSource}

USER REQUIREMENTS:
${agentPrompt}

IMPORTANT: Base the study guide specifically on the content provided above. Focus on the key topics, concepts, and materials found in the content while considering the user's requirements.
        `.trim();
      }
      
      // Use fetch with streaming for SSE
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: agentPrompt, 
          perplexity_api_key: perplexityApiKey,
          studyData: studyDataForAgent,
          stream: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          setIsGenerating(false);
          break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'progress':
                  console.log('Progress:', data.content);
                  break;
                  
                case 'study_guide':
                  setStudyGuide(data.content);
                  break;
                  
                case 'events': {
                  const generatedEvents = JSON.parse(data.content);
                  setEvents(generatedEvents || []);
                  
                  // Save events to calendar
                  const token = safeLocalStorage.getItem('token');
                  if (token && generatedEvents && generatedEvents.length > 0) {
                    const savePromises = generatedEvents.map((event: { title: string; startDate: string; endDate: string; description?: string }) => 
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
                          syncToGoogle: true,
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
                    } catch {
                      toast.error('Error saving calendar events.');
                    }
                  } else if (!generatedEvents || generatedEvents.length === 0) {
                    toast.warning('No calendar events were generated.');
                  }
                  break;
                }
                  
                case 'complete':
                  setIsGenerating(false);
                  toast.success('Study plan generation completed!');
                  return; // Exit the function
                  
                case 'error':
                  console.error('SSE Error:', data.content);
                  toast.error('AI agent error: ' + data.content);
                  setIsGenerating(false);
                  return; // Exit the function
              }
            } catch (error) {
              console.error('Error parsing SSE data:', error);
            }
          }
        }
      }

      // --- End AI Agent Integration ---

    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error("An error occurred while generating the study guide.", { description: message });
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
              <h2 className="text-xl font-semibold mb-4 text-amber-300 font-serif">Topics & Concepts</h2>
              <TopicInputSelector 
                value={topicContent} 
                onChange={setTopicContent}
                inputType={inputType}
                onInputTypeChange={setInputType}
              />
            </div>

            <Separator />

            {/* Constraints input */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-amber-300 font-serif">Constraints & Requirements</h2>
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
              <h2 className="text-xl font-semibold mb-4 text-amber-300 font-serif">Media Preferences</h2>
              <MediaPreferences
                preferences={mediaPreferences}
                setPreferences={setMediaPreferences}
              />
            </div>

            <Separator />

            {/* Strengths and weaknesses input */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-amber-300 font-serif">Strengths & Weaknesses</h2>
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
              <h2 className="text-xl font-semibold mb-4 text-amber-300 font-serif">Study Plan Preferences</h2>
              <StudyPlanAdjuster
                studyPlan={studyPlan}
                setStudyPlan={setStudyPlan}
              />
            </div>

            <Separator />

            {/* Generate button */}
            <Button
              onClick={handleGenerateStudyGuide}
              className="w-full px-6 py-3 border border-amber-600/30 text-base font-medium rounded-full text-amber-100 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-amber-600/20 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-amber-500/25"
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