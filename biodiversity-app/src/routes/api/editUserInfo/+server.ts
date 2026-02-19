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

export const POST:RequestHandler=async ({request})=>{
    let {username, pfp, bio, status } = await request.json();
    if(status=="not changed"){
        try{
            if(username!=null){
                await userInfo.updateOne({username:username},{
                    $set:{
                        profilePicture: pfp,
                        bio: bio
                    }
                });
                return json({msg:"success"});
            }else{
                return json({msg:"error"});
            }
        }catch(e){
            return json({msg:e});
        }
    }else{
        try{
            if(username!=null){
                await userInfo.updateOne({username:username},{
                    $set:{
                        status:status
                    }
                });
                return json({msg:"success"});
            }else{
                return json({msg:"error"});
            }
        }catch(e){
            return json({msg:e});
        }
    }
}