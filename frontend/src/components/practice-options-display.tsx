"use client"

import PracticeOptions from "./practice-options-generator"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ListChecks, PenTool } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function PracticeProblemsDisplay() {
    const [practiceOptions, setPracticeOptions] = useState({
        includePracticeProblems: true,
        includeMockExams: false,
        difficulty: "mixed",
        quantity: 50,
    });
    const [activeTab, setActiveTab] = useState("practice")

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
                            <div className="space-y-6">
                                {[1, 2, 3].map((num) => (
                                    <div key={num} className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
                                        <p className="font-medium mb-2">Q{num}: Placeholder practice question {num}?</p>
                                        <details className="mt-2">
                                            <summary className="text-sm text-purple-600 cursor-pointer hover:text-purple-800">
                                                Show Solution
                                            </summary>
                                            <p className="mt-2 text-muted-foreground">
                                                Placeholder answer for practice question {num}.
                                            </p>
                                        </details>
                                    </div>
                                ))}
                            </div>
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
                            <div className="space-y-6">
                                {[1, 2, 3].map((num) => (
                                    <div key={num} className="mb-8 p-4 bg-purple-50 rounded-lg border border-purple-100">
                                        <p className="font-medium mb-4">Q{num}: Mock exam placeholder question {num}?</p>
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
                                                Placeholder solution for mock exam question {num}.
                                            </p>
                                        </details>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    )
}