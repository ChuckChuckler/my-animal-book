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
    journal:JournalEntry[]
}

export const POST:RequestHandler=async({request})=>{
    let { previousCommonName, commonName, scientificName, animalImage, found, notes, dateGiven, username } = await request.json();
    try{
        let journalEntry:JournalEntry = {
            commonName:commonName,
            scientificName:scientificName,
            animalImage:animalImage,
            found:found,
            notes:notes,
            dateOf: dateGiven
        }
        
        let ahh = await userColl.updateOne({username:username, "journal.commonName":previousCommonName},
            {$set:{
                    "journal.$":journalEntry
                } 
            }
        );
        console.log(ahh);
        return json({msg:"success"});
    }catch(e){
        return json({msg:e})
    }
}