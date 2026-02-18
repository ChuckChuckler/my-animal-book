import { COLLNAME, DB_NAME, MONGO_URI } from "$env/static/private";
import type { RequestHandler } from "../$types";
import { json } from "@sveltejs/kit";
import MongoDB, { MongoClient, ObjectId, Collection } from "mongodb";

let client = new MongoClient(MONGO_URI);
let db = client.db(DB_NAME);
let userColl:Collection<Document> = db.collection(COLLNAME);

type JournalEntry = {
    commonName:string,
    scientificName:string,
    animalImage:string,
    found:string,
    notes:string,
    dateOf:string
};

type Document = {
    _id:ObjectId,
    username:string,
    password:string,
    profilePicture:string,
    journal:JournalEntry[],
    blogPosts:any[]
}

export const POST:RequestHandler=async({request})=>{
    let { username } = await request.json();
    try{
        let userData = await userColl.findOne({username:username});
        return json({msg:userData});
    }catch(e){
        return json({msg:e});
    }
}