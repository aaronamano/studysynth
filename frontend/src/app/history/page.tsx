'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface StudyGuideHistory {
  _id: string;
  response: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<StudyGuideHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch history");
          }
          return res.json();
        })
        .then((data) => {
          setHistory(data);
          setLoading(false);
        })
        .catch((error) => {
          toast.error(error.message || "Could not load study history.");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

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
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-8 py-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-purple-800">Study Guide History</h1>
          <Link href="/" passHref>
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </header>

        {loading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
          </div>
        ) : history.length > 0 ? (
          <div className="gap-6">
            <Accordion type="single" collapsible className="w-full grid gap-6">
              {history.map((item) => (
                <Card className="gap-6">
                  <AccordionItem value={item._id} key={item._id} className="mx-6">
                    <AccordionTrigger>
                      <CardHeader>
                        <CardTitle className="whitespace-nowrap">Study Guide from {new Date(item.createdAt).toLocaleString()}</CardTitle>
                      </CardHeader>
                    </AccordionTrigger>
                    <AccordionContent>
                      <CardContent className="prose max-w-none">
                        {item.response.split("\n").map((line, index) => {
                          if (line.startsWith("# ")) {
                            return <h1 key={index} className="text-2xl font-bold mt-0 mb-4">{renderFormattedText(line.substring(2))}</h1>
                          } else if (line.startsWith("## ")) {
                            return <h2 key={index} className="text-xl font-semibold mt-6 mb-3">{renderFormattedText(line.substring(3))}</h2>
                          } else if (line.startsWith("### ")) {
                            return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{renderFormattedText(line.substring(4))}</h3>
                          } else if (line.startsWith("#### ")) {
                            return <h4 key={index} className="text-base font-semibold mt-4 mb-2">{renderFormattedText(line.substring(5))}</h4>
                          } else if (line.startsWith("- ")) {
                            return <li key={index} className="ml-6 mb-1">{renderFormattedText(line.substring(2))}</li>
                          } else if (line.trim() === "") {
                            return <br key={index} />
                          } else if (/^\\d+\\./.test(line)) {
                            return <div key={index} className="ml-6 mb-1">{renderFormattedText(line)}</div>
                          } else {
                            return <p key={index} className="mb-4">{renderFormattedText(line)}</p>
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
          <div className="text-center text-gray-500">
            <p className="text-lg">You have no saved study guides.</p>
            <p className="mt-2">Go back to the main page to generate and save a new one.</p>
          </div>
        )}
      </div>
    </main>
  );
}
