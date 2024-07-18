import mongoose  from "mongoose";
import { string } from "zod";

export const enum roleType{
    teacher = "teacher",
    student = "student"
}

export interface SessionDocument extends mongoose.Document{
    userId: mongoose.Types.ObjectId;
    role:roleType;
    device?: string;
    createdAt: Date;
    active: boolean,
    endedAt:Date
}

const sessionSchema  = new mongoose.Schema<SessionDocument>({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'role',
        index:true
    },
    role:{
        type:String,
        required:true,
        enum:['teacher','student']
    },
    device:{
        type: String
    },
    endedAt:{
        type:Date
    },
    active:{
        type: Boolean
    },
    createdAt:{
        type:Date,
        required:true
    },
});

export const SessionModel = mongoose.model<SessionDocument>("Sessions",sessionSchema)