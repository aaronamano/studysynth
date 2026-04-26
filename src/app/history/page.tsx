'use client'

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { useHistory, type HistoryItem } from "@/hooks/use-history"

export default function HistoryPage() {
  const { history, loading, error } = useHistory();

  const renderFormattedText = (text: string) => {
    const regex = /\[(.*?)\]\((.*?)\)|\*\*([^*]+)\*\*|\\\((.*?)\\\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const key = match.index;

      if (match[1] !== undefined && match[2] !== undefined) {
        parts.push(
          <a key={key} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 hover:underline">
            {match[1]}
          </a>
        );
      } else if (match[3] !== undefined) {
        parts.push(<b key={key}>{match[3]}</b>);
      } else if (match[4] !== undefined) {
        parts.push(<InlineMath key={key} math={match[4]} />);
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (
    <main className="min-h-screen bg-[#0d0c0a] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,40,30,0.4)_0%,_transparent_70%)]"></div>
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-900/8 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-950/10 rounded-full blur-3xl"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDJiM2ZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-40 mix-blend-overlay"></div>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        <header className="mb-10 py-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-amber-100 font-serif">Your Saved Study Guides</h1>
          <Link href="/" passHref>
            <Button variant="outline" className="flex items-center border-amber-700/40 text-amber-200/80 hover:text-amber-100 hover:border-amber-600/60 hover:bg-amber-900/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </header>

        {loading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="h-10 w-10 animate-spin text-amber-400" />
          </div>
        ) : history.length > 0 ? (
          <div className="gap-6">
            <Accordion type="single" collapsible className="w-full grid gap-6">
              {history.map((item: HistoryItem) => (
                <Card key={item._id} className="gap-6 bg-[#12100e] border-amber-800/15">
                  <AccordionItem value={item._id} className="mx-6">
                    <AccordionTrigger className="text-amber-100 hover:text-amber-200">
                      <CardHeader>
                        <CardTitle className="whitespace-nowrap text-amber-100 font-serif">Study Guide from {new Date(item.createdAt).toLocaleString()}</CardTitle>
                      </CardHeader>
                    </AccordionTrigger>
                    <AccordionContent className="text-amber-200/80">
                      <CardContent className="prose max-w-none text-amber-200/80">
                        {item.response.split("\n").map((line: string, index: number) => {
                          if (line.startsWith("# ")) {
                            return <h1 key={index} className="text-2xl font-bold mt-0 mb-4 text-amber-100 font-serif">{renderFormattedText(line.substring(2))}</h1>
                          } else if (line.startsWith("## ")) {
                            return <h2 key={index} className="text-xl font-semibold mt-6 mb-3 text-amber-200 font-serif">{renderFormattedText(line.substring(3))}</h2>
                          } else if (line.startsWith("### ")) {
                            return <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-amber-300">{renderFormattedText(line.substring(4))}</h3>
                          } else if (line.startsWith("#### ")) {
                            return <h4 key={index} className="text-base font-semibold mt-4 mb-2 text-amber-300">{renderFormattedText(line.substring(5))}</h4>
                          } else if (line.startsWith("- ")) {
                            return <li key={index} className="ml-6 mb-1 text-amber-200/80">{renderFormattedText(line.substring(2))}</li>
                          } else if (line.trim() === "") {
                            return <br key={index} />
                          } else if (/^\d+\./.test(line)) {
                            return <div key={index} className="ml-6 mb-1 text-amber-200/80">{renderFormattedText(line)}</div>
                          } else {
                            return <p key={index} className="mb-4 text-amber-200/80">{renderFormattedText(line)}</p>
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
          <div className="text-center text-amber-400/60">
            <p className="text-lg">You have no saved study guides.</p>
            <p className="mt-2">Go back to the main page to generate and save a new one.</p>
          </div>
        )}
      </div>
    </main>
  );
}