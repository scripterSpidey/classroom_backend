import { Request,Response,NextFunction } from "express";
import { I_StudentInteractor } from "../../interface/student_interface/I_student.interactor";
import { accessTokenExpirationTime,refreshTokenExpirationTime } from "../../infrastructure/constants/appConstants";
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
        
            return res.status(registered.status).json({
                registered:registered.registered,
                message:registered.message,
                data:registered.data
            })
        } catch (error:any) {
            next(error)
        }

    } 

    async onVerifyOTP(req:Request,res:Response,next:NextFunction){
        try {
            const {otp,studentId} = req.body ;
            const verifiedStatus = await this.interactor.verifyOTP(otp,studentId);
            res.cookie("studentAccessToken",verifiedStatus.accessToken,{
                maxAge:accessTokenExpirationTime,
                httpOnly: true
            })
            res.cookie("studentRefreshToken",verifiedStatus.refreshToken,{
                maxAge:refreshTokenExpirationTime,
                httpOnly: true,
                // secure:true
            })

            res.status(verifiedStatus.status).json(verifiedStatus)
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
                // secure:true
            })

            res.cookie("studentRefreshToken",authenticated.refreshToken,{
                maxAge:refreshTokenExpirationTime,
                httpOnly: true,
                // secure:true
            })

            // delete authenticated.accessToken;

            res.status(authenticated.status).json(authenticated)
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
            res.status(200).json({
                authenticated:false
            })
        } catch (error) {
            
        }
    }

    onAuthRoute(req:Request,res:Response,next:NextFunction){
        return res.status(201).json({authenticated:"valid user"})
    }

}