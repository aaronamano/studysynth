import pdf from 'pdf-parse-new';

export interface ExtractedPdfContent {
  text: string;
  pages: number;
  info: Record<string, unknown>;
}

export async function extractPdfContent(buffer: ArrayBuffer): Promise<ExtractedPdfContent> {
  try {
    // Convert ArrayBuffer to Buffer for pdf-parse
    const nodeBuffer = globalThis.Buffer.from(buffer);
    const data = await pdf(nodeBuffer);
    
    return {
      text: data.text,
      pages: data.numpages,
      info: data.info || {}
    };
  } catch (error) {
    throw new Error(`Failed to extract PDF content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function cleanExtractedText(text: string): string {
  return text
    // Remove control characters that can cause JSON parsing issues
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F]/g, '')
    // Replace multiple whitespace with single space
    .replace(/\s+/g, ' ')
    // Replace 3+ newlines with double newline
    .replace(/\n{3,}/g, '\n\n')
    // Normalize quotes to prevent JSON escaping issues
    .replace(/[\u2018\u2019]/g, "'") // Smart single quotes
    .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
    .trim();
}