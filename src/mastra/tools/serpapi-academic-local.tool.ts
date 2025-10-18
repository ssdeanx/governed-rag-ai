/**
 * SerpAPI Academic and Local Search Tools
 *
 * Provides Google Scholar, Google Finance, and Yelp search tools.
 *
 * @module serpapi-academic-local-tool
 */

import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { getJson } from 'serpapi'
import { log } from '../config/logger'
import { AISpanType } from '@mastra/core/ai-tracing'
import { validateSerpApiKey } from './serpapi-config'

// Google Scholar Tool
const googleScholarInputSchema = z.object({
    query: z.string().min(1).describe('Academic search query'),
    yearStart: z.number().int().min(1900).optional().describe('Start year for filtering papers'),
    yearEnd: z.number().int().max(new Date().getFullYear()).optional().describe('End year for filtering papers'),
    sortBy: z.enum(['relevance', 'date']).default('relevance').describe('Sort order'),
    includePatents: z.boolean().default(false).describe('Include patents in results'),
    includeCitations: z.boolean().default(true).describe('Include citation count'),
    numResults: z.number().int().min(1).max(20).default(10).describe('Number of results'),
})

const googleScholarOutputSchema = z.object({
    papers: z.array(
        z.object({
            title: z.string(),
            link: z.string().url(),
            authors: z.string().optional(),
            publication: z.string().optional(),
            year: z.string().optional(),
            citedBy: z.number().optional(),
            relatedArticles: z.string().url().optional(),
            snippet: z.string().optional(),
            pdfLink: z.string().url().optional(),
        })
    ),
})

export const googleScholarTool = createTool({
    id: 'googlescholar',
    description:
        'Search Google Scholar for academic papers and citations. Filter by year range, include/exclude patents, and sort by relevance or date. Returns paper title, authors, publication, year, citation count, and PDF links when available. Useful for research and finding academic sources.',
    inputSchema: googleScholarInputSchema,
    outputSchema: googleScholarOutputSchema,
    execute: async ({ context, tracingContext }) => {
        validateSerpApiKey()

        const scholarSpan = tracingContext?.currentSpan?.createChildSpan({
            type: AISpanType.TOOL_CALL,
            name: 'google-scholar-tool',
            input: { query: context.query, yearRange: `${context.yearStart}-${context.yearEnd}` },
        })

        log.info('Executing Google Scholar search', { query: context.query })

        try {
            const params: Record<string, string | number> = {
                engine: 'google_scholar',
                q: context.query,
                num: context.numResults,
            }

            if (typeof context.yearStart === 'number' && typeof context.yearEnd === 'number') {
                params.as_ylo = context.yearStart
                params.as_yhi = context.yearEnd
            }

            if (context.sortBy === 'date') {
                params.scisbd = '1'
            }

            if (!context.includePatents) {
                params.as_sdt = '0,5'
            }

            const response = await getJson(params)

            const papers =
                response.organic_results?.map(
                    (paper: {
                        title: string
                        link: string
                        publication_info?: { authors?: string; summary?: string }
                        inline_links?: { cited_by?: { total?: number; link?: string }; related_pages_link?: string }
                        snippet?: string
                        resources?: Array<{ link?: string; file_format?: string }>
                    }) => ({
                        title: paper.title,
                        link: paper.link,
                        authors: paper.publication_info?.authors,
                        publication: paper.publication_info?.summary,
                        year: paper.publication_info?.summary?.match(/\d{4}/)?.[0],
                        citedBy: paper.inline_links?.cited_by?.total,
                        relatedArticles: paper.inline_links?.related_pages_link,
                        snippet: paper.snippet,
                        pdfLink: paper.resources?.find((r: { file_format?: string }) => r.file_format === 'PDF')?.link,
                    })
                ) ?? []

            const result = { papers }

            scholarSpan?.end({ output: { paperCount: papers.length } })
            log.info('Google Scholar search completed', { query: context.query, paperCount: papers.length })

            return result
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            scholarSpan?.end({ metadata: { error: errorMessage } })
            log.error('Google Scholar search failed', { query: context.query, error: errorMessage })
            throw new Error(`Google Scholar search failed: ${errorMessage}`)
        }
    },
})

// Google Finance Tool
const googleFinanceInputSchema = z.object({
    query: z.string().min(1).describe('Stock symbol or company name (e.g., "AAPL", "Apple")'),
    exchange: z.string().optional().describe('Stock exchange (e.g., "NASDAQ", "NYSE")'),
})

const googleFinanceOutputSchema = z.object({
    symbol: z.string(),
    price: z.number().optional(),
    change: z.number().optional(),
    changePercent: z.number().optional(),
    marketCap: z.string().optional(),
    volume: z.string().optional(),
    high: z.number().optional(),
    low: z.number().optional(),
    open: z.number().optional(),
    previousClose: z.number().optional(),
    news: z.array(
        z.object({
            title: z.string(),
            link: z.string().url(),
            source: z.string(),
            date: z.string(),
        })
    ).optional(),
})

export const googleFinanceTool = createTool({
    id: 'google-finance',
    description:
        'Get stock quotes and financial data from Google Finance. Returns current price, change, market cap, volume, high/low, and recent financial news. Use for real-time stock information and market data.',
    inputSchema: googleFinanceInputSchema,
    outputSchema: googleFinanceOutputSchema,
    execute: async ({ context, tracingContext }) => {
        validateSerpApiKey()

        const financeSpan = tracingContext?.currentSpan?.createChildSpan({
            type: AISpanType.TOOL_CALL,
            name: 'google-finance-tool',
            input: { query: context.query },
        })

        log.info('Executing Google Finance search', { query: context.query })

        try {
            const params: Record<string, string> = {
                engine: 'google_finance',
                q: context.query,
            }

            if (typeof context.exchange === 'string' && context.exchange.length > 0) {
                params.exchange = context.exchange
            }

            const response = await getJson(params)

            const summary = response.summary
            const news = response.news?.map(
                (article: { title: string; link: string; source: string; date: string }) => ({
                    title: article.title,
                    link: article.link,
                    source: article.source,
                    date: article.date,
                })
            )

            const result = {
                symbol: summary?.stock ?? context.query,
                price: summary?.price?.value,
                change: summary?.price?.change,
                changePercent: summary?.price?.change_percentage,
                marketCap: summary?.market_cap,
                volume: summary?.volume,
                high: summary?.high,
                low: summary?.low,
                open: summary?.open,
                previousClose: summary?.previous_close,
                news,
            }

            financeSpan?.end({ output: result })
            log.info('Google Finance search completed', { query: context.query, symbol: result.symbol })

            return result
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            financeSpan?.end({ metadata: { error: errorMessage } })
            log.error('Google Finance search failed', { query: context.query, error: errorMessage })
            throw new Error(`Google Finance search failed: ${errorMessage}`)
        }
    },
})

// Yelp Search Tool
const yelpSearchInputSchema = z.object({
    query: z.string().min(1).describe('Business type or name (e.g., "pizza", "Starbucks")'),
    location: z.string().min(1).describe('City, address, or location (required)'),
    sortBy: z.enum(['recommended', 'rating', 'review_count']).default('recommended').describe('Sort order'),
    priceRange: z.enum(['$', '$$', '$$$', '$$$$']).optional().describe('Price range filter'),
    openNow: z.boolean().default(false).describe('Show only businesses open now'),
    numResults: z.number().int().min(1).max(20).default(10).describe('Number of results'),
})

const yelpSearchOutputSchema = z.object({
    businesses: z.array(
        z.object({
            name: z.string(),
            rating: z.number().optional(),
            reviewCount: z.number().optional(),
            priceRange: z.string().optional(),
            categories: z.array(z.string()).optional(),
            address: z.string().optional(),
            phone: z.string().optional(),
            link: z.string().url().optional(),
            hours: z.string().optional(),
            photos: z.array(z.string().url()).optional(),
        })
    ),
})

export const yelpSearchTool = createTool({
    id: 'yelp-search',
    description:
        'Search Yelp for local businesses and reviews. Requires location parameter. Filter by price range, open now status, and sort by recommended, rating, or review count. Returns business name, rating, reviews, address, phone, hours, and photos. Best for finding local services and restaurants.',
    inputSchema: yelpSearchInputSchema,
    outputSchema: yelpSearchOutputSchema,
    execute: async ({ context, tracingContext }) => {
        validateSerpApiKey()

        const yelpSpan = tracingContext?.currentSpan?.createChildSpan({
            type: AISpanType.TOOL_CALL,
            name: 'yelp-search-tool',
            input: { query: context.query, location: context.location },
        })

        log.info('Executing Yelp search', { query: context.query, location: context.location })

        try {
            const params: Record<string, string | number | boolean> = {
                engine: 'yelp',
                find_desc: context.query,
                find_loc: context.location,
                num: context.numResults,
            }

            if (context.sortBy !== 'recommended') {
                params.sortby = context.sortBy
            }

            if (context.priceRange) {
                params.price = context.priceRange
            }

            if (context.openNow) {
                params.open_now = 'true'
            }

            const response = await getJson(params)

            const businesses =
                response.organic_results?.map(
                    (business: {
                        title: string
                        rating?: number
                        reviews?: number
                        price?: string
                        categories?: string[]
                        address?: string
                        phone?: string
                        link?: string
                        hours?: string
                        thumbnail?: string
                        photos?: string[]
                    }) => ({
                        name: business.title,
                        rating: business.rating,
                        reviewCount: business.reviews,
                        priceRange: business.price,
                        categories: business.categories,
                        address: business.address,
                        phone: business.phone,
                        link: business.link,
                        hours: business.hours,
                        photos: business.photos ?? (typeof business.thumbnail === 'string' && business.thumbnail.length > 0 ? [business.thumbnail] : undefined),
                    })
                ) ?? []

            const result = { businesses }

            yelpSpan?.end({ output: { businessCount: businesses.length } })
            log.info('Yelp search completed', {
                query: context.query,
                location: context.location,
                businessCount: businesses.length,
            })

            return result
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            yelpSpan?.end({ metadata: { error: errorMessage } })
            log.error('Yelp search failed', { query: context.query, location: context.location, error: errorMessage })
            throw new Error(`Yelp search failed: ${errorMessage}`)
        }
    },
})
