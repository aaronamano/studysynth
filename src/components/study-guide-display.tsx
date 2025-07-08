"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Download, Copy, BookOpen, FileText, ListChecks, PenTool } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

// Props interface for the StudyGuideDisplay component
interface StudyGuideDisplayProps {
  studyGuide: string | null
  practiceMaterials: string | null
  isGenerating: boolean
}

// Update the extractSection helper function to be more robust
const extractSection = (content: string | null, sectionName: string) => {
  if (!content) return '';
  
  // First try to find content between section headers
  const sections = content.split(/# /m);
  const sectionContent = sections.find(s => s.startsWith(sectionName));
  
  if (sectionContent) {
    // Remove the section name and trim
    return sectionContent.replace(sectionName, '').trim();
  }

  // If no sections found, try to extract Q&A pairs directly
  const lines = content.split('\n');
  const relevantLines = lines.filter(line => {
    const trimmedLine = line.trim();
    return trimmedLine.startsWith('Q') || trimmedLine.startsWith('A');
  });

  return relevantLines.join('\n');
};

const parseQAPairs = (content: string) => {
  if (!content) return [];
  
  const lines = content.split('\n');
  return lines.reduce((acc: { question: string; answer: string }[], line, index, array) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('Q')) {
      const questionNum = trimmedLine.match(/Q(\d+)/)?.[1];
      const answer = array.find(l => l.trim().startsWith(`A${questionNum}`));
      if (answer) {
        acc.push({
          question: trimmedLine,
          answer: answer.trim()
        });
      }
    }
    return acc;
  }, []);
};

// Main component for displaying the study guide
export default function StudyGuideDisplay({ studyGuide, practiceMaterials, isGenerating }: StudyGuideDisplayProps) {
  // State to track which tab/view is active
  const [activeView, setActiveView] = useState("full")

  // Copies the study guide text to the clipboard and shows a toast notification
  const handleCopy = () => {
    if (studyGuide) {
      navigator.clipboard.writeText(studyGuide)
      toast.success("Copied to clipboard", {
        description: "The study guide has been copied to your clipboard"
      })
    }
  }

  // Downloads the study guide as a markdown file and shows a toast notification
  const handleDownload = () => {
    if (studyGuide) {
      const blob = new Blob([studyGuide], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "study-guide.md"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Downloaded", {
        description: "Your study guide has been downloaded"
      })
    }
  }

  // If the study guide is being generated, show a loading card
  if (isGenerating) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-10">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
          <p className="mt-4 text-lg font-medium text-purple-700">Generating your personalized study guide...</p>
          <p className="text-sm text-muted-foreground mt-2">
            This may take a moment as we tailor the content to your preferences
          </p>
        </CardContent>
      </Card>
    )
  }

  // If there is no study guide yet, show an empty state card
  if (!studyGuide) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-10">
          <BookOpen className="h-10 w-10 text-purple-500" />
          <p className="mt-4 text-lg font-medium text-purple-700">No study guide generated yet</p>
            <p className="text-sm text-muted-foreground mt-2">
            Fill out the form and click &quot;Create Study Guide&quot; to generate your personalized study materials
            </p>
        </CardContent>
      </Card>
    )
  }

  // Function to process and render links in text (moved to top level for reuse)
  const renderTextWithLinks = (text: string) => {
    // Match markdown links [text](url)
    const parts = text.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return (
          <a
            key={i}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 underline"
          >
            {linkMatch[1]}
          </a>
        );
      }
      // Also handle plain URLs in text
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const textParts = part.split(urlRegex);
      return textParts.map((textPart, j) => {
        if (textPart.match(urlRegex)) {
          return (
            <a
              key={`${i}-${j}`}
              href={textPart}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-800 underline"
            >
              {textPart}
            </a>
          );
        }
        return textPart;
      });
    });
  };

  // Main UI when a study guide is available
  return (
    <div className="space-y-4">
      {/* Header with title and action buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Study Guide</h2>
        <div className="flex space-x-2">
          {/* Copy button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="border-purple-200 hover:bg-purple-50 hover:text-purple-700"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          {/* Download button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="border-purple-200 hover:bg-purple-50 hover:text-purple-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Tabs for switching between different study guide views */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <div className="flex justify-center">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-purple-100">
            <TabsTrigger value="full" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <BookOpen className="mr-2 h-4 w-4" />
              Full Guide
            </TabsTrigger>
            <TabsTrigger value="summary" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <FileText className="mr-2 h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="practice" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <ListChecks className="mr-2 h-4 w-4" />
              Practice
            </TabsTrigger>
            <TabsTrigger value="exam" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <PenTool className="mr-2 h-4 w-4" />
              Mock Exam
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Full Guide content */}
        <TabsContent value="full">
          <Card>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                {/* Render each line of the study guide with basic markdown-like formatting */}
                {studyGuide.split("\n").map((line, index) => {
                  if (line.startsWith("# ")) {
                    return (
                      <h1 key={index} className="text-2xl font-bold mt-0 mb-4">
                        {renderTextWithLinks(line.substring(2))}
                      </h1>
                    )
                  } else if (line.startsWith("## ")) {
                    return (
                      <h2 key={index} className="text-xl font-semibold mt-6 mb-3">
                        {renderTextWithLinks(line.substring(3))}
                      </h2>
                    )
                  } else if (line.startsWith("- ")) {
                    return (
                      <li key={index} className="ml-6 mb-1">
                        {renderTextWithLinks(line.substring(2))}
                      </li>
                    )
                  } else if (line.trim() === "") {
                    return <br key={index} />
                  } else if (/^\d+\./.test(line)) {
                    return (
                      <div key={index} className="ml-6 mb-1">
                        {renderTextWithLinks(line)}
                      </div>
                    )
                  } else {
                    return (
                      <p key={index} className="mb-4">
                        {renderTextWithLinks(line)}
                      </p>
                    )
                  }
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary content */}
        <TabsContent value="summary">
          <Card>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">Study Guide Summary</h2>
                <p>This personalized study guide covers the following topics:</p>
                <ul className="my-4">
                  {studyGuide.includes("Key Concepts") ? (
                    studyGuide
                      .split("Key Concepts")[1]
                      .split("\n")
                      .filter((line) => line.startsWith("- "))
                      .map((line, index) => (
                        <li key={index}>{renderTextWithLinks(line.substring(2))}</li>
                      ))
                  ) : (
                    <li>Various topics as specified in your input</li>
                  )}
                </ul>

                <p className="mb-4">
                  {renderTextWithLinks(
                    "The guide is structured to help you leverage your strengths while addressing areas that need improvement. It includes a customized study plan with resources tailored to your learning preferences."
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Practice Problems content */}
        <TabsContent value="practice">
          <Card>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">Practice Problems</h2>
                {practiceMaterials ? (
                  <div className="space-y-6">
                    {parseQAPairs(extractSection(practiceMaterials, 'Practice Problems')).map(({ question, answer }, index) => (
                      <div key={index} className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="font-medium mb-2">{renderTextWithLinks(question)}</p>
                        <details className="mt-2">
                          <summary className="text-sm text-purple-600 cursor-pointer hover:text-purple-800">
                            Show Solution
                          </summary>
                          <p className="mt-2 text-muted-foreground">
                            {renderTextWithLinks(answer.substring(answer.indexOf(".") + 1).trim())}
                          </p>
                        </details>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No practice problems available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mock Exam content */}
        <TabsContent value="exam">
          <Card>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Mock Exam</h2>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      className="border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Exam
                    </Button>
                  </div>
                </div>
                {practiceMaterials ? (
                  <>
                    <div className="mb-6">
                      <p className="font-medium text-purple-700">Instructions:</p>
                      <ul className="list-disc ml-6 text-sm text-muted-foreground">
                        <li>Read each question carefully before answering</li>
                        <li>Manage your time wisely</li>
                        <li>Show your work where applicable</li>
                      </ul>
                    </div>
                    <div className="space-y-6">
                      {parseQAPairs(extractSection(practiceMaterials, 'Mock Exam')).map(({ question, answer }, index) => (
                        <div key={index} className="mb-8 p-4 bg-purple-50 rounded-lg border border-purple-100">
                          <p className="font-medium mb-4">{renderTextWithLinks(question)}</p>
                          <Textarea
                            placeholder="Enter your answer here..."
                            className="mt-2"
                            rows={4}
                          />
                          <details className="mt-4">
                            <summary className="text-sm text-purple-600 cursor-pointer hover:text-purple-800">
                              Show Solution
                            </summary>
                            <p className="mt-2 p-3 bg-white rounded text-muted-foreground">
                              {renderTextWithLinks(answer.substring(answer.indexOf(".") + 1).trim())}
                            </p>
                          </details>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">No mock exam available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}