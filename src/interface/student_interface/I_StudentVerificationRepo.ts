import mongoose from "mongoose";
import { I_VerificationDocument } from "./I_student.verification";
import { VerificationCodeType } from "./I_student.verification";

export type VerificationDocInputType = {
    userId: string,
    type: VerificationCodeType,
    expiresAt: Date,
    otp:string,
    email:string,
    name:string,
    role:"student"|"teacher",
    createdAt: Date
}

export type UpdateOTPInput ={
    userId:string,
    otp:string|number
}

export interface I_StudentVerificationRepo{
    saveDocument(data:VerificationDocInputType):Promise<void>;
    fetchOTP(data:string):Promise<any>;
    updateOTP(data:UpdateOTPInput):Promise<any>
}