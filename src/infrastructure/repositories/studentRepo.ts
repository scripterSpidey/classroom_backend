import { Student } from "../../domain/entities/student";
import { I_StudentRepo } from "../../interface/student_interface/I_student.repo";
import { StudentDocument, StudentModel } from "../model/student.model";
import { SessionDocument, SessionModel } from "../model/session.model";

export type registerStudentOutput ={
    name: string,
    email: string,
}

export class StudentRepo implements I_StudentRepo{
    
    
    async verifyStudent(data: string): Promise<StudentDocument|null> {
        try {
            return await StudentModel.findOneAndUpdate(
                {userId:data},
                {$set:{verified:true}}
            )
        } catch (error) {
            throw error;
        }
        
    }

   

    async registerStudent(data: Student): Promise<any> {
      
        try {
            const newStudent = await new StudentModel(data).save();
            return {
                id:newStudent._id,
                name: newStudent.name,
                email: newStudent.email,
            }
        } catch (error) {
            console.log("Error saving document: ",error);
            throw error
        }
    }

    async findStudent(email: string): Promise<StudentDocument|null> {
        try {
            return await StudentModel.findOne({email});
        } catch (error) {
            throw error
        }
    }

    async createSession(data:object):Promise<SessionDocument>{
        try {
            return await new SessionModel(data).save()
        } catch (error) {
            throw error;
        }
    }

    async findSession(sessionId:string):Promise<SessionDocument|null>{
        try {
            return await SessionModel.findById(sessionId);
        } catch (error) {
            throw error;
        }
    }

    async endSession(userId: string): Promise<void> {
        try {
            await SessionModel.findOneAndUpdate(
                {userId},
                {active:false}
            )
        } catch (error) {
            throw error
        }
    }
    
}