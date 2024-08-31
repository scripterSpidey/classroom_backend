import mongoose from "mongoose";
import { DATABASE_URL } from "../constants/env";
export const connectToDB = async()=>{
    try {
        const connect = await mongoose.connect(`${DATABASE_URL}`);
        console.log('connected to database')
    } catch (error) {
        console.log(error);
        // process.exit(1) 
    }
}
    