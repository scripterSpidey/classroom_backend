import { ClassroomDocument, ClassroomMessage } from "../../infrastructure/model/classroom.model";
import { PrivateChatDocument } from "../../infrastructure/model/private.chat.model";
import { StudentDocument } from "../../infrastructure/model/student.model";
import { CreateClassroomInputType } from "../../schema/create.classroom.schema";
import { studentIdParamType } from "../../schema/remove.student.schema";
import { saveMessageInput } from "../../schema/saveMessageSchema";
import { SendPrivateMessageBodyType, SendPrivateMessageParamsType } from "../../schema/send.private.message.schema";
import { ClassroomJwtPayload } from "../I_classroom.auth.interactor";
import { UserJwtPayload } from "../service_interface/I_jwt";

export interface I_TeacherClassroomInteractor {

    createClassroom(data: CreateClassroomInputType): Promise<any>;

    getTeacherClassrooms(data: any, user: any): Promise<ClassroomDocument[] | []>;

    getTeacherClassroomDetails(data: any, user: any): Promise<{ classroomToken: string }>;

    acceptJoiningRequest(data: any, user: any, body: any): Promise<ClassroomDocument>;

    rejectJoiningRequest(data: any, user: any, body: any): Promise<any>;

    getStudentProfile(data: any): Promise<StudentDocument | null>;

    removeStudent(data: { student_id: string }, classroom: { classroom_id: string }): Promise<void>;

    blockOrUnblockOrStudent(data: studentIdParamType, classroom: ClassroomJwtPayload): Promise<void>;

    getClassroomMessages(user: UserJwtPayload, classroom: ClassroomJwtPayload): Promise<ClassroomMessage[] | []>;

    sendClassroomMessage(user: UserJwtPayload, classroom: ClassroomJwtPayload, body: saveMessageInput): Promise<any>;

    sendPrivateMessage(user: UserJwtPayload,
        classroom: ClassroomJwtPayload,
        body: SendPrivateMessageBodyType,
        receiver: SendPrivateMessageParamsType): Promise<void>;

    getPrivateMessages(teacher: UserJwtPayload,
        receiver: SendPrivateMessageParamsType,
        classroom: ClassroomJwtPayload): Promise<PrivateChatDocument[]>;


}