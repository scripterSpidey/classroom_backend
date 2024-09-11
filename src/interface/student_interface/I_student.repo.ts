
import { Student } from "../../domain/entities/student";
import { StudentDocument } from "../../infrastructure/model/student.model";
import { SessionDocument } from "../../infrastructure/model/session.model";
import { I_VerificationDocument } from "./I_student.verification";
export interface I_StudentRepo{
    registerStudent(data:Student):Promise<StudentDocument>;
    findStudent(email:string):Promise<StudentDocument|null>;
    findStudentById(student_id:string):Promise<StudentDocument|null>
    verifyStudent(data:string):Promise<StudentDocument|null>;
    createSession(data:object):Promise<SessionDocument>;
    findSession(data:string):Promise<SessionDocument|null>;
    endSession(userId:string):Promise<void>;
    saveProfileImage(userId:string,imageName:string):Promise<StudentDocument|null>;

    saveResetPasswordToken(studentId:string,token:string,tokenExpires:Date):Promise<void>;

    findStudentByToken(token:string):Promise<StudentDocument|null>;

    updatePassword(newPassword:string,studentId:string):Promise<void>;

    
}