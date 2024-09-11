import { Request, Response, NextFunction } from "express";
import { I_StudentInteractor, ResendOTPInput } from "../../interface/student_interface/I_student.interactor";
import { accessTokenExpirationTime, refreshTokenExpirationTime } from "../../infrastructure/constants/appConstants";
import { CostumeError } from "../../utils/costume.error";
import { GoogleLoginInputType } from "../../schema/google.login.schema";
import { CostumeRequest } from "../../interface/I_express.request";
interface LoginReq {
    email: string,
    password: string
}

export class StudentController {
    private interactor: I_StudentInteractor;

    constructor(interactor: I_StudentInteractor) {
        this.interactor = interactor
    };

    async onRegister(req: Request, res: Response, next: NextFunction) {

        try {
            const data = req.body;
            const registered = await this.interactor.register(data);

            return res.status(201).json({ ...registered })
        } catch (error: any) {
            next(error)
        }

    }

    async onVerifyOTP(req: Request, res: Response, next: NextFunction) {
        try {
            const { otp, userId } = req.body;

            const verifiedStatus = await this.interactor.verifyOTP(otp, userId);
            
            res.cookie("studentAccessToken", verifiedStatus.accessToken, {
                maxAge: accessTokenExpirationTime,
                httpOnly: true
            })
            res.cookie("studentRefreshToken", verifiedStatus.refreshToken, {
                maxAge: refreshTokenExpirationTime,
                httpOnly: true,
                // secure:true
            })


            res.status(201).json(verifiedStatus)
        } catch (error) {
            next(error)
        }
    }

    async onLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body as LoginReq;
            const authenticated = await this.interactor.login(email, password);

            res.cookie("studentAccessToken", authenticated.accessToken, {
                maxAge: accessTokenExpirationTime,
                httpOnly: true,
            })

            res.cookie("studentRefreshToken", authenticated.refreshToken, {
                maxAge: refreshTokenExpirationTime,
                httpOnly: true,
            })

            res.status(200).json(authenticated)
        } catch (error) {
            next(error);
        }
    }

    async onLogout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.body;
            await this.interactor.logout(userId);
            res.cookie('studentAccessToken', '', {
                maxAge: 0,
                httpOnly: true
            });
            res.cookie('studentRefreshToken', '', {
                maxAge: 0,
                httpOnly: true
            });
            res.status(200).json({
                authenticated: false
            })
        } catch (error) {

        }
    }

    async onResendOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: ResendOTPInput = req.body;

            await this.interactor.resendOTP(data);

            res.status(200).json({
                resend: true,
                message: "OTP has been resended"
            })

        } catch (error) {
            next(error)
        }

    }

    async onGoogleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body;

            const registerResponse = await this.interactor.googleLogin(data);

            res.cookie("studentAccessToken", registerResponse.accessToken, {
                maxAge: accessTokenExpirationTime,
                httpOnly: true,
            })

            res.cookie("studentRefreshToken", registerResponse.refreshToken, {
                maxAge: refreshTokenExpirationTime,
                httpOnly: true,
            })

            res.status(200).json(registerResponse)
        } catch (error) {
            next(error)
        }
    }

    onGetProfile(req: Request, res: Response, next: NextFunction) {
        const user = req.user;
        try {

        } catch (error) {

        }
    }

    async onProfielImageUpload(req: Request, res: Response, next: NextFunction) {

        const user = req.user;

        const file = req.file 
        try {
            const response = await this.interactor.uploadProfileImage(user, file!);
            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

    async onAuthRoute(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            const student = await this.interactor.validateStudent(user)
       
            res.status(201).json(student);
        } catch (error) {
            next(error)
        }

    }

    async onForgotPassword(req: Request, res: Response, next: NextFunction) {
        const body = req.body as { email: string }
        try {
            console.log(req.headers.host)
            await this.interactor.forgotPassword(body)
            res.status(200).json('response')
        } catch (error) {
            next(error)
        }
    }

    async onResetPassword(req: Request, res: Response, next: NextFunction) {
        const params = req.params as { resetPasswordToken: string }
        const body = req.body as { newPassword: string }
        try {
            console.log(params)
            await this.interactor.resetPassword(params,body)
            res.status(200).json('response')
        } catch (error) {
            next(error)
        }
    }
}