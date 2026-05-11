import fs from 'fs';

export function loadPrompt(path) {
    return fs.readFileSync(path, 'utf8');
}