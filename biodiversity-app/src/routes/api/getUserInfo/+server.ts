import { MONGO_URI, COLLNAME, DB_NAME } from "$env/static/private";
import MongoDB, { MongoClient, ObjectId, Collection } from "mongodb";
import type { RequestHandler } from "../$types";
import { json } from "@sveltejs/kit";

const client = new MongoClient(MONGO_URI);
const db = client.db(DB_NAME);
const userInfo:Collection<Document> = db.collection(COLLNAME);

type Document = {
    _id:ObjectId,
    username:string,
    password:string,
    profilePicture:string,
    status: string,
    bio: string,
    journal:any[],
    blogPosts:any[]
}

export const POST:RequestHandler=async({request})=>{
    let {username} = await request.json();
    try{
        if(username!=null){
            const response = (await userInfo.findOne({username:username}));
            if(response!=null){
                return json({
                    msg:"success",
                    profilePicture: response.profilePicture,
                    status: response.status,
                    bio: response.bio,
                    journal: response.journal,
                    blogPosts: response.blogPosts
                });
            }else{
                return json({msg:"error"})
            }
        }else{
            return json({msg:"username is null"});
        }
    }catch(e){
        return json({msg:e})
    }
}