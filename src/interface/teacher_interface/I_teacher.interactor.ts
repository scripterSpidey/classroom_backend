import { Teacher } from "../../domain/entities/teacher";

export type VerifyOTPInput={
    otp:string,
    userId:string
}

export interface I_TeacherInteractor{
    register(data:any):Promise<any>;
    verifyOTP(data:VerifyOTPInput):Promise<any>;
    login(data:any):Promise<any>;
    logout(userId:any):Promise<void>;
}