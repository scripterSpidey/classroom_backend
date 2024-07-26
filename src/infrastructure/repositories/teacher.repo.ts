import { Teacher } from "../../domain/entities/teacher";
import { I_TeacherRepo } from "../../interface/teacher_interface/I_teacher.repo";
import { TeacherDocument, TeacherModel } from "../model/teacher.model";
import { VerificationModel } from "../model/verification.model";
import { I_VerificationDocument } from "../../interface/student_interface/I_student.verification";
import { SessionDocument, SessionModel } from "../model/session.model";


export class TeacherRepo implements I_TeacherRepo{
    
    async registerTeacher(data: Teacher): Promise<TeacherDocument> {
        try {
            const newTeacher = await new TeacherModel(data).save();
            return newTeacher
        } catch (error) {
            throw error
        }
    }

    async findTeacher(email: string): Promise<TeacherDocument | null> {
        try {
            return await TeacherModel.findOne({email});
        } catch (error) {
            throw error
        }
    }

    async getVerificationDocument(userId: string): Promise<I_VerificationDocument | null> {
        try {
            return await VerificationModel.findOne({userId})
        } catch (error) {
            throw error
        }
    }

    async verifyTeacher(userId:string): Promise< TeacherDocument|null > {
        try {
            const verify = await TeacherModel.findByIdAndUpdate(
                userId,
                {verified:true}
            );

            await VerificationModel.deleteOne({userId});

            return verify;
            
        } catch (error) {
            throw error
        }
    }

    async createSession(data: object): Promise<SessionDocument> {
        try {
            return await new SessionModel(data).save()
        } catch (error) {
            throw error
        }
    }

    async findSession(sessionId: string): Promise<SessionDocument | null> {
        try {
            return await SessionModel.findById(sessionId);
        } catch (error) {
            throw error
        }

    }

    async endSession(userId: string,endTime:Date): Promise<void> {
        try {
            await SessionModel.findOneAndUpdate(
                {userId},
                {$set:{active:false,endedAt:endTime}}
            )
        } catch (error) {
            throw error
        }
    }

    async createVerificationDocument(data: any): Promise<any> {
        try {
            await new VerificationModel(data).save();
        } catch (error) {
            throw error
        }
    }
}