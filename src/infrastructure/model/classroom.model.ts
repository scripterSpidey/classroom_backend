import mongoose, { Model } from "mongoose";
import { string } from "zod";

export interface ClassroomDocument extends mongoose.Document{
    name:string,
    subject:string,
    class_teacher_name:string,
    class_teacher_id:mongoose.Types.ObjectId,
    students:[mongoose.Types.ObjectId],
    strength:number,
    joining_requests:[mongoose.Types.ObjectId],
    banned:boolean,
    classroom_id:string
}

const classroomSchema:mongoose.Schema = new mongoose.Schema<ClassroomDocument>({
    classroom_id:{
        type:String,
        required:true,
        index:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    subject:{
        type:String,
        required:true
    },
    class_teacher_name:{
        type:String,
        required:true
    },
    class_teacher_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    students:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'students'
    }],
    joining_requests:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'students'
    }],
    strength:{
        type:Number,
        default:0
    },
    banned:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

export const ClassroomModel:Model<ClassroomDocument> = mongoose.model<ClassroomDocument>('classrooms',classroomSchema)