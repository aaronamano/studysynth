'use client'

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { useHistory, type HistoryItem } from "@/hooks/use-history"

export default function HistoryPage() {
  const { history, loading, error } = useHistory();

  useEffect(() => {
    if (error) {
      toast.error(error || "Could not load study history.");
    }
  }, [error]);

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
          <a key={key} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 hover:underline">
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
    <main className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-purple-900/10 to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-800/10 rounded-full blur-3xl"></div>
      <div className="container mx-auto px-4 py-6 relative z-10">
        <header className="mb-8 py-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-purple-100">Here's your saved study guides</h1>
          <Link href="/" passHref>
            <Button variant="outline" className="flex items-center bg-black/60 backdrop-blur-md border-purple-500/20 text-purple-200 hover:text-purple-100 shadow-lg shadow-purple-500/5">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </header>

        {loading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
          </div>
        ) : history.length > 0 ? (
          <div className="gap-6">
            <Accordion type="single" collapsible className="w-full grid gap-6">
              {history.map((item: HistoryItem) => (
                <Card key={item._id} className="gap-6 bg-black/60 backdrop-blur-md border-purple-500/20 shadow-lg shadow-purple-500/5">
                  <AccordionItem value={item._id} className="mx-6">
                    <AccordionTrigger className="text-purple-100 hover:text-purple-200">
                      <CardHeader>
                        <CardTitle className="whitespace-nowrap text-purple-100">Study Guide from {new Date(item.createdAt).toLocaleString()}</CardTitle>
                      </CardHeader>
                    </AccordionTrigger>
                    <AccordionContent className="text-purple-200">
                      <CardContent className="prose max-w-none text-purple-200">
                        {item.response.split("\n").map((line: string, index: number) => {
                          if (line.startsWith("# ")) {
                            return <h1 key={index} className="text-2xl font-bold mt-0 mb-4 text-purple-100">{renderFormattedText(line.substring(2))}</h1>
                          } else if (line.startsWith("## ")) {
                            return <h2 key={index} className="text-xl font-semibold mt-6 mb-3 text-purple-200">{renderFormattedText(line.substring(3))}</h2>
                          } else if (line.startsWith("### ")) {
                            return <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-purple-300">{renderFormattedText(line.substring(4))}</h3>
                          } else if (line.startsWith("#### ")) {
                            return <h4 key={index} className="text-base font-semibold mt-4 mb-2 text-purple-300">{renderFormattedText(line.substring(5))}</h4>
                          } else if (line.startsWith("- ")) {
                            return <li key={index} className="ml-6 mb-1 text-purple-200">{renderFormattedText(line.substring(2))}</li>
                          } else if (line.trim() === "") {
                            return <br key={index} />
                          } else if (/^\\d+\\./.test(line)) {
                            return <div key={index} className="ml-6 mb-1 text-purple-200">{renderFormattedText(line)}</div>
                          } else {
                            return <p key={index} className="mb-4 text-purple-200">{renderFormattedText(line)}</p>
                          }
                        })}
                      </CardContent>
                    </AccordionContent>
                  </AccordionItem>
                </Card>
              ))}
            </Accordion>
          </div>
        ) : (
          <div className="text-center text-purple-400">
            <p className="text-lg">You have no saved study guides.</p>
            <p className="mt-2">Go back to the main page to generate and save a new one.</p>
          </div>
        )}
      </div>
    </main>
  );
}
