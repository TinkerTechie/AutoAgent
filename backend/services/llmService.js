import axios from 'axios';

export async function askLLM(
    systemPrompt,
    userInput
) {

    const finalPrompt =
        systemPrompt
            .replace(
                '{{PROMPT}}',
                userInput
            )
            .replace(
                '{{BLUEPRINT}}',
                userInput
            );

    const response =
        await axios.post(

            'https://openrouter.ai/api/v1/chat/completions',

            {

                model:
                    'openai/gpt-3.5-turbo',

                max_tokens: 1200,

                messages: [

                    {
                        role: 'user',
                        content: finalPrompt
                    }
                ]
            },

            {

                headers: {

                    Authorization:
                        `Bearer ${process.env.OPENROUTER_API_KEY}`,

                    'Content-Type':
                        'application/json'
                }
            }
        );

    return response.data
        .choices[0]
        .message.content;
}