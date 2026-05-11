import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { runPipeline } from './pipeline.js';

dotenv.config();

const app = express();

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:4173',          // vite preview
    process.env.FRONTEND_URL,         // set this on Render dashboard
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

app.get('/api/build', async (req, res) => {

    const { prompt } = req.query;

    if (!prompt) {
        return res.status(400).json({
            error: 'prompt required'
        });
    }

    res.setHeader(
        'Content-Type',
        'text/event-stream'
    );

    res.setHeader(
        'Cache-Control',
        'no-cache'
    );

    res.setHeader(
        'Connection',
        'keep-alive'
    );

    res.flushHeaders();

    const emit = (stage, data) => {
        res.write(
            `event: ${stage}\ndata: ${JSON.stringify(data)}\n\n`
        );
    };

    try {

        await runPipeline(prompt, emit);

        emit('done', {
            success: true
        });

    } catch (e) {

        emit('error', {
            message: String(e)
        });

    } finally {

        res.end();

    }
});
import path from 'path';

app.get(
    '/api/download/:filename',
    (req, res) => {

        const filePath = path.join(
            process.cwd(),
            'generated',
            'agents',
            req.params.filename
        );

        res.download(filePath);
    }
);
app.get(
    '/api/package/:filename',
    (req, res) => {

        const filePath = path.join(
            process.cwd(),
            'generated',
            'packages',
            req.params.filename
        );

        res.download(filePath);
    }
);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Backend on :${PORT}`);
});