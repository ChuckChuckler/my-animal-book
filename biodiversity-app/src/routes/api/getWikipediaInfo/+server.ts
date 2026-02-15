import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import axios from "axios";

export const POST:RequestHandler=async({request})=>{
    let { name } = await request.json();
    try{
        const response = (await axios.get(`https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&explaintext&redirects=1&titles=${name.split(" ").join("%20")}`,{
            headers:{
                "User-Agent":"myAnimalBook (your_gmail_here)"
            }
        }));
        
        return json({msg:response.data});
    }catch(e){
        return json({msg:e});
    }
}