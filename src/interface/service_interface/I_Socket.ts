import { AnnouncementsDocument } from "../../infrastructure/model/announcements.model";
import { ClassroomMessage } from "../../infrastructure/model/classroom.model";
import { PrivateChatDocument } from "../../infrastructure/model/private.chat.model";

export interface I_SocketServices{
    emitClassroomMessage(classroomId:string,message:ClassroomMessage):void;
    emitPrivateMessage(userId:string,message:PrivateChatDocument):void;
    emitAnnouncement(classroomId:string,announcement:AnnouncementsDocument):void;
    emitLiveClassStartedMessage(classroomId:string,liveClassTitle:string);
}