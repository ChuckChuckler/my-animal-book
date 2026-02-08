import type { RequestHandler } from "../$types";
import { json } from "@sveltejs/kit";
import MongoDB, { MongoClient } from "mongodb";

let uri:string=MONGO_URI;
let client = new MongoClient(uri);
let db = client.db(DB_NAME);
let userColl = db.collection(DB_NAME);

export const POST: RequestHandler=async({request})=>{
    const { username, password, type } = await request.json();
    let found = await userColl.findOne({
        username: username
    });
    if(type=="Sign Up"){
        if(found!=null){
            return json({
                msg: `User ${username} already exists!`,
                success: false
            });
        }else{
            userColl.insertOne({
                username: username,
                password: password,
                journal: []
            });
            return json({
                msg: "Successfully created account! Redirecting...",
                success: true,
            });
        }
    }else if(type=="Log In"){
        if(found==null){
            return json({
                msg: `No user ${username} found!`,
                success: false
            });
        }else{
            if(await userColl.findOne({username: username, password: password})==null){
                return json({
                    msg: "Incorrect password!",
                    success: false
                });
            }else{
                return json({
                    msg: "Successfully logged in! Redirecting...",
                    success: true,
                });
            }
        }
    }else{
        return json({
            msg: "Error: Unaccepted auth type",
            success: false,
        });
    }
}