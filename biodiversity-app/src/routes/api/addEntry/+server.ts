import { COLLNAME, DB_NAME, MONGO_URI } from "$env/static/private";
import type { RequestHandler } from "../$types";
import { json } from "@sveltejs/kit";
import MongoDB, { MongoClient } from "mongodb";

let client = new MongoClient(MONGO_URI);
let db = client.db(DB_NAME);
let userColl = db.collection(COLLNAME);

type JournalEntry = {
    commonName:string,
    scientificName:string,
    animalImage:string,
    found:string,
    notes:string
};

export const POST:RequestHandler=async({request})=>{
    let { commonName, scientificName, animalImage, found, notes } = await request.json();
    return json({msg:"hi"});
}