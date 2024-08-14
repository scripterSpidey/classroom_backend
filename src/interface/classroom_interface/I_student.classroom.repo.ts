import { ClassroomDocument, ClassroomMessage } from "../../infrastructure/model/classroom.model";
import { PrivateChatDocument } from "../../infrastructure/model/private.chat.model";
import { StudentDocument } from "../../infrastructure/model/student.model";

export interface I_StudentClassroomRepo {
    fetchClassroom(data: string, student_id: string): Promise<ClassroomDocument | null>;
    saveJoiningRequest(classroom_id: string, student_id: string): Promise<ClassroomDocument | null>;
    fetchAllClassroomsOfStudent(student_id: string): Promise<StudentDocument | null>;
    fetchClassroomDetailsForStudent(classroom_id: string,student_id:string): Promise<ClassroomDocument | null>;
    saveClassroomMessage(classroom_id:string,message:ClassroomMessage):Promise<ClassroomMessage>;

    fetchClassroomMessages(classroom_id:string):Promise<ClassroomDocument[]|null>;

    savePrivateMessage(data:PrivateChatDocument):Promise<PrivateChatDocument>;

    fetchPrivateMessages(senderId:string,receiverId:string,classroomId:string):Promise<PrivateChatDocument[]>
    
}