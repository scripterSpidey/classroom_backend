import mongoose, { Schema, Model, ObjectId } from "mongoose";
import { string } from "zod";

export enum MaterialType{
    PDF = 'pdf',
    LINK = 'link'
}

export interface ClassroomDocument extends mongoose.Document {
    _id: ObjectId,
    name: string,
    subject: string,
    class_teacher_name: string,
    class_teacher_id: mongoose.Types.ObjectId,
    students: Array<{
        student_id: mongoose.Types.ObjectId,
        email: string,
        name: string,
        joined_at: Date,
        blocked: boolean,
    }>,
    classroom_messages: Array<{
        sender_id: Schema.Types.ObjectId,
        sender_name: string,
        message: string,
        send_at: Date
    }>,
    strength: number,
    joining_requests: mongoose.Types.ObjectId[],
    banned: boolean,
    classroom_id: string,
    createdAt: Date,
    materials:Array<{
        title:string,
        description:string,
        type:MaterialType,
        url:string,
        created_at:Date,
    }>
};

export type ClassroomMaterialType = ClassroomDocument['materials'][number]
export type ClassroomMessage = ClassroomDocument["classroom_messages"][number];

const classroomSchema: mongoose.Schema = new mongoose.Schema<ClassroomDocument>({
    classroom_id: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    class_teacher_name: {
        type: String,
        required: true,
        trim: true
    },
    class_teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    students: [{
        student_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'students'
        },
        blocked: {
            type: Boolean,
            default: false
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        name: {
            type: String,
            require: true,
            trim: true
        },
        joined_at: {
            type: Date,
            default: new Date()
        }
    }],
    classroom_messages: [{
        sender_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'students',
            required: true
        },
        sender_name: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        send_at: {
            type: Date,
            default: new Date(),
            required: true
        }
    }],
    materials:[{
        title:{
            type:String,
            rqeuired:true
        },
        description:{
            type:String,
            required:true
        },
        type:{
            type:String,
            enum:['pdf','links'],
        },
        url:{
            type:String,
            required:true
        },
        created_at:{
            type:Date,
            required:true
        }
    }],
    joining_requests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'students'
    }],
    strength: {
        type: Number,
        default: 0
    },
    banned: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const ClassroomModel: Model<ClassroomDocument> =
    mongoose.model<ClassroomDocument>('classrooms', classroomSchema)