import mongoose, { Model } from "mongoose";

export interface LiveClassDocument {
    _id?: mongoose.Types.ObjectId,
    classroom_id: mongoose.Types.ObjectId,
    started_at: Date,
    ended_at?: Date,
    duration?: number,
    title: string,
    total_attendence: number,
    attended_students: Array<{
        student_id: mongoose.Types.ObjectId,
        student_name: string,
        joined_at: Date,
        left_at: Date,
        total_time_of_presence: number
    }>,
    zego_token?:string
}

export type LiveClassAttendenceType = LiveClassDocument['attended_students'][number];

const liveClassSchema: mongoose.Schema = new mongoose.Schema<LiveClassDocument>({
    classroom_id: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: 'classrooms' },
    title: { type: String, required: true },
    started_at: { type: Date, required: true, default: new Date() },
    ended_at: Date,
    duration: Number,
    total_attendence: Number,
    attended_students: [{
        student_id: mongoose.Schema.Types.ObjectId,
        student_name: String,
        joined_at: Date,
        left_at: Date,
        total_time_of_presence: Number
    }],
    zego_token:{type:String} 
})

export const LiveClassModel: Model<LiveClassDocument> =
    mongoose.model<LiveClassDocument>('liveclass', liveClassSchema)