import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

import { runPipeline } from './pipeline.js';
import {
    ensureDirectories,
    GENERATED_AGENTS_DIR,
    GENERATED_PACKAGES_DIR
} from './utils/paths.js';

dotenv.config();

// Create required runtime directories (generated/agents, generated/packages, cache)
// Critical on Render where these gitignored folders don't exist
ensureDirectories();

const app = express();

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://autoagent-1-ea03.onrender.com',  // deployed frontend
    process.env.FRONTEND_URL,                  // override via Render env var
].filter(Boolean);

app.use(cors({
    origin: (origin, cb) => {
        // Allow requests with no origin (curl, Postman, same-origin)
        if (!origin) return cb(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
        cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true
}));

app.use(express.json());

/* ── SSE BUILD PIPELINE ── */
app.get('/api/build', async (req, res) => {

    const { prompt } = req.query;

    if (!prompt) {
        return res.status(400).json({ error: 'prompt required' });
    }

    res.setHeader('Content-Type',  'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection',    'keep-alive');
    res.flushHeaders();

    const emit = (stage, data) => {
        res.write(`event: ${stage}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
        await runPipeline(prompt, emit);
        emit('done', { success: true });
    } catch (e) {
        emit('error', { message: String(e) });
    } finally {
        res.end();
    }
});

/* ── DOWNLOAD AGENT .PY ── */
app.get('/api/download/:filename', (req, res) => {
    const filePath = path.join(GENERATED_AGENTS_DIR, req.params.filename);
    res.download(filePath);
});

/* ── DOWNLOAD PACKAGE .ZIP ── */
app.get('/api/package/:filename', (req, res) => {
    const filePath = path.join(GENERATED_PACKAGES_DIR, req.params.filename);
    res.download(filePath);
});

/* ── HEALTH CHECK ── */
app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Backend on :${PORT}`);
});