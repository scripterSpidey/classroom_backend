import { ClassroomDocument, ClassroomMessage } from "../../infrastructure/model/classroom.model";
import { PrivateChatDocument } from "../../infrastructure/model/private.chat.model";
import { StudentClassroomDocType, StudentDocument } from "../../infrastructure/model/student.model";
import { TeacherClassroomDocType } from "../../infrastructure/model/teacher.model";



export interface I_TeacherClassroomRepo{
    createClassroom(data:any,class_teacher_id:string):Promise<any>;

    getClassroomsforteacher(data:string):Promise<ClassroomDocument[]|[]>;

    getTeacherClassroomDetail(classroom_id:string,class_teacher_id:string):Promise<ClassroomDocument|null>;

    acceptRequest(classroom_id:string,teacher_id:string,student_id:string,data:any,studentClassroomData:StudentClassroomDocType):Promise<ClassroomDocument|null>;

    rejectRequest(classroom_id: string,teacher_id:string,student_id:string):Promise<ClassroomDocument|null>;

    fetchStudentProfile(data:any):Promise<StudentDocument|null>;

    deleteStudentFromClassroom(student_id:string,classroom_id:string):Promise<void>;

    toggleStudentAccess(student_id:string,classroom_id:string,teacher_id:string):Promise<void>;

    saveClassroomMessage(classroom_id:string,message:ClassroomMessage):Promise<ClassroomMessage>;

    fetchClassroomMessages(classroom_id:string):Promise<ClassroomDocument[]|null>;

    savePrivateMessage(data:PrivateChatDocument):Promise<PrivateChatDocument>;

    fetchPrivateMessages(senderId:string,receiverId:string,classroomId:string):Promise<PrivateChatDocument[]>
    
}