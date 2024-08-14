import { NextFunction,Request,Response } from "express";
import { I_AuthMiddlewareInteractor } from "../../interface/I_auth.middleware.interactor";
import { accessTokenExpirationTime } from "../../infrastructure/constants/appConstants";
import { CostumeError } from "../../utils/costume.error";
import { CostumeRequest } from "../../interface/I_express.request";
import { UserJwtPayload } from "../../interface/service_interface/I_jwt";

interface authReqInput{
    studentAccessToken:string,
    studentRefreshToken:string
}

export class StudentAuthMiddleware{
    private authInteractor: I_AuthMiddlewareInteractor;
    constructor(interactor:I_AuthMiddlewareInteractor){
        this.authInteractor = interactor;
    };


    async authenticateStudent(req: CostumeRequest, res: Response, next: NextFunction) {

        const { studentAccessToken, studentRefreshToken } = req.cookies as authReqInput;

        try {
            if (studentAccessToken) {
                const decryptedAccessToken = this.authInteractor.decryptToken(studentAccessToken);

                if (decryptedAccessToken.message == 'Authenticated'){
                    req.user = decryptedAccessToken.payload as UserJwtPayload;
            
                    return next();
                } 

            }

            if (studentRefreshToken) {
                const decryptedRefreshToken = this.authInteractor.decryptToken(studentRefreshToken);
                
                if (decryptedRefreshToken.payload) {
                    const userPayload = decryptedRefreshToken.payload as UserJwtPayload;
                    const activeSession = await this.authInteractor.validateSession(userPayload.sessionId!);
                    
                    if (activeSession) {

                        const newAccessToken = await this.authInteractor.newAccessToken(decryptedRefreshToken.payload.sessionId);
                        req.user ={
                            userId:activeSession.userId
                        }

                        res.cookie("studentAccessToken", newAccessToken, {
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