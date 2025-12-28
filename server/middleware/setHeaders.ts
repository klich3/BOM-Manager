import { defineEventHandler } from 'h3';

export default defineEventHandler((event: any) => {
    event.node.res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    event.node.res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
});