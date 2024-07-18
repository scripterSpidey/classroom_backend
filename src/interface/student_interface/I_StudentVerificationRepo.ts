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
}

export interface I_StudentVerificationRepo{
    saveDocument(data:VerificationDocInputType):Promise<void>;
    updateDocument(data:string):Promise<void>;
    fetchOTP(data:string):Promise<any>;
}