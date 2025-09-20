import { mastra } from '@/src/mastra';
import fs from 'fs';
import path from 'path';
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { log } from '@/src/mastra/config/logger';

const STATUS_VALUE = 500;
export const maxDuration = 300; // 5 minutes for indexing
export const dynamic = 'force-dynamic';

/**
 * Indexes Markdown documents from the local corpus folder by invoking the governed RAG indexing workflow.
 *
 * Reads *.md files from the project's "corpus" directory, infers per-document classification and allowed roles from filenames
 * (public, internal, confidential with role mappings), and submits the resulting document descriptors to the
 * "governed-rag-index" workflow. Returns a JSON response containing counts and per-document results on success,
 * or an error object on failure.
 *
 * Behavior summary:
 * - If no Markdown files are found, responds with a 500 and { error: 'No documents found to index' }.
 * - If the workflow completes with status "success", responds with { success: true, indexed, failed, documents }.
 * - If the workflow fails or is missing, responds with 500 and { error: <message> }.
 * - On unexpected exceptions, responds with 500 and { error: 'Internal server error', message: <error message> }.
 *
 * @returns A NextResponse with a JSON body describing success or error details and an appropriate HTTP status.
 */
export async function POST(request: NextRequest) {
  try {
    const { jwt } = await request.json();

    // JWT is optional for indexing - we can index documents without authentication
    log.info('Starting document indexing...');

    // Define default documents to index from the corpus folder
    const corpusPath: string = path.join(process.cwd(), 'corpus');
    const corpusFiles = fs.readdirSync(corpusPath);

    const documents = corpusFiles
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const fileName = file.replace('.md', '');

        // Set classification and roles based on filename with hierarchical access
        let classification: "public" | "internal" | "confidential" = "public";
        let allowedRoles: string[] = ["employee"];

        if (fileName.includes('confidential') || fileName.includes('hr')) {
          classification = "confidential";
          allowedRoles = ["hr.admin"];  // HR confidential: only hr.admin access
        } else if (fileName.includes('finance') || fileName.includes('policy')) {
          classification = "internal";
          allowedRoles = ["finance.viewer", "finance.admin", "employee"];  // Include employee access
        } else if (fileName.includes('engineering')) {
          classification = "internal";
          allowedRoles = ["engineering.admin", "engineering.viewer", "employee"];  // Include employee access
        }

        return {
          filePath: path.join(corpusPath, file),
          docId: fileName,
          classification,
          allowedRoles,
          tenant: "acme",
          source: "corpus"
        };
      });

    if (documents.length === 0) {
      return NextResponse.json(
        { error: 'No documents found to index' },
        { status: STATUS_VALUE }
      );
    }

    log.info(`Starting indexing of ${documents.length} documents`, {
      documents: documents.map(d => ({
        docId: d.docId,
        classification: d.classification,
        allowedRoles: d.allowedRoles
      }))
    });

    // Get the indexing workflow
    const workflow = mastra.getWorkflows()['governed-rag-index'];
    if (workflow === undefined) {
      throw new Error('Indexing workflow not found');
    }
    const run = await workflow.createRunAsync();
    const result = await run.start({
      inputData: { documents }
    });

    log.info('Workflow result', { result });

    if (result.status === 'success') {
      log.info(`Indexing completed: ${result.result.indexed} indexed, ${result.result.failed} failed`);

      // Log individual document results for debugging
      if (result.result.documents) {
        result.result.documents.forEach((doc: any) => {
          if (doc.status === 'failed' && (Boolean(doc.error))) {
            log.error(`Document ${doc.docId} failed`, { error: doc.error });
          }
        });
      }

      return NextResponse.json({
        success: true,
        indexed: result.result.indexed,
        failed: result.result.failed,
        documents: result.result.documents
      });
    } else {
      const errorMessage = result.status === 'failed' && 'error' in result
        ? result.error?.message || 'Indexing workflow failed'
        : 'Indexing workflow failed';
      log.error('Workflow failed', { error: errorMessage });
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    log.error('Indexing API error', { error });
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
