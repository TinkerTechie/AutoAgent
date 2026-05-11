export function safeJsonParse(text) {

    try {

        /*
          Remove markdown wrappers
        */

        let cleaned = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        /*
          Extract JSON object only
        */

        const start =
            cleaned.indexOf('{');

        const end =
            cleaned.lastIndexOf('}');

        cleaned =
            cleaned.slice(start, end + 1);

        return JSON.parse(cleaned);

    } catch (error) {

        console.log('JSON PARSE ERROR');

        console.log(text);

        throw new Error(
            'Invalid JSON from LLM'
        );
    }
}