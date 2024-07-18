import { NextFunction,Request,Response } from "express";
import { I_TeacherInteractor } from "../../interface/teacher_interface/I_teacher.interactor";
import { accessTokenExpirationTime, refreshTokenExpirationTime } from "../../infrastructure/constants/appConstants";


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
            res.status(200).json({
                authenticated:false,
                message:"loggedout successfully"
            })
        } catch (error) {
            next(error)
        }
    }

    onAuthRoute(req:Request,res:Response,next:NextFunction){
        return res.status(201).json({authenticated:"valid user"})
    }

}