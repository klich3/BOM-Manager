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
import { joinURL } from 'ufo';



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

        // Extract main image URL from og:image meta tag
        let mainImageUrl = '';
        const ogImage = $('meta[property="og:image"], meta[name="og:image"]').attr('content');
        if (ogImage) {
            mainImageUrl = ogImage;
        }

        // If we found a main image, try to generate variant URLs
        const imageUrls: string[] = [];

        if (mainImageUrl) {
            // Add the main image
            imageUrls.push(mainImageUrl);

            // Extract base name from the main image URL to generate variants
            const urlParts = mainImageUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const fileNameParts = fileName.split('.');
            if (fileNameParts.length >= 2) {
                const baseName = fileNameParts[0]; // e.g., "CRCW0402200RFKEDHP_C313368_front"
                const extension = fileNameParts[fileNameParts.length - 1]; // e.g., "jpg"

                // Extract the base part without the variant (front/back/blank)
                const variantRegex = /(.+?)_(front|back|blank)$/;
                const match = baseName.match(variantRegex);

                if (match) {
                    const basePart = match[1]; // e.g., "CRCW0402200RFKEDHP_C313368"

                    // Generate URLs for all possible variants
                    ['front', 'back', 'blank'].forEach(variant => {
                        const variantUrl = mainImageUrl.replace(`${basePart}_front`, `${basePart}_${variant}`);
                        if (!imageUrls.includes(variantUrl)) {
                            imageUrls.push(variantUrl);
                        }
                    });
                }
            }
        }

        // Return up to 3 unique image URLs
        const unique = imageUrls.slice(0, 3);

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
