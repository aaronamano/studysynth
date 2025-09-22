"use client"

import MockExamOptions from "./mock-exam-generator"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Copy, Loader2 } from "lucide-react"
import { toast } from "sonner"
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

export default function MockExamDisplay() {
    const [practiceOptions, setPracticeOptions] = useState({
        difficulty: "mixed",
        quantity: 10,
    });
    const [generatedMaterials, setGeneratedMaterials] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)

    const handleCopy = () => {
        if (generatedMaterials) {
            navigator.clipboard.writeText(generatedMaterials)
            toast.success("Copied to clipboard", {
                description: "The mock exam has been copied to your clipboard"
            })
        }
    }

    const handleDownload = () => {
        if (generatedMaterials) {
            const blob = new Blob([generatedMaterials], { type: "text/markdown" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "mock-exam.md"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            toast.success("Downloaded", {
                description: "Your mock exam has been downloaded"
            })
        }
    }

    const renderFormattedText = (text: string) => {
        const regex = /\[(.*?)\]\((.*?)\)|\*\*(.*?)\*\*|\\\((.*?)\\\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;
    
        while ((match = regex.exec(text)) !== null) {
          // Add the plain text before the match
          if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
          }
    
          const key = match.index;
    
          // Check which group was matched and add the corresponding JSX element
          if (match[1] !== undefined && match[2] !== undefined) { // Markdown Link
            parts.push(
              <a key={key} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 hover:underline">
                {match[1]}
              </a>
            );
          } else if (match[3] !== undefined) { // Bold
            parts.push(<b key={key}>{match[3]}</b>);
          } else if (match[4] !== undefined) { // KaTeX
            parts.push(<InlineMath key={key} math={match[4]} />);
          }
    
          lastIndex = regex.lastIndex;
        }
    
        // Add any remaining plain text
        if (lastIndex < text.length) {
          parts.push(text.substring(lastIndex));
        }
    
        return parts;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Generator */}
            <div>
                <MockExamOptions
                    difficulty={practiceOptions.difficulty}
                    quantity={practiceOptions.quantity}
                    onDifficultyChange={(value) =>
                        setPracticeOptions(prev => ({ ...prev, difficulty: value }))}
                    onQuantityChange={(value) =>
                        setPracticeOptions(prev => ({ ...prev, quantity: value }))}
                    onGenerate={setGeneratedMaterials}
                    onIsGeneratingChange={setIsGenerating}
                />
            </div>

            {/* Right Column: Display */}
            <div>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Mock Exam</h2>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopy}
                                    className="border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy
                                </Button>
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
                        <div className="mb-6">
                            <p className="font-medium text-purple-700">Instructions:</p>
                            <ul className="list-disc ml-6 text-sm text-muted-foreground">
                                <li>Read each question carefully before answering</li>
                                <li>Manage your time wisely</li>
                                <li>Show your work where applicable</li>
                            </ul>
                        </div>
                        {isGenerating ? (
                            <div className="flex flex-col items-center justify-center p-10">
                                <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                                <p className="mt-4 text-lg font-medium text-purple-700">Generating your mock exam...</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    This may take a moment as we tailor the content to your preferences
                                </p>
                            </div>
                        ) : generatedMaterials ? (
                            <div className="prose max-w-none">
                                {generatedMaterials.split("\n").map((line, index) => {
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
                            <div className="text-center text-gray-500">
                                <p className="text-lg">Your mock exam will appear here.</p>
                                <p className="mt-2">Fill out the options on the left and click "Generate Mock Exam".</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}