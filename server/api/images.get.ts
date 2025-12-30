/*
█▀ █▄█ █▀▀ █░█ █▀▀ █░█
▄█ ░█░ █▄▄ █▀█ ██▄ ▀▄▀

Author: <Anton Sychev> (anton at sychev dot xyz)
image.get.ts (c) 2025
Created:  2025-12-31 05:14:35 
Desc: get images from pages
Docs: documentation
*/

import { getQuery, createError, defineEventHandler } from 'h3';
import type { H3Event } from 'h3';
import * as cheerio from 'cheerio';

/**
 * Extracts background image URL from CSS style string
 */
function extractBgUrl(style: string): string | null {
    if (!style) return null;

    // Handle HTML entities like &quot; etc.
    style = style.replace(/&quot;/g, '"').replace(/&#34;/g, '"');

    // Extract URL from background-image: url("...") / url('...') / url(...)
    const match = style.match(/background-image\s*:\s*url\(\s*(['"]?)(.*?)\1\s*\)/i);
    return match?.[2] ?? null;
}

/**
 * API route to extract images from a given URL
 * Usage: /api/images?url=your-url-here
 */
export default defineEventHandler(async (event: H3Event) => {
    const query = getQuery(event);
    const url = (query.url as string) || '';

    if (!url) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing ?url parameter',
        });
    }

    try {
        // Validate URL format
        new URL(url);

        // Fetch HTML content from the provided URL
        const html = await $fetch<string>(url, {
            method: 'GET',
            headers: {
                'user-agent':
                    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36',
                'accept': 'text/html,application/xhtml+xml',
            },
            timeout: 10000, // 10 second timeout
        });

        const $ = cheerio.load(html);

        // Extract image URLs from elements with specific classes
        const urls = $('.v-image__image.v-image__image--contain')
            .map((_, el) => extractBgUrl($(el).attr('style') || ''))
            .get()
            .filter(Boolean) as string[];

        // Return up to 3 unique image URLs
        const unique = [...new Set(urls)].slice(0, 3);

        return {
            count: unique.length,
            images: unique,
        };
    } catch (error: any) {
        if (error.status) {
            // If it's an HTTP error from $fetch
            throw createError({
                statusCode: error.status,
                statusMessage: `Failed to fetch URL: ${error.message}`,
            });
        } else if (error instanceof TypeError && error.message.includes('Invalid URL')) {
            // URL validation error
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid URL format',
            });
        } else {
            // General error
            throw createError({
                statusCode: 500,
                statusMessage: `Internal server error: ${error.message}`,
            });
        }
    }
});
