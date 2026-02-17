import { COLLNAME, DB_NAME, MONGO_URI } from "$env/static/private";
import type { RequestHandler } from "../$types";
import { json } from "@sveltejs/kit";
import MongoDB, { MongoClient, ObjectId, Collection } from "mongodb";

const client = new MongoClient(MONGO_URI);
let db = client.db(DB_NAME);
let coll:Collection<Document> = db.collection(COLLNAME);

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
    journal:JournalEntry[]
}

export const POST:RequestHandler=async({request})=>{
    let { username, animalName } = await request.json();
    try{
        let entries = await coll.findOne({username:username});
        if(entries!=null){
            let entriesArr = entries.journal;
            for(let i:number=0;i<entriesArr.length;i++){
                if(entriesArr[i].commonName==animalName){
                    return json({msg:entriesArr[i]});
                }
            }
        }

        return json({msg:"error!!"});
    }catch(e){
        return json({msg:e});
    }
}