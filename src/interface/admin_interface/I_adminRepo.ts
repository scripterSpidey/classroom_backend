import { Admin } from "../../domain/entities/admin";
import { ClassroomDocument } from "../../infrastructure/model/classroom.model";
import { TeacherDocument } from "../../infrastructure/model/teacher.model";
import {StudentDocument} from '../../infrastructure/model/student.model'
export interface I_AdminRepo{
    findAdmin(data:Admin):Promise<Admin | null>;

    logout():Promise<Boolean>;

    fetchClassrooms(skip:number,limit:number):Promise<ClassroomDocument[]>;

    fetchTeachers(skip:number,limit:number):Promise<TeacherDocument[]>;

    fetchStudents(skip:number,limit:number):Promise<StudentDocument[]>;

    fetchTeacherInfo(teacherId:string):Promise<TeacherDocument|null>;

    blockTeacher(teacherId:string,status:boolean):Promise<void>;

    fetchStudentInfo(studentId:string):Promise<StudentDocument|null>;

    fetchClassroomInfo(classroomId:string):Promise<ClassroomDocument|null>;

    changeBanStateOfClassroom(classroomId:string,value:boolean):Promise<void>;

    toggleBlockStatusOfStudent(studentId:string,value:boolean):Promise<void>;
}