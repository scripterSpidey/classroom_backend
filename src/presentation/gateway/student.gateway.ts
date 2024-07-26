import { Request,Response,NextFunction } from "express";
import { I_StudentInteractor, ResendOTPInput } from "../../interface/student_interface/I_student.interactor";
import { accessTokenExpirationTime,refreshTokenExpirationTime } from "../../infrastructure/constants/appConstants";
import { CostumeError } from "../../utils/costume.error";
import { GoogleLoginInputType } from "../../schema/google.login.schema";
interface LoginReq{
    email: string,
    password:string
}

export class StudentController{
    private interactor: I_StudentInteractor;

    constructor(interactor:I_StudentInteractor){
        this.interactor = interactor
    };

    async onRegister(req:Request,res:Response,next:NextFunction){

        try {
            const data = req.body;
            const registered = await this.interactor.register(data);
            
            return res.status(201).json({...registered})
        } catch (error:any) {
            next(error)
        }

    } 

    async onVerifyOTP(req:Request,res:Response,next:NextFunction){
        try {
            const {otp,userId} = req.body ;
            
            const verifiedStatus = await this.interactor.verifyOTP(otp,userId);
            res.cookie("studentAccessToken",verifiedStatus.accessToken,{
                maxAge:accessTokenExpirationTime,
                httpOnly: true
            })
            res.cookie("studentRefreshToken",verifiedStatus.refreshToken,{
                maxAge:refreshTokenExpirationTime,
                httpOnly: true,
                // secure:true
            })

            
            res.status(201).json({
                verified:true,
                message:"OTP verification successfull",
                email:verifiedStatus.email,
                userId:verifiedStatus.userId,
                name:verifiedStatus.name
            })
        } catch (error) {
            next(error)
        }
    }

    async onLogin(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const {email,password} = req.body as LoginReq;
            const authenticated = await this.interactor.login(email,password);

            res.cookie("studentAccessToken",authenticated.accessToken,{
                maxAge:accessTokenExpirationTime,
                httpOnly: true,
            })

            res.cookie("studentRefreshToken",authenticated.refreshToken,{
                maxAge:refreshTokenExpirationTime,
                httpOnly: true,
            })

            res.status(authenticated.status).json({
                name:authenticated.name,
                email:authenticated.email,
                id:authenticated.id
            })
        } catch (error) {
            next(error);
        }
    }

    async onLogout(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const{userId} = req.body;
            await this.interactor.logout(userId);
            res.cookie('studentAccessToken','',{
                maxAge:0,
                httpOnly:true
            });
            res.cookie('studentRefreshToken','',{
                maxAge:0,
                httpOnly:true
            });
            res.status(200).json({
                authenticated:false
            })
        } catch (error) {
            
        }
    }

    async onResendOTP(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const data:ResendOTPInput = req.body  ;

            await this.interactor.resendOTP(data);

            res.status(200).json({
                resend:true,
                message:"OTP has been resended"
            })

        } catch (error) {
            next(error)
        }
        
    }

    async onGoogleLogin(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const data = req.body;

            const registerResponse = await this.interactor.googleLogin(data);

            res.cookie("studentAccessToken",registerResponse.accessToken,{
                maxAge:accessTokenExpirationTime,
                httpOnly: true,
            })

            res.cookie("studentRefreshToken",registerResponse.refreshToken,{
                maxAge:refreshTokenExpirationTime,
                httpOnly: true,
            })

            res.status(200).json(registerResponse)
        } catch (error) {
            next(error)
        }
    }

    onAuthRoute(req:Request,res:Response,next:NextFunction){
        return res.status(201).json({authenticated:"valid user"})
    }

}