import { object,string, TypeOf } from "zod";


export const verificationOTPSchema = object({
    body: object({
        userId:string({
            required_error:"userId is not provided"
        }),
        otp:string({
            required_error:"OTP is required"
        }).min(5,"OTP must be 5 letters long")
    })
});

export type verificationOTPInput = TypeOf<typeof verificationOTPSchema>