import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const pdfParse = require('pdf-parse/lib/pdf-parse.js')
import mammoth from 'mammoth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { documentId } = await req.json()

    const { data: doc, error: docError } = await supabaseAdmin
  .from('documents')
  .select('*')
  .eq('id', documentId)
  .single()

console.log('documentId received:', documentId)
console.log('doc:', doc)
console.log('docError:', docError)

if (docError || !doc) {
  return NextResponse.json({ error: 'Document not found', debug: docError }, { status: 404 })
}

    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from('thesis-drafts')
      .download(doc.file_path)

    if (fileError || !fileData) {
      return NextResponse.json({ error: 'Could not download file' }, { status: 500 })
    }

    const buffer = Buffer.from(await fileData.arrayBuffer())
console.log('buffer size:', buffer.length)
console.log('first bytes:', buffer.slice(0, 10).toString('hex'))
    let text = ''

    if (doc.file_type === 'application/pdf') {
      const parsed = await pdfParse(buffer)
      text = parsed.text
    } else {
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    }

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length
    const estimatedPages = Math.ceil(wordCount / 300)

    const headingKeywords = ['abstract', 'introduction', 'literature review', 'methodology', 'results', 'discussion', 'conclusion', 'references']
    const lowerText = text.toLowerCase()
    const foundHeadings = headingKeywords.filter((h) => lowerText.includes(h))
    const missingHeadings = headingKeywords.filter((h) => !lowerText.includes(h))

    const report = {
      word_count: wordCount,
      estimated_pages: estimatedPages,
      found_headings: foundHeadings,
      missing_headings: missingHeadings,
    }

    const { error: reportError } = await supabaseAdmin
      .from('reports')
      .insert({
        document_id: documentId,
        word_count: wordCount,
        estimated_pages: estimatedPages,
        found_headings: foundHeadings,
        missing_headings: missingHeadings,
      })

    if (reportError) {
      return NextResponse.json({ error: reportError.message }, { status: 500 })
    }

    return NextResponse.json({ report })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}