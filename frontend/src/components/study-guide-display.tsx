// this component is used to display the generated study guide

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Copy, Loader2 } from "lucide-react"
import { toast } from "sonner"
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

// Props interface for the StudyGuideDisplay component
interface StudyGuideDisplayProps {
  studyGuide: string | null
  isGenerating: boolean
}

// Main component for displaying the study guide
export default function StudyGuideDisplay({ studyGuide, isGenerating }: StudyGuideDisplayProps) {

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

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\s*\[.*?\]\(.*\)\s*)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <b key={i}>{part.slice(2, -2)}</b>;
      }
      if (part.startsWith('\(') && part.endsWith('\)')) {
        return <InlineMath key={i} math={part.slice(2, -2)} />;
      }
      return part;
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

      {/* Render study guide content directly */}
      <Card className="h-full">
        <CardContent className="p-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center p-10">
              <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
              <p className="mt-4 text-lg font-medium text-purple-700">Generating your personalized study guide...</p>
              <p className="text-sm text-muted-foreground mt-2">
                This may take a moment as we tailor the content to your preferences
              </p>
            </div>
          ) : studyGuide ? (
            <div className="prose max-w-none">
              {studyGuide.split("\n").map((line, index) => {
                if (line.startsWith("# ")) {
                  return (
                    <h1 key={index} className="text-2xl font-bold mt-0 mb-4">
                      {renderFormattedText(line.substring(2))}
                    </h1>
                  )
                } else if (line.startsWith("## ")) {
                  return (
                    <h2 key={index} className="text-xl font-semibold mt-6 mb-3">
                      {renderFormattedText(line.substring(3))}
                    </h2>
                  )
                } else if (line.startsWith("### ")) {
                  return (
                    <h3 key={index} className="text-lg font-semibold mt-4 mb-2">
                      {renderFormattedText(line.substring(4))}
                    </h3>
                  )
                } else if (line.startsWith("#### ")) {
                  return (
                    <h4 key={index} className="text-base font-semibold mt-4 mb-2">
                      {renderFormattedText(line.substring(5))}
                    </h4>
                  )
                } else if (line.startsWith("- ")) {
                  return (
                    <li key={index} className="ml-6 mb-1">
                      {renderFormattedText(line.substring(2))}
                    </li>
                  )
                } else if (line.trim() === "") {
                  return <br key={index} />
                } else if (/^\d+\./.test(line)) {
                  return (
                    <div key={index} className="ml-6 mb-1">
                      {renderFormattedText(line)}
                    </div>
                  )
                } else {
                  return (
                    <p key={index} className="mb-4">
                      {renderFormattedText(line)}
                    </p>
                  )
                }
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10">
              <p className="mt-4 text-lg font-medium text-purple-700">No study guide generated yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Fill out the form and click &quot;Create Study Guide&quot; to generate your personalized study materials
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}