import axios from "axios";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import { ANIMALDETECT_KEY } from "$env/static/private";

export const POST:RequestHandler=async({request})=>{
    let { b64 } = await request.json();
    const response = (await axios.post("https://www.animaldetect.com/api/v1/detect",
        {
            image: b64
        },
        {
            headers:{
                Authorization: `Bearer ${ANIMALDETECT_KEY}`
            },
        })).data;
    return json({msg:response});
}