"use client"

import MockExamOptions from "./mock-exam-generator"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Copy } from "lucide-react"
import { toast } from "sonner"

export default function MockExamDisplay() {
    const [practiceOptions, setPracticeOptions] = useState({
        difficulty: "mixed",
        quantity: 10,
    });
    const [generatedMaterials, setGeneratedMaterials] = useState<string | null>(null)

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
                        {generatedMaterials ? (
                            <pre className="whitespace-pre-wrap text-sm">{generatedMaterials}</pre>
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
