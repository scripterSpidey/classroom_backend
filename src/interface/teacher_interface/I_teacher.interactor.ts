import { JwtPayload } from "jsonwebtoken";
import { Teacher } from "../../domain/entities/teacher";
import { TeacherDocument } from "../../infrastructure/model/teacher.model";
import { GoogleLoginInputType } from "../../schema/google.login.schema";
import { UserJwtPayload } from "../service_interface/I_jwt";

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
    uploadProfileImage(user:JwtPayload|null|undefined,file:Express.Multer.File):Promise<TeacherDocument|null>;
    validateTeacher(user:UserJwtPayload):Promise<TeacherDocument|null>;
    forgotPassword(data:{email:string}):Promise<void>;
    resetPassword(data:{resetPasswordToken:string},body:{newPassword:string}):Promise<void>
}