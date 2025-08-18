"use client"

import MockExamOptions from "./mock-exam-generator"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function MockExamDisplay() {
    const [practiceOptions, setPracticeOptions] = useState({
        difficulty: "mixed",
        quantity: 10,
    });
    const [generatedMaterials, setGeneratedMaterials] = useState<string | null>(null)

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
                        <h2 className="text-xl font-semibold mb-4">Mock Exam</h2>
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
