import { ClassroomDocument } from "../../infrastructure/model/classroom.model";
import { StudentDocument } from "../../infrastructure/model/student.model";


export interface I_ClassroomRepo{
    createClassroom(data:any,class_teacher_id:string):Promise<any>;
    getClassroomsforteacher(data:string):Promise<ClassroomDocument[]|[]>;
    getTeacherClassroomDetail(classroom_id:string,class_teacher_id:string):Promise<ClassroomDocument|null>;
    fetchClassroom(data:string,student_id:string):Promise<ClassroomDocument|null>;
    saveJoiningRequest(classroom_id:string,student_id:string):Promise<ClassroomDocument|null>;
    acceptRequest(classroom_id:string,teacher_id:string,student_id:string):Promise<ClassroomDocument|null>;
    rejectRequest(classroom_id: string,teacher_id:string,student_id:string):Promise<ClassroomDocument|null>;
    fetchAllClassroomsOfStudent(student_id:string):Promise<StudentDocument|null>;
    fetchClassroomDetailsForStudent(student_id:string):Promise<ClassroomDocument|null>;
}