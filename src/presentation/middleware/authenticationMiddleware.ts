import { NextFunction,Request,Response } from "express";
import { I_AuthMiddlewareInteractor } from "../../interface/I_auth.middleware.interactor";
import { accessTokenExpirationTime } from "../../infrastructure/constants/appConstants";

interface authReqInput{
    studentAccessToken:string,
    studentRefreshToken:string
}

export class AuthMiddleware{
    private authInteractor: I_AuthMiddlewareInteractor;
    constructor(interactor:I_AuthMiddlewareInteractor){
        this.authInteractor = interactor;
    };

    async authenticateHandler(req:Request,res:Response,next:NextFunction){
        try {
            const {studentAccessToken,studentRefreshToken} = req.cookies as authReqInput;

            

            if(!studentAccessToken && !studentRefreshToken || (!studentRefreshToken)){
                return res.status(401).json({
                    authenticated:false,
                    message:"No user access token",
                    data:null
                })
            }

            if(studentAccessToken){
                const decryptedAccessToken =  this.authInteractor.decryptToken(studentAccessToken);

                switch(decryptedAccessToken.message){
    
                    case "Authenticated":
                        return next();
    
                    case "jwt expired":
    
                        const decryptedRefreshToken =  this.authInteractor.decryptToken(studentRefreshToken);
    
                        if(decryptedRefreshToken.message == 'invalid token' || decryptedRefreshToken.message=='jwt expired'){
                            return res.status(401).json({
                                authenticated:false,
                                message: decryptedRefreshToken.message
                            })
                        };
    
                        if(decryptedRefreshToken.payload){
    
                            const activeSession = await  this.authInteractor.validateSession(decryptedRefreshToken.payload.sessionId);
    
                            if(activeSession){
    
                                const newAccessToken = await this.authInteractor.newAccessToken(decryptedRefreshToken.payload.sessionId);
    
                                res.cookie("studentAccessToken",newAccessToken,{
                                    maxAge:accessTokenExpirationTime,
                                    httpOnly: true
                                });
    
                                return next();
                            }
                            
                            return res.status(401).json({authenticated:false})
                        }
    
                    case "invalid token":
    
                        return res.status(401).json({
                            authenticated:false,
                            message:'Invalid token'
                        })    
                }
            }
          
        } catch (error) {
            next(error)
        }
    }
}