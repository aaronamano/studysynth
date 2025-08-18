"use client"

import PracticeProblemsOptions from "./practice-problems-generator"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function PracticeProblemsDisplay() {
    const [practiceOptions, setPracticeOptions] = useState({
        includePracticeProblems: true,
        includeMockExams: false,
        difficulty: "mixed",
        quantity: 10,
    });
    const [generatedMaterials, setGeneratedMaterials] = useState<string | null>(null)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Generator */}
            <div>
                <PracticeProblemsOptions
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
                        <h2 className="text-xl font-semibold mb-4">Practice Problems</h2>
                        {generatedMaterials ? (
                            <pre className="whitespace-pre-wrap text-sm">{generatedMaterials}</pre>
                        ) : (
                            <div className="text-center text-gray-500">
                                <p className="text-lg">Your practice problems will appear here.</p>
                                <p className="mt-2">Fill out the options on the left and click "Generate Practice Problems".</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
