import { NextFunction,Request,Response } from "express";
import { I_TeacherInteractor } from "../../interface/teacher_interface/I_teacher.interactor";
import { accessTokenExpirationTime, refreshTokenExpirationTime } from "../../infrastructure/constants/appConstants";
import { CostumeRequest } from "../../interface/I_express.request";


export class TeacherController{
    private interactor: I_TeacherInteractor;

    constructor(
        interactor:I_TeacherInteractor
    ){
        this.interactor = interactor;
    }


    async onRegister(req:Request,res:Response,next:NextFunction){
        try {
            const data = req.body;

            const registerTeacher = await this.interactor.register(data);

            res.status(201).json(registerTeacher);

        } catch (error) {
            next(error)
        }
    }

    async onVerifyOTP(req:Request,res:Response,next:NextFunction){
        try {
            const data = req.body;

            const otpVerified = await this.interactor.verifyOTP(data);

            res.cookie('teacherAccessToken',otpVerified.accessToken,{
                maxAge:accessTokenExpirationTime,
                httpOnly:true
            });

            res.cookie('teacherRefreshToken',otpVerified.refreshToken,{
                maxAge:refreshTokenExpirationTime,
                httpOnly:true
            })

            res.status(200).json(otpVerified)
        } catch (error) {
            next(error)
        }
    }

    async onLogin(req:Request,res:Response,next:NextFunction){
        try {
            const data = req.body;
            const authenticated = await this.interactor.login(data);

            res.cookie('teacherAccessToken',authenticated.accessToken,{
                maxAge:accessTokenExpirationTime,
                httpOnly:true
            })

            res.cookie('teacherRefreshToken',authenticated.refreshToken,{
                maxAge:refreshTokenExpirationTime,
                httpOnly:true
            })

            res.status(200).json(authenticated)
        } catch (error) {
            next(error)
        }
    }

    async onLogout(req:Request,res:Response,next:NextFunction){
        try {
            const data = req.body;
            await this.interactor.logout(data);

            res.cookie('teacherAccessToken','',{
                maxAge:0,
                httpOnly:true
            })

            res.cookie('teacherRefreshToken','',{
                maxAge:0,
                httpOnly:true
            });

            res.status(200).json({
                authenticated:false,
                message:"loggedout successfully"
            })
        } catch (error) {
            next(error)
        }
    }

    async onGoogleLogin(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const data = req.body;

            const registerResponse = await this.interactor.googleLogin(data);
            console.log(registerResponse)
            res.cookie("teacherAccessToken",registerResponse.accessToken,{
                maxAge:accessTokenExpirationTime,
                httpOnly: true,
            })

            res.cookie("teacherRefreshToken",registerResponse.refreshToken,{
                maxAge:refreshTokenExpirationTime,
                httpOnly: true,
            })

            res.status(200).json(registerResponse)
        } catch (error) {
            next(error)
        }
    }

    


    onAuthRoute(req:CostumeRequest,res:Response,next:NextFunction){
        const user = req.user;
        console.log('user',user)
        res.status(201).json(user)
    }

}   