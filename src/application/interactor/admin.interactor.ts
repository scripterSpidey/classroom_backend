import { Admin } from "../../domain/entities/admin";
import { ClassroomDocument } from "../../infrastructure/model/classroom.model";
import { StudentDocument } from "../../infrastructure/model/student.model";
import { TeacherDocument } from "../../infrastructure/model/teacher.model";
import { I_AdminInteractor } from "../../interface/admin_interface/I_adminInteractor";
import { I_AdminRepo } from "../../interface/admin_interface/I_adminRepo";
import { I_JWT } from "../../interface/service_interface/I_jwt";
import { CostumeError } from '../../utils/costume.error'
export class AdminInteractor implements I_AdminInteractor {
    private repository: I_AdminRepo;
    private jwt: I_JWT;
    constructor(repository: I_AdminRepo, jwt: I_JWT) {
        this.repository = repository;
        this.jwt = jwt;
    }


    login(data: Admin): any {
        try {
            const email = process.env.ADMIN_EMAIL;
            const password = process.env.ADMIN_PASSWORD;

            if (data.email == email && data.password == password) {
                const adminAccessToken = this.jwt.generateToken({ admin: 'ahmedgeck@gmail.com' }, '1d');

                return { adminAccessToken, email };
            }
            throw new CostumeError(401, "Invalid credentials")
        } catch (error) {
            throw error
        }

    }
    logout(): Promise<Boolean> {
        throw new Error("Method not implemented.");
    }

    async getTeachers(query:{page:number,rows:number}): Promise<TeacherDocument[]> {
        try {
            const {page,rows} = query;
            const teachers = await this.repository.fetchTeachers((page-1)*rows,rows);

            return teachers;
        } catch (error) {
            throw error;
        }
    }

    async getStudents(query:{page:number,rows:number}): Promise<StudentDocument[]> {
        try {
            const {page,rows} = query;
            const students = await this.repository.fetchStudents((page-1)*rows,rows);
            return students;
        } catch (error) {
            throw error;
        }
    }

    async getClassrooms(query:{page:number,rows:number}): Promise<ClassroomDocument[]> {
        try {
            const {page,rows} = query;
            console.log(query)
            const calssrooms = await this.repository.fetchClassrooms((page-1)*rows,rows);
            console.log(calssrooms)
            return calssrooms;
        } catch (error) {
            throw error;
        }
    }

    async getTeacherInfo(data: { teacherId: string }): Promise<TeacherDocument | null> {
        try {
            const teacher = await this.repository.fetchTeacherInfo(data.teacherId);
            console.log(teacher?.classrooms)
            return teacher;
        } catch (error) {
            throw error;
        }
    }

    async blockOrUnblockTeacher(data: { teacherId: string }): Promise<void> {
        try {
            const teacher = await this.repository.fetchTeacherInfo(data.teacherId);

            if (!teacher) throw new CostumeError(404, "Can not find the user you are looking for");

            const status = teacher.blocked;

            await this.repository.blockTeacher(data.teacherId, !status)
        } catch (error) {
            throw error;
        }
    }

    async getStudentInfo(data: { studentId: string }): Promise<StudentDocument | null> {
        try {
            const student = await this.repository.fetchStudentInfo(data.studentId);
            console.log('student', student)
            return student;
        } catch (error) {
            throw error;
        }
    }

    async getClassroomInfo(data: { classroomId: string }): Promise<ClassroomDocument | null> {
        try {
            const classroom = await this.repository.fetchClassroomInfo(data.classroomId);
            return classroom;
        } catch (error) {
            throw error;
        }
    }


    async banOrUnbanClassroom(classroom:{classroomId:string}): Promise<void> {
        try {
            const classroomInfo = await this.repository.fetchClassroomInfo(classroom.classroomId);
            if(!classroomInfo) throw new CostumeError(404,'Can not find the classroom you looking for.');
            const banState = classroomInfo.banned
            await this.repository.changeBanStateOfClassroom(classroom.classroomId,!banState);
            return
        } catch (error) {
            throw error;
        }
    }

    
    async blockOrUnblockStudent(data: { studentId: string }): Promise<void> {
        try {
            const student = await this.repository.fetchStudentInfo(data.studentId);

            if (!student) throw new CostumeError(404, "Can not find the user you are looking for");

            const status = student.blocked;
            console.log(status)

            await this.repository.toggleBlockStatusOfStudent(data.studentId, !status)
        } catch (error) {
            throw error;
        }
    }

}