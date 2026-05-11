require("dotenv").config();

const axios = require("axios");

async function test() {
    try {
        console.log("Testing OpenRouter...");

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "deepseek/deepseek-chat-v3-0324",
                messages: [
                    {
                        role: "user",
                        content: "Say hello"
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("SUCCESS:");
        console.log(response.data.choices[0].message.content);

    } catch (error) {
        console.log("ERROR:");

        if (error.response) {
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
    }
}

test();