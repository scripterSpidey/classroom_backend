import { NextFunction, Request, Response } from "express";
import { I_AuthMiddlewareInteractor } from "../../interface/I_auth.middleware.interactor";
import { accessTokenExpirationTime } from "../../infrastructure/constants/appConstants";
import { CostumeError } from "../../utils/costume.error";
import { CostumeRequest } from "../../interface/I_express.request";
import { UserJwtPayload } from "../../interface/service_interface/I_jwt";


interface authReqInput {
    teacherAccessToken: string,
    teacherRefreshToken: string
}

export class TeacherAuthMiddleware {
    private authInteractor: I_AuthMiddlewareInteractor;
    constructor(interactor: I_AuthMiddlewareInteractor) {
        this.authInteractor = interactor;
    };

    async authenticateTeacher(req: CostumeRequest, res: Response, next: NextFunction) {

        const { teacherAccessToken, teacherRefreshToken } = req.cookies as authReqInput;

        try {
            if (teacherAccessToken) {
                const decryptedAccessToken = this.authInteractor.decryptToken(teacherAccessToken);

                if (decryptedAccessToken.message == 'Authenticated'){
                    const userPayload = decryptedAccessToken.payload as UserJwtPayload
                    req.user = userPayload;
                    return next();
                } 
 
            }

            if (teacherRefreshToken) {
                const decryptedRefreshToken = this.authInteractor.decryptToken(teacherRefreshToken);
                
                if (decryptedRefreshToken.payload) {
                    const userPayload = decryptedRefreshToken.payload as UserJwtPayload
                    const activeSession = await this.authInteractor.validateSession(userPayload.sessionId!);
                    
                    if (activeSession) {
                        
                        const newAccessToken = await this.authInteractor.newAccessToken(decryptedRefreshToken.payload.sessionId);
                        req.user = userPayload
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