
import mongoose from "mongoose";

export const enum VerificationCodeType{
    EmailVerification = 'email_verification',
    PasswordReset = "password_reset"
}

export interface I_VerificationDocument extends mongoose.Document{
    userId: mongoose.Types.ObjectId;
    name:string;
    email:string;
    type: VerificationCodeType;
    expiresAt: Date;
    createdAt:Date,
    updatedAt: Date,
    creationTime:Date,
    otp:string;
    role:string;
}