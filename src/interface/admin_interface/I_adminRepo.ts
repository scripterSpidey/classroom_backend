import { Admin } from "../../domain/entities/admin";
import { ClassroomDocument } from "../../infrastructure/model/classroom.model";
import { TeacherDocument } from "../../infrastructure/model/teacher.model";
import {StudentDocument} from '../../infrastructure/model/student.model'
export interface I_AdminRepo{
    findAdmin(data:Admin):Promise<Admin | null>;
    logout():Promise<Boolean>;

    fetchClassrooms():Promise<ClassroomDocument[]>;

    fetchTeachers():Promise<TeacherDocument[]>;

    fetchStudents():Promise<StudentDocument[]>;

    fetchTeacherInfo(teacherId:string):Promise<TeacherDocument|null>;

    fetchStudentInfo(studentId:string):Promise<StudentDocument|null>;

    fetchClassroomInfo(classroomId:string):Promise<ClassroomDocument|null>;
}