import mongoose, {  Model } from "mongoose";

export interface TeacherDocument extends mongoose.Document{
    email:string,
    name:string,
    password:string,
    blocked:boolean,
    verified:boolean,
    classrooms:string[]
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
        required:true
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
    }
},{timestamps:true})

export const TeacherModel:Model<TeacherDocument> = mongoose.model<TeacherDocument>("Teachers",teacherSchema)