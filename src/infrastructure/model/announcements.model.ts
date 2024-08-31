import mongoose, { Model } from "mongoose";


export enum NotificationTypeEnum{
    EXAM = 'exam',
    WORK = 'work',
    MATERIAL = 'material',
    CUSTOME = 'custume'
}
export interface AnnouncementsDocument{
    _id?: mongoose.Types.ObjectId,
    classroom_id: mongoose.Types.ObjectId,
    type:NotificationTypeEnum,
    content: string,
    pinned:boolean,
    important:boolean,
    createdAt:Date
}


const announcementsSchema :mongoose.Schema = new mongoose.Schema<AnnouncementsDocument>({
    classroom_id:{type:mongoose.Schema.Types.ObjectId, required:true,index:true,ref:'classrooms'},
    type:{type:String,enum:Object.values(NotificationTypeEnum)},
    content:{ type: String, required: true },
    pinned:{type:Boolean,default:false},
    important:{type:Boolean,default:false},
    createdAt:{type:Date,default:new Date()}
})


export const AnnouncementsModel:Model<AnnouncementsDocument>=
    mongoose.model<AnnouncementsDocument>('announcements',announcementsSchema)