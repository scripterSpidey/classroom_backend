import mongoose, {  Model, Schema } from "mongoose";
import { string } from "zod";

import { ObjectId } from "mongodb";
export interface TeacherDocument extends mongoose.Document{
    _id:Schema.Types.ObjectId,
    email:string,
    name:string,
    password:string,
    blocked:boolean,
    verified:boolean,
    classrooms:Array<{
        classroom_id: Schema.Types.ObjectId,
        class_teacher_name: string,
        subject: string,
        classroom_name: string,
        joined_at: Date,
        blocked: boolean
    }>,
    profile_image:string | null,
    resetPasswordToken?:string,
    resetPasswordTokenExpires?:string
}

export type TeacherClassroomDocType = TeacherDocument["classrooms"][number];


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
    classrooms: [{
        classroom_id: { type: mongoose.Types.ObjectId, ref: 'classrooms' },
        class_teacher_name: { type: String, required: true },
        classroom_name:{type: String, required: true,},
        subject: { type: String, required: true, },
        blocked: { type: Boolean, default: false },
        joined_at: { type: Date, default: new Date() }
    }],
    profile_image:{
        type:String,
        default:null
    },
    resetPasswordToken:{
        type:String,
        default:''
    },
    resetPasswordTokenExpires:{
        type:String,
        default:''
    }
},{timestamps:true})

export const TeacherModel:Model<TeacherDocument> = mongoose.model<TeacherDocument>("Teachers",teacherSchema)