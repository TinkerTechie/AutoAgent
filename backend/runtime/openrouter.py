import os
import requests

from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv(
    "OPENROUTER_API_KEY"
)

MODEL = "openai/gpt-3.5-turbo"

def call_llm(prompt):

    response = requests.post(

        "https://openrouter.ai/api/v1/chat/completions",

        headers={

            "Authorization":
                f"Bearer {OPENROUTER_API_KEY}",

            "Content-Type":
                "application/json"
        },

        json={

            "model": MODEL,

            "messages": [

                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
    )

    data = response.json()

    return data[
        "choices"
    ][0][
        "message"
    ][
        "content"
    ]