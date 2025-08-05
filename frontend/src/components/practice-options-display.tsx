"use client"

import PracticeOptions from "./practice-options-generator"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ListChecks, PenTool } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function PracticeProblemsDisplay() {
    const [practiceOptions, setPracticeOptions] = useState({
        includePracticeProblems: true,
        includeMockExams: false,
        difficulty: "mixed",
        quantity: 10,
    });
    const [activeTab, setActiveTab] = useState("practice")
    const [generatedMaterials, setGeneratedMaterials] = useState<string | null>(null)

    return (
        <>
            {/* Practice materials options */}
            <div>
                <PracticeOptions
                    includePracticeProblems={practiceOptions.includePracticeProblems}
                    includeMockExams={practiceOptions.includeMockExams}
                    difficulty={practiceOptions.difficulty}
                    quantity={practiceOptions.quantity}
                    onPracticeProblemsChange={(checked) =>
                        setPracticeOptions(prev => ({ ...prev, includePracticeProblems: checked }))}
                    onMockExamsChange={(checked) =>
                        setPracticeOptions(prev => ({ ...prev, includeMockExams: checked }))}
                    onDifficultyChange={(value) =>
                        setPracticeOptions(prev => ({ ...prev, difficulty: value }))}
                    onQuantityChange={(value) =>
                        setPracticeOptions(prev => ({ ...prev, quantity: value }))}
                    onGenerate={setGeneratedMaterials}
                />
            </div>

            {/* Tabs for Practice Problems and Mock Exam */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
                <div className="flex justify-center">
                    <TabsList className="grid grid-cols-2 w-full max-w-md bg-purple-100">
                        <TabsTrigger value="practice" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                            <ListChecks className="mr-2 h-4 w-4" />
                            Practice Problems
                        </TabsTrigger>
                        <TabsTrigger value="exam" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                            <PenTool className="mr-2 h-4 w-4" />
                            Mock Exam
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="practice">
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Practice Problems</h2>
                            {practiceOptions.includePracticeProblems && generatedMaterials ? (
                                <pre className="whitespace-pre-wrap text-sm">{generatedMaterials}</pre>
                            ) : null}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="exam">
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
                            {practiceOptions.includeMockExams && generatedMaterials ? (
                                <pre className="whitespace-pre-wrap text-sm">{generatedMaterials}</pre>
                            ) : null}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    )
}