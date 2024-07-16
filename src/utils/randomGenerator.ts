import crypto from "crypto"

export const  generateSecureOTP = ():string =>{
    const digits = '0123456789';
    let OTP = '';
    const bytes = crypto.randomBytes(5);
    for (let i = 0; i < 5; i++) {
        OTP += digits[bytes[i] % 10];
    }
    return OTP;
}


       