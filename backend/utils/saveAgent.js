import fs from 'fs';

export function saveAgent(code) {

    const cleaned = code
        .replace(/```python/g, '')
        .replace(/```/g, '')
        .trim();

    const timestamp = Date.now();

    const filename =
        `agent_${timestamp}.py`;

    const path =
        `./generated/agents/${filename}`;

    fs.writeFileSync(path, cleaned);

    return {
        filename,
        path
    };
}