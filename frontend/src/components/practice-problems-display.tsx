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
        <>
            {/* Practice materials options */}
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

            <br />

            {/* Only display the card output */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Practice Materials</h2>
                    {generatedMaterials ? (
                        <pre className="whitespace-pre-wrap text-sm">{generatedMaterials}</pre>
                    ) : null}
                </CardContent>
            </Card>
        </>
    )
}