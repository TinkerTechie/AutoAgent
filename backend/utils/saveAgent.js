import fs from 'fs';
import path from 'path';
import { GENERATED_AGENTS_DIR } from './paths.js';

export function saveAgent(code) {

    const cleaned = code
        .replace(/```python/g, '')
        .replace(/```/g, '')
        .trim();

    const timestamp = Date.now();
    const filename  = `agent_${timestamp}.py`;
    const filePath  = path.join(GENERATED_AGENTS_DIR, filename);

    fs.writeFileSync(filePath, cleaned);

    return {
        filename,
        path: filePath
    };
}