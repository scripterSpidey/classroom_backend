import mongoose  from "mongoose";
import { Schema,Document } from "mongoose";
import { Model } from "mongoose";

export interface StudentDocument extends Document{
    email: string,
    name: string,
    password: string,
    createdAt: Date,
    updateAt: Date,
    blocked:boolean,
    verified:boolean,
    classrooms:string[]
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

export const StudentModel:Model<StudentDocument> = mongoose.model<StudentDocument>("Students",studentSchema)