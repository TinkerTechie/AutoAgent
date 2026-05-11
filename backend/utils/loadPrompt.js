import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, '..');

export function loadPrompt(relativePath) {
    // Accept both relative (./prompts/foo.txt) and absolute paths
    const fullPath = path.isAbsolute(relativePath)
        ? relativePath
        : path.join(BACKEND_ROOT, relativePath.replace(/^\.\//, ''));
    return fs.readFileSync(fullPath, 'utf8');
}