import { Teacher } from "../../domain/entities/teacher";
import { GoogleLoginInputType } from "../../schema/google.login.schema";

export type VerifyOTPInput={
    otp:string,
    userId:string
}

type ResendOTPInput ={
    userId:string,
    userEmail: string
}

export interface I_TeacherInteractor{
    register(data:any):Promise<any>;
    verifyOTP(data:VerifyOTPInput):Promise<any>;
    login(data:any):Promise<any>;
    logout(userId:any):Promise<void>;
    resendOTP(data:ResendOTPInput):Promise<any>;
    googleLogin(data:GoogleLoginInputType):Promise<any>;
}