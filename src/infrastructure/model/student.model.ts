import mongoose  from "mongoose";
import { Schema,Document } from "mongoose";
import { Model } from "mongoose";
import { string } from "zod";

export interface StudentDocument extends Document{
    email: string,
    name: string,
    password: string,
    createdAt: Date,
    updateAt: Date,
    blocked:boolean,
    verified:boolean,
    classrooms:string[],
    profile_image: string|null
}

const studentSchema:Schema =  new Schema<StudentDocument>({
    email:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        default:null
    },
    blocked:{
        type:Boolean
    },
    verified:{
        type:Boolean,
        default: false
    },
    classrooms:{
        type:[String]
    },
    profile_image:{
        type:String,
        default:null
    }
},{timestamps:true})

export const StudentModel:Model<StudentDocument> = mongoose.model<StudentDocument>("Students",studentSchema)