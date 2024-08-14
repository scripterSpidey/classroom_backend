import mongoose, { Model, Schema } from "mongoose";


export enum ChatType {
    TEXT = 'text',
    IMAGE = 'image',
    VIDEO = 'video',
    FILE = 'file',
    AUDIO = 'audio',
}

export enum RoleType {
    STUDENT = 'student',
    TEACHER = 'teacher'
}

export interface PrivateChatDocument  {
    _id?: mongoose.Types.ObjectId,
    classroom_id: mongoose.Types.ObjectId,
    sender_name: string,
    sender_id: mongoose.Types.ObjectId,
    receiver_name: string,
    receiver_id: mongoose.Types.ObjectId,
    message: string,
    type: ChatType,
    sender_role: RoleType,
    read: boolean
}

const PrivateChatSchema: Schema = new Schema<PrivateChatDocument>({
    classroom_id: { type: Schema.Types.ObjectId, required: true,ref:'classrooms' },
    sender_name: { type: String, required: true },
    sender_id: { type: Schema.Types.ObjectId, required: true },
    receiver_name: { type: String, required: true },
    receiver_id: { type: Schema.Types.ObjectId, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: Object.values(ChatType), required: true },
    sender_role: { type: String, enum: Object.values(RoleType), required: true },
    read: { type: Boolean, default: false }
}, { timestamps: true })

export const PrivateChatModel: Model<PrivateChatDocument> =
    mongoose.model<PrivateChatDocument>('privateChats', PrivateChatSchema)