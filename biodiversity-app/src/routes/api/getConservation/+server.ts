import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import axios from "axios";
import { OpenRouter } from "@openrouter/sdk";
//import { GREENPT_KEY } from "$env/static/private";


export const POST:RequestHandler=async({request})=>{
    let {threats, animal} = await request.json();
    threats = JSON.stringify(threats);

    return json({msg:"hi"});
    //return json({msg:completion.choices[0].message.content});
}