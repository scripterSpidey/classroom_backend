import { Student } from "../../domain/entities/student";
import { StudentDocument } from "../../infrastructure/model/student.model";

export interface I_StudentInteractor{
    register(data:Student):Promise<any>;
    verifyOTP(otp:string,studentId:string):Promise<any>;
    login(email:string,password:string):Promise<any>;
    logout(userId:string):Promise<void>;
}