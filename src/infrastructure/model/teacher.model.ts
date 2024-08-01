import mongoose, {  Model } from "mongoose";
import { string } from "zod";

export interface TeacherDocument extends mongoose.Document{
    email:string,
    name:string,
    password:string,
    blocked:boolean,
    verified:boolean,
    classrooms:string[],
    profile_image:string | null
}

const teacherSchema:mongoose.Schema = new mongoose.Schema<TeacherDocument>({
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
    classrooms:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'classrooms'
    }],
    profile_image:{
        type:String,
        default:null
    }
},{timestamps:true})

export const TeacherModel:Model<TeacherDocument> = mongoose.model<TeacherDocument>("Teachers",teacherSchema)