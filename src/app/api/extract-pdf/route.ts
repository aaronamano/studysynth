import { NextRequest, NextResponse } from 'next/server';
import { extractPdfContent, cleanExtractedText } from '@/lib/pdf-extraction';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json({ error: 'PDF file too large (max 5MB)' }, { status: 400 });
    }
    
    const arrayBuffer = await file.arrayBuffer();
    
    const extracted = await extractPdfContent(arrayBuffer);
    const cleanedText = cleanExtractedText(extracted.text);
    
    return NextResponse.json({
      success: true,
      content: cleanedText,
      pages: extracted.pages,
      info: extracted.info
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract PDF content';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}