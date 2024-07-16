
export interface I_TeacherInteractor{
    register(data:any):Promise<any>;
    verifyOTP(otp:string,studentId:string):Promise<any>;
    login(email:string,password:string):Promise<any>;
    logout(userId:string):Promise<void>;
}