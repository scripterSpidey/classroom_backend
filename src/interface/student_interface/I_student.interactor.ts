import { Student } from "../../domain/entities/student";
import { StudentDocument } from "../../infrastructure/model/student.model";
import { GoogleLoginInputType } from "../../schema/google.login.schema";


export type ResendOTPInput ={
    userId:string,
    userEmail: string
}
export interface I_StudentInteractor{
    register(data:Student):Promise<any>;
    verifyOTP(otp:string,studentId:string):Promise<any>;
    login(email:string,password:string):Promise<any>;
    logout(userId:string):Promise<void>;
    resendOTP(data:ResendOTPInput):Promise<any>;
    googleLogin(data:GoogleLoginInputType):Promise<any>;
}