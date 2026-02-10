import { json } from "@sveltejs/kit";
import type { RequestHandler } from "../$types";

let iucnApiKey:string = IUCN_REDLIST_KEY;

export const POST: RequestHandler=async({request})=>{
    let { assessmentId } = await request.json();
    try{
        const response = await fetch(`https://api.iucnredlist.org/api/v4/assessment/${assessmentId}`,{
            headers: {
                Authorization: `Bearer ${iucnApiKey}`
            }
        });
        if(!response.ok){
            let text = await response.text();
            return json({msg: text})
        }else{
            const data = await response.json();
            return json({msg: data});
        }
    }catch(e){
        return json({msg: e});
    }
}