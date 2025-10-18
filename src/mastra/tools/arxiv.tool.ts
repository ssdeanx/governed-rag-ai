import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * ArXiv Tool
 *
 * Provides access to academic papers from arXiv.org including:
 * - Search papers by keywords, authors, categories
 * - Retrieve paper metadata and abstracts
 * - Get full paper information including PDF links
 * - Browse papers by category and date
 * - Download and parse PDF content to markdown
 *
 * No API key required - uses arXiv's public API
 */

// Lazy-loaded pdf-parse to avoid demo parsing errors
let pdfParse: unknown = null
let pdfParseError: Error | null = null

type PdfParseFunction = (buffer: Buffer, options?: { max?: number; version?: string }) => Promise<{
	text: string;
	numpages: number;
	metadata?: unknown;
	info?: unknown;
	producedBy?: string;
	creationDate?: unknown;
	modificationDate?: unknown;
}>;

/**
 * Safely load pdf-parse with error handling
 * Must be called at runtime, not at module load time
 */
async function getPdfParseModule(): Promise<PdfParseFunction> {
	if (pdfParse !== null) {
		return pdfParse as PdfParseFunction
	}
	if (pdfParseError) {
		throw pdfParseError
	}

	try {
		// Dynamic import to avoid parsing demo content on import
		const pdfMod = await eval('import("pdf-parse")');
		pdfParse = pdfMod.default;
		return pdfParse as PdfParseFunction;
	} catch (error) {
		const err =
			error instanceof Error
				? error
				: new Error('Failed to load pdf-parse module')
		pdfParseError = err
		throw new Error(
			'pdf-parse module not available. Install with: npm install pdf-parse'
		)
	}
}

/**
 * Extract text content from PDF buffer
 */
async function extractPdfText(pdfBuffer: Buffer, maxPages = 1000): Promise<{
	text: string;
	numpages: number;
	metadata?: Record<string, unknown>;
}> {
	try {
		const pdfModule = await getPdfParseModule()
		const data = await pdfModule(pdfBuffer, {
			max: maxPages,
			version: 'v2.0.550',
		})

		return {
			text: data.text ?? '',
			numpages: data.numpages ?? 1,
			metadata: (data.metadata as Record<string, unknown>) ?? (data.info as Record<string, unknown>),
		}
	} catch (error) {
		throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
	}
}

/**
 * Convert extracted PDF text to markdown format
 */
function convertPdfTextToMarkdown(text: string, metadata?: { title?: string; authors?: string[] }): string {
	let markdown = text

	// Basic text normalization
	markdown = markdown
		.replace(/\f/g, '\n\n') // Form feeds to double newlines
		.replace(/\r\n/g, '\n') // Normalize line endings
		.replace(/\n\n\n+/g, '\n\n') // Multiple newlines to double
		.replace(/\t/g, '  ') // Tabs to spaces
		.replace(/(\w+)-\n(\w+)/g, '$1$2') // Fix hyphenated words
		.replace(/\s+([.,!?;:])/g, '$1') // Clean punctuation spacing
		.trim()

	// Add frontmatter if metadata available
	if (((metadata?.title) !== null) || metadata?.authors) {
		const frontmatter = [
			'---',
			(metadata?.title && metadata.title.trim() !== '') ? `title: "${metadata.title.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` : null,
			metadata?.authors ? `authors: ${JSON.stringify(metadata.authors)}` : null,
			'source: "arxiv-pdf"',
			'extracted_at: "' + new Date().toISOString() + '"',
			'---',
			''
		].filter(Boolean).join('\n')

		markdown = frontmatter + markdown
	}

	return markdown
}

export const arxivTool = createTool({
  id: "arxiv",
  description: "Search and retrieve academic papers from arXiv.org including metadata, abstracts, and download links",
  inputSchema: z.object({
    query: z.string().optional().describe("Search query for papers (keywords, titles, authors)"),
    id: z.string().optional().describe("Specific arXiv paper ID (e.g., '2103.12345' or '2103.12345v1')"),
    author: z.string().optional().describe("Search by author name"),
    title: z.string().optional().describe("Search by paper title"),
    category: z.enum([
      "cs.AI", "cs.CL", "cs.CV", "cs.LG", "cs.NE", "cs.RO",
      "math.AG", "math.AP", "math.CO", "math.CT", "math.DS",
      "physics.optics", "physics.comp-ph", "physics.gen-ph",
      "q-bio.BM", "q-bio.GN", "q-bio.MN", "q-bio.NC", "q-bio.OT", "q-bio.PE", "q-bio.QM",
      "stat.AP", "stat.CO", "stat.ME", "stat.ML", "stat.TH",
      "astro-ph.CO", "astro-ph.EP", "astro-ph.GA", "astro-ph.HE", "astro-ph.IM", "astro-ph.SR",
      "cond-mat.dis-nn", "cond-mat.mes-hall", "cond-mat.mtrl-sci", "cond-mat.other", "cond-mat.quant-gas", "cond-mat.soft", "cond-mat.stat-mech", "cond-mat.str-el", "cond-mat.supr-con",
      "hep-ex", "hep-lat", "hep-ph", "hep-th",
      "nucl-ex", "nucl-th",
      "quant-ph"
    ]).optional().describe("ArXiv category/subject area"),
    max_results: z.number().min(1).max(100).optional().default(10).describe("Maximum number of results to return (1-100)"),
    sort_by: z.enum(["relevance", "lastUpdatedDate", "submittedDate"]).optional().default("relevance").describe("Sort results by criteria"),
    sort_order: z.enum(["ascending", "descending"]).optional().default("descending").describe("Sort order"),
    start: z.number().min(0).optional().default(0).describe("Starting index for results (0-based)"),
    include_abstract: z.boolean().optional().default(true).describe("Whether to include paper abstracts in results")
  }),
  outputSchema: z.object({
    papers: z.array(z.object({
      id: z.string(),
      title: z.string(),
      authors: z.array(z.string()),
      abstract: z.string().optional(),
      categories: z.array(z.string()),
      published: z.string(),
      updated: z.string().optional(),
      pdf_url: z.string(),
      doi: z.string().optional(),
      journal_ref: z.string().optional(),
      comments: z.string().optional()
    })),
    total_results: z.number(),
    start_index: z.number(),
    max_results: z.number(),
    error: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const params = new URLSearchParams();

      // Build search query
      const searchTerms: string[] = [];

      if (context.query !== undefined && context.query !== null) {
        searchTerms.push(context.query);
      }

      if (context.author !== undefined && context.author !== null) {
        searchTerms.push(`au:${context.author}`);
      }

      if (context.title !== undefined && context.title !== null) {
        searchTerms.push(`ti:${context.title}`);
      }

      if (context.category !== undefined) {
        searchTerms.push(`cat:${context.category}`);
      }

      if (context.id !== undefined && context.id !== null) {
        // If specific ID is provided, use it directly
        params.append("id_list", context.id);
      } else if (searchTerms.length > 0) {
        params.append("search_query", searchTerms.join(" AND "));
      } else {
        return {
          papers: [],
          total_results: 0,
          start_index: 0,
          max_results: context.max_results ?? 10,
          error: "Either query, id, author, title, or category must be provided"
        };
      }

      // Add other parameters
      params.append("max_results", String(context.max_results ?? 10));
      params.append("start", String(context.start ?? 0));

      if (context.sort_by !== undefined) {
        params.append("sortBy", context.sort_by === "lastUpdatedDate" ? "lastUpdatedDate" :
                             context.sort_by === "submittedDate" ? "submittedDate" : "relevance");
      }

      if (context.sort_order !== undefined) {
        params.append("sortOrder", context.sort_order);
      }

      const url = `http://export.arxiv.org/api/query?${params.toString()}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`ArXiv API error: ${response.status} ${response.statusText}`);
      }

      const xmlText = await response.text();

      // Parse XML response (simplified parsing - in production you might want a proper XML parser)
      const papers = parseArxivXml(xmlText, Boolean(context.include_abstract));

      // Extract total results from XML
      const totalResultsRegex = /<opensearch:totalResults>(\d+)<\/opensearch:totalResults>/;
      const totalResultsMatch = totalResultsRegex.exec(xmlText);
      const totalResults = totalResultsMatch ? parseInt(totalResultsMatch[1], 10) : papers.length;

      const startIndexRegex = /<opensearch:startIndex>(\d+)<\/opensearch:startIndex>/;
      const startIndexMatch = startIndexRegex.exec(xmlText);
      const startIndex = startIndexMatch ? parseInt(startIndexMatch[1], 10) : (context.start ?? 0);

      return {
        papers,
        total_results: totalResults,
        start_index: startIndex,
        max_results: context.max_results ?? 10
      };

    } catch (error) {
      return {
        papers: [],
        total_results: 0,
        start_index: 0,
        max_results: context.max_results ?? 10,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
});

/**
 * ArXiv PDF Parser Tool
 *
 * Downloads and parses arXiv PDF papers to markdown format
 * Requires pdf-parse module to be installed
 */

export const arxivPdfParserTool = createTool({
  id: "arxiv-pdf-parser",
  description: "Download and parse arXiv PDF papers to markdown format with lazy-loaded pdf-parse",
  inputSchema: z.object({
    arxivId: z.string().describe("ArXiv paper ID (e.g., '2103.12345' or '2103.12345v1')"),
    maxPages: z.number().min(1).max(1000).optional().default(100).describe("Maximum number of pages to parse (default: 100)"),
    includeMetadata: z.boolean().optional().default(true).describe("Include paper metadata in markdown frontmatter"),
    normalizeText: z.boolean().optional().default(true).describe("Apply text normalization and cleanup")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    arxivId: z.string(),
    markdown: z.string(),
    metadata: z.object({
      title: z.string().optional(),
      authors: z.array(z.string()).optional(),
      pageCount: z.number(),
      extractedAt: z.string()
    }).optional(),
    statistics: z.object({
      pageCount: z.number(),
      textLength: z.number(),
      processingTimeMs: z.number()
    }),
    error: z.string().optional()
  }),
  execute: async ({ context }) => {
    const startTime = Date.now();

    try {
      // Construct PDF URL
      const pdfUrl = `https://arxiv.org/pdf/${context.arxivId}`;

      // Download PDF
      const response = await fetch(pdfUrl);

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            arxivId: context.arxivId,
            markdown: "",
            statistics: {
              pageCount: 0,
              textLength: 0,
              processingTimeMs: Date.now() - startTime
            },
            error: `Paper not found: ${context.arxivId}`
          };
        }
        throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`);
      }

      const pdfBuffer = Buffer.from(await response.arrayBuffer());

      // Extract text from PDF
      const pdfContent = await extractPdfText(pdfBuffer, context.maxPages ?? 100);

      // Try to get metadata from arXiv API
      let paperMetadata: { title?: string; authors?: string[] } | undefined;
      if (context.includeMetadata) {
        try {
          const apiUrl = `http://export.arxiv.org/api/query?id_list=${context.arxivId}&max_results=1`;
          const apiResponse = await fetch(apiUrl);

          if (apiResponse.ok) {
            const xmlText = await apiResponse.text();
            const titleRegex = /<title>(.*?)<\/title>/;
            const titleMatch = titleRegex.exec(xmlText);
            const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : undefined;

            const authors: string[] = [];
            const authorRegex = /<author><name>(.*?)<\/name><\/author>/g;
            let authorMatch;
            while ((authorMatch = authorRegex.exec(xmlText)) !== null) {
              authors.push(authorMatch[1]);
            }

            if ((title !== undefined && title !== null && title.length > 0) || authors.length > 0) {
              paperMetadata = { title, authors: authors.length > 0 ? authors : undefined };
            }
          }
        } catch {
          // Metadata fetch failed, continue without it
        }
      }

      // Convert to markdown
      let markdown = pdfContent.text;

      if (context.normalizeText) {
        markdown = convertPdfTextToMarkdown(markdown, paperMetadata);
      } else if (paperMetadata && context.includeMetadata) {
        // Add basic frontmatter even without normalization
        const frontmatter = [
          '---',
          (paperMetadata.title && paperMetadata.title.trim() !== '') ? `title: "${paperMetadata.title.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` : null,
          paperMetadata.authors ? `authors: ${JSON.stringify(paperMetadata.authors)}` : null,
          'source: "arxiv-pdf"',
          'extracted_at: "' + new Date().toISOString() + '"',
          '---',
          ''
        ].filter(Boolean).join('\n');

        markdown = frontmatter + markdown;
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        arxivId: context.arxivId,
        markdown,
        metadata: context.includeMetadata ? {
          title: paperMetadata?.title,
          authors: paperMetadata?.authors,
          pageCount: pdfContent.numpages,
          extractedAt: new Date().toISOString()
        } : undefined,
        statistics: {
          pageCount: pdfContent.numpages,
          textLength: markdown.length,
          processingTimeMs: processingTime
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

      return {
        success: false,
        arxivId: context.arxivId,
        markdown: "",
        statistics: {
          pageCount: 0,
          textLength: 0,
          processingTimeMs: processingTime
        },
        error: errorMessage
      };
    }
  }
});

/**
 * ArXiv Paper Downloader Tool
 *
 * Downloads arXiv papers and provides both metadata and PDF content
 */

export const arxivPaperDownloaderTool = createTool({
  id: "arxiv-paper-downloader",
  description: "Download complete arXiv papers with metadata and optional PDF parsing to markdown",
  inputSchema: z.object({
    arxivId: z.string().describe("ArXiv paper ID (e.g., '2103.12345' or '2103.12345v1')"),
    includePdfContent: z.boolean().optional().default(false).describe("Whether to download and parse the PDF content"),
    maxPages: z.number().min(1).max(1000).optional().default(100).describe("Maximum pages to parse if includePdfContent is true"),
    format: z.enum(["metadata", "markdown", "both"]).optional().default("both").describe("Output format: metadata only, markdown only, or both")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    arxivId: z.string(),
    metadata: z.object({
      id: z.string(),
      title: z.string(),
      authors: z.array(z.string()),
      abstract: z.string().optional(),
      categories: z.array(z.string()),
      published: z.string(),
      updated: z.string().optional(),
      pdf_url: z.string(),
      doi: z.string().optional(),
      journal_ref: z.string().optional(),
      comments: z.string().optional()
    }).optional(),
    pdfContent: z.object({
      markdown: z.string(),
      pageCount: z.number(),
      textLength: z.number()
    }).optional(),
    error: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      // Get metadata from arXiv API
      const apiUrl = `http://export.arxiv.org/api/query?id_list=${context.arxivId}&max_results=1`;
      const apiResponse = await fetch(apiUrl);

      if (!apiResponse.ok) {
        throw new Error(`Failed to fetch paper metadata: ${apiResponse.status} ${apiResponse.statusText}`);
      }

      const xmlText = await apiResponse.text();

      const papers = parseArxivXml(xmlText, true);

      if (papers?.length === 0) {
        return {
          success: false,
          arxivId: context.arxivId,
          error: `Paper not found: ${context.arxivId}`
        };
      }

      const paperMetadata = papers[0];

      let pdfContent: { markdown: string; pageCount: number; textLength: number } | undefined;

      // Download and parse PDF if requested
      if (context.includePdfContent) {
        try {
          const pdfResponse = await fetch(paperMetadata.pdf_url);

          if (pdfResponse.ok) {
            const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
            const extracted = await extractPdfText(pdfBuffer, context.maxPages ?? 100);

            const markdown = convertPdfTextToMarkdown(extracted.text, {
              title: paperMetadata.title,
              authors: paperMetadata.authors
            });

            pdfContent = {
              markdown,
              pageCount: extracted.numpages,
              textLength: markdown.length
            };
          } else {
            // PDF download failed, continue without it
          }
        } catch {
          // PDF parsing failed, continue without it
        }
      }

      // Return based on requested format
      const result: {
        success: boolean;
        arxivId: string;
        metadata?: typeof paperMetadata;
        pdfContent?: { markdown: string; pageCount: number; textLength: number };
        error?: string;
      } = {
        success: true,
        arxivId: context.arxivId
      };

      if (context.format === "metadata" || context.format === "both") {
        result.metadata = paperMetadata;
      }

      if ((context.format === "markdown" || context.format === "both") && pdfContent) {
        result.pdfContent = pdfContent;
      }

      return result;

    } catch (error) {
      return {
        success: false,
        arxivId: context.arxivId,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
});

/**
 * Simple XML parser for ArXiv API response
 * In production, consider using a proper XML parsing library
 */
function parseArxivXml(xmlText: string, includeAbstract: boolean): Array<{
  id: string;
  title: string;
  authors: string[];
  abstract?: string;
  categories: string[];
  published: string;
  updated?: string;
  pdf_url: string;
  doi?: string;
  journal_ref?: string;
  comments?: string;
}> {
  const papers: Array<{
    id: string;
    title: string;
    authors: string[];
    abstract?: string;
    categories: string[];
    published: string;
    updated?: string;
    pdf_url: string;
    doi?: string;
    journal_ref?: string;
    comments?: string;
  }> = [];

  // Split by entry tags
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xmlText)) !== null) {
    const entryXml = match[1];

    // Extract fields using regex
    const idRegex = /<id>(.*?)<\/id>/;
    const idMatch = idRegex.exec(entryXml);

    const titleRegex = /<title>(.*?)<\/title>/;
    const titleMatch = titleRegex.exec(entryXml);

    const publishedRegex = /<published>(.*?)<\/published>/;
    const publishedMatch = publishedRegex.exec(entryXml);

    const updatedRegex = /<updated>(.*?)<\/updated>/;
    const updatedMatch = updatedRegex.exec(entryXml);

    const summaryRegex = /<summary>(.*?)<\/summary>/;
    const summaryMatch = summaryRegex.exec(entryXml);

    const doiRegex = /<arxiv:doi>(.*?)<\/arxiv:doi>/;
    const doiMatch = doiRegex.exec(entryXml);

    const journalRefRegex = /<arxiv:journal_ref>(.*?)<\/arxiv:journal_ref>/;
    const journalRefMatch = journalRefRegex.exec(entryXml);

    const commentsRegex = /<arxiv:comment>(.*?)<\/arxiv:comment>/;
    const commentsMatch = commentsRegex.exec(entryXml);

    if (!idMatch || !titleMatch || !publishedMatch) {
      continue; // Skip malformed entries
    }

    // Extract authors
    const authors: string[] = [];
    const authorRegex = /<author><name>(.*?)<\/name><\/author>/g;
    let authorMatch;
    while ((authorMatch = authorRegex.exec(entryXml)) !== null) {
      authors.push(authorMatch[1]);
    }

    // Extract categories
    const categories: string[] = [];
    const categoryRegex = /<category term="(.*?)"[^>]*\/>/g;
    let categoryMatch;
    while ((categoryMatch = categoryRegex.exec(entryXml)) !== null) {
      categories.push(categoryMatch[1]);
    }

    // Generate PDF URL from ID
    const arxivId = idMatch[1].split('/').pop() ?? '';

    papers.push({
      id: arxivId,
      title: titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
      authors,
      abstract: includeAbstract && summaryMatch ? summaryMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : undefined,
      categories,
      published: publishedMatch[1],
      updated: updatedMatch ? updatedMatch[1] : undefined,
      pdf_url: `https://arxiv.org/pdf/${arxivId}`,
      doi: doiMatch ? doiMatch[1] : undefined,
      journal_ref: journalRefMatch ? journalRefMatch[1] : undefined,
      comments: commentsMatch ? commentsMatch[1] : undefined
    });
  }

  return papers;
}
