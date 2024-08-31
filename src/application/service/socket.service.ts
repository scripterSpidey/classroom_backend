import { AnnouncementsDocument } from "../../infrastructure/model/announcements.model";
import { ClassroomMessage } from "../../infrastructure/model/classroom.model";
import { PrivateChatDocument } from "../../infrastructure/model/private.chat.model";
import { I_SocketServices } from "../../interface/service_interface/I_Socket";
import { io } from "../socket/socket";



export class SocketServices implements I_SocketServices{

    constructor(){}
    
    emitClassroomMessage(classroomId: string, message: ClassroomMessage): void {
        io.to(classroomId).emit('classroomMessage',message)
    }
    emitPrivateMessage(userId: string, message:PrivateChatDocument): void {
       io.to(userId).emit('privateMessage',message)
    }

    emitAnnouncement(classroomId:string,announcement:AnnouncementsDocument){
        io.to(classroomId).emit('announcement',announcement)
    }

}