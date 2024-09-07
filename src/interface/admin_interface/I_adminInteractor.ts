import { Admin } from "../../domain/entities/admin";
import { ClassroomDocument } from "../../infrastructure/model/classroom.model";
import { StudentDocument } from "../../infrastructure/model/student.model";
import { TeacherDocument } from "../../infrastructure/model/teacher.model";

export interface I_AdminInteractor{
    login(data:Admin):Promise<any>;

    logout():Promise<Boolean>;

    getTeachers(query:{page:number,rows:number}):Promise<TeacherDocument[]>;

    getStudents(query:{page:number,rows:number}):Promise<StudentDocument[]>;

    getClassrooms(query:{page:number,rows:number}):Promise<ClassroomDocument[]>;

    blockOrUnblockTeacher(data:{teacherId:string},body:{reason:string}):Promise<any>;
    
    banOrUnbanClassroom(classroom:{classroomId:string},body:{reason:string}):Promise<void>;

    getTeacherInfo(teacher:{teacherId:string}):Promise<TeacherDocument|null>;

    getStudentInfo(student:{studentId:string}):Promise<StudentDocument|null>;

    getClassroomInfo(classroom:{classroomId:string}):Promise<ClassroomDocument|null>;

    blockOrUnblockStudent(studen:{studentId:string},body:{reason:string}):Promise<void>

}