import { Admin } from "../../domain/entities/admin";
import { I_AdminRepo } from "../../interface/admin_interface/I_adminRepo";
import { AdminModel } from "../model/admin.model";
import { ClassroomDocument, ClassroomModel } from "../model/classroom.model";
import { StudentDocument, StudentModel } from "../model/student.model";
import { TeacherDocument, TeacherModel } from "../model/teacher.model";

export class AdminRepo implements I_AdminRepo {
   


    async findAdmin(data: Admin): Promise<Admin | null> {

        const adminDoc = await AdminModel.findOne(
            { email: data.email, password: data.password },
            { password: 0 }
        )

        if (!adminDoc) return null;

        const admin: Admin = {
            id: adminDoc?._id as string,
            name: adminDoc?.name as string,
            email: adminDoc?.email as string,
            password: ''
        }

        return admin
    }

    logout(): Promise<Boolean> {
        throw new Error("Method not implemented.");
    }


    async fetchClassrooms(): Promise<ClassroomDocument[]> {
        try {
            return await ClassroomModel.find()
        } catch (error) {
            throw error
        }
    }

    async fetchTeachers(): Promise<TeacherDocument[]> {
        try {
            return await TeacherModel.find()
        } catch (error) {
            throw error
        }
    }

    async fetchStudents(): Promise<StudentDocument[]> {
        try {
            return await StudentModel.find()
        } catch (error) {
            throw error
        }
    }

    async fetchTeacherInfo(teacherId:string): Promise<TeacherDocument | null> {
         try {
           return await TeacherModel.findById(teacherId);
        } catch (error) {
            throw error;
        }
    }
    async fetchStudentInfo(studentId:string): Promise<StudentDocument | null> {
         try {
            return await StudentModel.findById(studentId)
        } catch (error) {
            throw error;
        }
    }
    async fetchClassroomInfo(classroomId:string): Promise<ClassroomDocument | null> {
         try {
            return await ClassroomModel.findById(classroomId);
        } catch (error) {
            throw error;
        }
    }

}