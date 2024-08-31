import { Student } from "../../domain/entities/student";
import { I_StudentRepo } from "../../interface/student_interface/I_student.repo";
import { StudentDocument, StudentModel } from "../model/student.model";
import { SessionDocument, SessionModel } from "../model/session.model";



export type registerStudentOutput = {
    name: string,
    email: string,
}

export class StudentRepo implements I_StudentRepo {


    async verifyStudent(userId: string): Promise<StudentDocument | null> {
        try {
            return await StudentModel.findOneAndUpdate(
                { _id: userId },
                { $set: { verified: true } },
                { new: true }
            ).select('-password')
        } catch (error) {
            throw error;
        }
    }

    async registerStudent(data: Student): Promise<any> {

        try {
            const newStudent = await new StudentModel(data).save();
            newStudent.password = '';
            return newStudent;
        } catch (error) {

            throw error
        }
    }

    async findStudent(email: string): Promise<StudentDocument | null> {
        try {
            return await StudentModel.findOne({ email: email })
                

        } catch (error) {
            throw error
        }
    }

    async findStudentById(student_id: string): Promise<StudentDocument | null> {
        try {
            return await StudentModel.findById(student_id)
        } catch (error) {
            throw error;
        }
    }
    

    async createSession(data: object): Promise<SessionDocument> {
        try {
         
            return await new SessionModel(data).save()
        } catch (error) {
            throw error;
        }
    }

    async findSession(sessionId: string): Promise<SessionDocument | null> {
        try {
            return await SessionModel.findById(sessionId);
        } catch (error) {
            throw error;
        }
    }

    async endSession(userId: string): Promise<void> {
        try {
            await SessionModel.findOneAndUpdate(
                { userId },
                { active: false }
            )
        } catch (error) {
            throw error
        }
    }


    async saveProfileImage(userId: string, imageName: string): Promise<StudentDocument | null> {
        try {
            return await StudentModel.findByIdAndUpdate(
                userId,
                { profile_image: imageName },
                { new: true }
            ).select('-password');

        } catch (error) {
            throw error
        }
    }

    async saveResetPasswordToken(studentId:string,token:string,tokenExpires:Date):Promise<void>{
        try {
            await StudentModel.findByIdAndUpdate(
                studentId,
                {$set:{resetPasswordToken:token,resetPasswordTokenExpires:tokenExpires}}
            )
        } catch (error) {
            throw error
        }
    }

    async findStudentByToken(token:string):Promise<StudentDocument|null>{
        try {
            return await StudentModel.findOne({
                resetPasswordToken:token,
                resetPasswordTokenExpires:{$gt:new Date()}
            })
        } catch (error) {
            throw error
        }
    }

    async updatePassword(newPassword:string,studentId:string):Promise<void>{
        try {
            await StudentModel.findByIdAndUpdate(
                studentId,
                {$set:{password:newPassword}}
            )
        } catch (error) {
            throw error
        }
    }

}