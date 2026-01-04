/*
API endpoint para descargar archivos remotos y evitar problemas de CORS
*/

import { defineEventHandler, readBody, createError } from 'h3';
import type { H3Event } from 'h3';

export default defineEventHandler(async (event: H3Event) => {
    if (event.method !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed',
        });
    }

    try {
        const body = await readBody(event);
        const { url, filename, type } = body;

        if (!url) {
            throw createError({
                statusCode: 400,
                statusMessage: 'URL is required',
            });
        }

        // Validar que la URL sea de LCSC para seguridad
        try {
            const parsedUrl = new URL(url);
            if (!parsedUrl.hostname.includes('lcsc.com')) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Only LCSC URLs are allowed',
                });
            }
        } catch (urlError) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid URL format',
            });
        }

        // Fetch del archivo remoto
        const response = await fetch(url);

        if (!response.ok) {
            throw createError({
                statusCode: response.status,
                statusMessage: `Failed to fetch file: ${response.statusText}`,
            });
        }

        // Obtener el blob del archivo
        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type });

        // Convertir a base64 para enviar
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        const dataUrl = `data:${type};base64,${base64}`;

        return {
            localUrl: dataUrl,
            filename: filename || 'downloaded-file',
            size: arrayBuffer.byteLength,
        };
    } catch (error: any) {
        console.error('Error in proxy-file endpoint:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Internal server error',
        });
    }
});