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

    async getTeachers(): Promise<TeacherDocument[]> {
        try {
            const teachers = await this.repository.fetchTeachers();

            return teachers;
        } catch (error) {
            throw error;
        }
    }

    async getStudents(): Promise<StudentDocument[]> {
        try {
            const students = await this.repository.fetchStudents();
            return students;
        } catch (error) {
            throw error;
        }
    }

    async getClassrooms(): Promise<ClassroomDocument[]> {
        try {
            const calssrooms = await this.repository.fetchClassrooms();
            return calssrooms;
        } catch (error) {
            throw error;
        }
    }

    async getTeacherInfo(data: { teacherId: string }): Promise<TeacherDocument | null> {
        try {
            const teacher = await this.repository.fetchTeacherInfo(data.teacherId);
            return teacher;
        } catch (error) {
            throw error;
        }
    }

    async getStudentInfo(data: { studentId: string }): Promise<StudentDocument | null> {
        try {
            const student = await this.repository.fetchStudentInfo(data.studentId);
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


    blockOrUnblockTeacher(): Promise<any> {
        try {
            throw new Error("Method not implemented.");
        } catch (error) {
            throw error;
        }
    }
    banOrUnbanClassroom(): Promise<any> {
        try {
            throw new Error("Method not implemented.");
        } catch (error) {
            throw error;
        }
    }

}