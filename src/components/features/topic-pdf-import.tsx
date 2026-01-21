// this component is used to input topics and concepts from a PDF file

"use client"

import { Label } from "@/components/ui/label"
import { Info, Loader2, FileText, CheckCircle } from "lucide-react"
import { useRef, useState } from "react"
import type { PdfFileWithContent } from "@/lib/types"
import { toast } from "sonner"

export default function TopicPdfImport({ value, onChange }: { value: File | null, onChange: (value: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'extracting' | 'success' | 'error'>('idle')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (!file) {
      onChange(null);
      setExtractionStatus('idle');
      return;
    }

    setIsExtracting(true);
    setExtractionStatus('extracting');

    try {
      // Extract PDF content
      const formData = new globalThis.FormData();
      formData.append('pdf', file);
      
      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to extract PDF: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.content) {
        const pdfWithContent = file as PdfFileWithContent;
        pdfWithContent.extractedContent = result.content;
        pdfWithContent.pages = result.pages;
        
        onChange(pdfWithContent);
        setExtractionStatus('success');
        toast.success(`PDF extracted successfully (${result.pages} pages)`);
      } else {
        throw new Error(result.error || 'Failed to extract content');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to extract PDF';
      toast.error(errorMessage);
      setExtractionStatus('error');
      onChange(null);
    } finally {
      setIsExtracting(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <Label htmlFor="topics-pdf" className="text-base text-purple-200">
          Import topics and concepts from PDF
        </Label>
        <div className="flex items-center text-xs text-muted-foreground">
          <Info className="h-3 w-3 mr-1" />
          <span className="text-purple-500">Upload a PDF to extract topics</span>
        </div>
      </div>

      <input
        ref={inputRef}
        id="topics-pdf"
        type="file"
        accept="application/pdf"
        className="block w-full text-sm text-purple-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:text-sm file:font-semibold file:bg-black/60 file:border file:border-purple-500/30 file:text-purple-300 hover:file:bg-purple-900/40 file:shadow-md file:shadow-purple-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
        onChange={handleFileChange}
        disabled={isExtracting}
      />

      {isExtracting && (
        <div className="mt-2 p-2 border border-purple-500/30 rounded-xl bg-black/40 text-purple-300 text-xs">
          <div className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Extracting PDF content...</span>
          </div>
        </div>
      )}

      {value && !isExtracting && (
        <div className="mt-2 p-2 border border-purple-500/30 rounded-xl bg-black/40 text-purple-300 text-xs max-h-48 overflow-auto">
          <div className="flex items-center gap-2 mb-2">
            {extractionStatus === 'success' ? (
              <CheckCircle className="h-3 w-3 text-green-400" />
            ) : (
              <FileText className="h-3 w-3 text-purple-400" />
            )}
            <span className="font-medium">{value?.name}</span>
            {(value as PdfFileWithContent)?.pages && (
              <span className="text-purple-400">({(value as PdfFileWithContent).pages} pages)</span>
            )}
          </div>
          {(value as PdfFileWithContent)?.extractedContent && (
            <div className="mt-2 pt-2 border-t border-purple-500/20">
              <div className="text-purple-400 font-medium mb-1">Extracted Content Preview:</div>
              <div className="text-purple-300 whitespace-pre-wrap">
                {(value as PdfFileWithContent).extractedContent?.substring(0, 500)}
                {(value as PdfFileWithContent).extractedContent && 
                 (value as PdfFileWithContent).extractedContent!.length > 500 && '...'}
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-purple-500">
        Please upload a PDF file, preferably 5 pages max. Content will be automatically extracted.
      </p>
    </div>
  )
}