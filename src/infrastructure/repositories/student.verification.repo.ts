import mongoose from "mongoose";
import { I_StudentVerificationRepo } from "../../interface/student_interface/I_StudentVerificationRepo";
import { I_VerificationDocument } from "../../interface/student_interface/I_studentVerification";
import { StudentVerificationModel } from "../model/student.verification.model";
import { VerificationDocInputType } from "../../interface/student_interface/I_StudentVerificationRepo";

export class StudentVerificationRepo implements I_StudentVerificationRepo{

    async fetchOTP(studentId: string): Promise<any> {
        try {
            const verificationDocument = await StudentVerificationModel.findOne({userId:studentId})
            
            return verificationDocument;
        } catch (error) {
            throw error
        }
        
    }

    async saveDocument(data: VerificationDocInputType): Promise<void> {
        try {
            const newDocument = await new StudentVerificationModel(data).save();
            
        } catch (error:any) {
            throw error
        }
    }

    updateDocument(data: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
}