import { ClassroomDocument, ClassroomMessage } from "../../infrastructure/model/classroom.model";
import { PrivateChatDocument } from "../../infrastructure/model/private.chat.model";
import { saveMessageInput } from "../../schema/saveMessageSchema";
import { SendPrivateMessageBodyType, SendPrivateMessageParamsType } from "../../schema/send.private.message.schema";
import { ClassroomJwtPayload } from "../I_classroom.auth.interactor";
import { UserJwtPayload } from "../service_interface/I_jwt";


export interface I_StudentClassroomInteractor{
    findClassroom(data:any,user:any):Promise<ClassroomDocument|null>;
    requestToJoinClassroom(data:any,user:any):Promise<any>;
    getAllClassroomsForStudent(data:any):Promise<any>;
    getClassroomDetailsForStudent(user:any,data:any):Promise<{classroomToken:string}>;
    getClassroomMessages(user:UserJwtPayload,classroom:ClassroomJwtPayload):Promise<ClassroomMessage[]|[]>;
    sendClassroomMessage(user:UserJwtPayload,classroom:ClassroomJwtPayload,body:saveMessageInput):Promise<any>;

    sendPrivateMessage(user: UserJwtPayload,
        classroom: ClassroomJwtPayload,
        body: SendPrivateMessageBodyType,
        receiver: SendPrivateMessageParamsType): Promise<void>;

    getPrivateMessages(teacher: UserJwtPayload,
        receiver: SendPrivateMessageParamsType,
        classroom: ClassroomJwtPayload): Promise<PrivateChatDocument[]>;
} 