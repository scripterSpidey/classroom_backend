import { Admin } from "../../domain/entities/admin";
import { ClassroomDocument } from "../../infrastructure/model/classroom.model";
import { StudentDocument } from "../../infrastructure/model/student.model";
import { TeacherDocument } from "../../infrastructure/model/teacher.model";

export interface I_AdminInteractor{
    login(data:Admin):Promise<any>;
    logout():Promise<Boolean>;
    getTeachers():Promise<TeacherDocument[]>;
    getStudents():Promise<StudentDocument[]>;
    getClassrooms():Promise<ClassroomDocument[]>;
    blockOrUnblockTeacher():Promise<any>;
    banOrUnbanClassroom():Promise<any>;

    getTeacherInfo(teacher:{teacherId:string}):Promise<TeacherDocument|null>;

    getStudentInfo(student:{studentId:string}):Promise<StudentDocument|null>;

    getClassroomInfo(classroom:{classroomId:string}):Promise<ClassroomDocument|null>;
}