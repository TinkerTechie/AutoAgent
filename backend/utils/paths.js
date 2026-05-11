import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Always resolve relative to the backend root, regardless of cwd
const BACKEND_ROOT = path.resolve(__dirname, '..');

export const GENERATED_AGENTS_DIR  = path.join(BACKEND_ROOT, 'generated', 'agents');
export const GENERATED_PACKAGES_DIR = path.join(BACKEND_ROOT, 'generated', 'packages');
export const PROMPTS_DIR            = path.join(BACKEND_ROOT, 'prompts');
export const CACHE_DIR              = path.join(BACKEND_ROOT, 'cache');

/**
 * Ensure all required runtime directories exist.
 * Called once at startup so they are always present.
 */
export function ensureDirectories() {
    [
        GENERATED_AGENTS_DIR,
        GENERATED_PACKAGES_DIR,
        CACHE_DIR,
    ].forEach(dir => fs.mkdirSync(dir, { recursive: true }));
}
