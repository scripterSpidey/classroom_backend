import { ClassroomMessage } from "../../infrastructure/model/classroom.model";
import { PrivateChatDocument } from "../../infrastructure/model/private.chat.model";

export interface I_SocketServices{
    emitClassroomMessage(classroomId:string,message:ClassroomMessage):void;
    emitPrivateMessage(userId:string,message:PrivateChatDocument):void;
}