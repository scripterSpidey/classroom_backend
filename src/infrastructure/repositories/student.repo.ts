import { Student } from "../../domain/entities/student";
import { I_StudentRepo } from "../../interface/student_interface/I_student.repo";
import { StudentDocument, StudentModel } from "../model/student.model";
import { SessionDocument, SessionModel } from "../model/session.model";
import { stdSerializers } from "pino";


export type registerStudentOutput ={
    name: string,
    email: string,
}

export class StudentRepo implements I_StudentRepo{
    
    async verifyStudent(userId: string): Promise<StudentDocument|null> {
        try {
            return await StudentModel.findOneAndUpdate(
                {_id:userId},
                {$set:{verified:true}},
                {new:true}
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

    async findStudent(email: string): Promise<StudentDocument|null> {
        try {
            return await StudentModel.findOne({email:email})
            .populate('classrooms');
           
        } catch (error) {
            throw error
        }
    }

    async createSession(data:object):Promise<SessionDocument>{
        try {
            console.log(data)
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