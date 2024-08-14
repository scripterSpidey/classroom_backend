import mongoose from "mongoose";
import { Schema, Document } from "mongoose";
import { Model } from "mongoose";
import { string } from "zod";
import { ObjectId } from "mongodb";

export interface StudentDocument extends Document {
    _id: Schema.Types.ObjectId,
    email: string,
    name: string,
    password: string,
    createdAt: Date,
    updateAt: Date,
    blocked: boolean,
    verified: boolean,
    classrooms: Array<{
        classroom_id: mongoose.Types.ObjectId,
        class_teacher_name: string,
        subject: string,
        classroom_name: string,
        joined_at: Date,
        blocked: boolean
    }>,
    profile_image: string | null
}

export type StudentClassroomDocType = StudentDocument["classrooms"][number];


const studentSchema: Schema = new Schema<StudentDocument>({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        default: null
    },
    blocked: {
        type: Boolean
    },
    verified: {
        type: Boolean,
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
    profile_image: {
        type: String,
        default: null
    }
}, { timestamps: true })

export const StudentModel: Model<StudentDocument> = mongoose.model<StudentDocument>("students", studentSchema)