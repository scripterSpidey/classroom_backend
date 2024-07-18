import { NextFunction,Request,Response } from "express";
import { I_AuthMiddlewareInteractor } from "../../interface/I_auth.middleware.interactor";
import { accessTokenExpirationTime } from "../../infrastructure/constants/appConstants";
import { CostumeError } from "../../utils/costume.error";

interface authReqInput{
    teacherAccessToken:string,
    teacherRefreshToken:string
}

export class TeacherAuthMiddleware{
    private authInteractor: I_AuthMiddlewareInteractor;
    constructor(interactor:I_AuthMiddlewareInteractor){
        this.authInteractor = interactor;
    };

    async authenticateHandler(req:Request,res:Response,next:NextFunction){
        try {
            const {teacherAccessToken,teacherRefreshToken} = req.cookies as authReqInput;
            console.log(req.cookies)
            console.log('access: ',teacherAccessToken,'refresh: ',teacherRefreshToken)
            if(!teacherAccessToken && !teacherRefreshToken || (!teacherRefreshToken)){
               throw new CostumeError(401,"No user accesstoken")
            }

            if(teacherAccessToken){
                const decryptedAccessToken =  this.authInteractor.decryptToken(teacherAccessToken);
                console.log('toekn ',decryptedAccessToken)
                switch(decryptedAccessToken.message){
    
                    case "Authenticated":
                        return next();
    
                    case "jwt expired":
                        const decryptedRefreshToken =  this.authInteractor.decryptToken(teacherRefreshToken);

                        if(decryptedRefreshToken.message != 'Authenticated' ){
                           throw new CostumeError(401,decryptedRefreshToken.message)
                        };
    
                        if(decryptedRefreshToken.payload){
    
                            const activeSession = await  this.authInteractor.validateSession(decryptedRefreshToken.payload.sessionId);
    
                            if(activeSession){
    
                                const newAccessToken = await this.authInteractor.newAccessToken(decryptedRefreshToken.payload.sessionId);
    
                                res.cookie("teacherAccessToken",newAccessToken,{
                                    maxAge:accessTokenExpirationTime,
                                    httpOnly: true
                                });
    
                                return next();
                            }
                            
                           throw new CostumeError(401,"Session ended")
                        }
    
                    case "invalid token":
                        throw new CostumeError(401,"Invalid token")
                    case "jwt malformed":
                        throw new CostumeError(401,"Invalid Token")  
                }
            }
          
        } catch (error) {
            next(error)
        }
    }
}