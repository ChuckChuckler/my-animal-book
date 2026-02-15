import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import axios from "axios";
import { OpenRouter } from "@openrouter/sdk";
import { OPENROUTER_KEY } from "$env/static/private";

const openRouter = new OpenRouter({
    apiKey: OPENROUTER_KEY
});

export const POST:RequestHandler=async({request})=>{
    let {threats, animal} = await request.json();
    threats = JSON.stringify(threats);
    const completion = await openRouter.chat.send({
        chatGenerationParams:{
            model: 'openai/gpt-5.2',
            messages:[
                {
                    role: "user",
                    content: `Using this list of threats:\n${threats}\ngenerate a bullet-point 4-6 item list of conservation acts someone could take to protect the ${animal}. Keep in plain text. Separate each point with !SEPARATE! only, do not include newline characters or other special characters.`
                }
            ],
            stream: false,
            maxTokens: 1000
        }
    })
    return json({msg:completion.choices[0].message.content});
}