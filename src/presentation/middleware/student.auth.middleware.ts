import { NextFunction,Request,Response } from "express";
import { I_AuthMiddlewareInteractor } from "../../interface/I_auth.middleware.interactor";
import { accessTokenExpirationTime } from "../../infrastructure/constants/appConstants";
import { CostumeError } from "../../utils/costume.error";

interface authReqInput{
    studentAccessToken:string,
    studentRefreshToken:string
}

export class StudentAuthMiddleware{
    private authInteractor: I_AuthMiddlewareInteractor;
    constructor(interactor:I_AuthMiddlewareInteractor){
        this.authInteractor = interactor;
    };


    async authenticateStudent(req: Request, res: Response, next: NextFunction) {

        const { studentAccessToken, studentRefreshToken } = req.cookies as authReqInput;

        try {
            if (studentAccessToken) {
                const decryptedAccessToken = this.authInteractor.decryptToken(studentAccessToken);

                if (decryptedAccessToken.message == 'Authenticated') return next();

            }

            if (studentRefreshToken) {
                const decryptedRefreshToken = this.authInteractor.decryptToken(studentRefreshToken);
                
                if (decryptedRefreshToken.payload) {
                    const activeSession = await this.authInteractor.validateSession(decryptedRefreshToken.payload.sessionId);
                    
                    if (activeSession) {

                        const newAccessToken = await this.authInteractor.newAccessToken(decryptedRefreshToken.payload.sessionId);

                        res.cookie("teacherAccessToken", newAccessToken, {
                            maxAge: accessTokenExpirationTime,
                            httpOnly: true
                        });

                        return next();
                    }
                }
            }

            throw new CostumeError(401, "Invalid credentials");
        } catch (error) {
            next(error)
        }
    }
}