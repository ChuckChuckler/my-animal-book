import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import axios from "axios";

export const POST:RequestHandler=async({request})=>{
    let {allInfo} = await request.json();
    return json({msg:allInfo});
}