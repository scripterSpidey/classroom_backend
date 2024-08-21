import {Request,Response, NextFunction } from "express"
import { addIssueToContext } from "zod";
import { I_JWT } from "../../interface/service_interface/I_jwt";
import { CostumeError } from "../../utils/costume.error";

export class AdminAuthMiddleware{
    private jwt : I_JWT;

    constructor(jwt:I_JWT){
        this.jwt = jwt 
    }

    authenticateAdmin(req:Request,res:Response,next:NextFunction){
        try {
            const {adminAccessToken} = req.cookies;
            if(adminAccessToken){
                const payload = this.jwt.verifyToken(adminAccessToken);
                if(payload.payload){
                   return  next()
                }
                throw new CostumeError(401,'Invlaid credentials: invalid token')
            }

            throw new CostumeError(401,'Invalid Credentials: No token')
        } catch (error) {
            next(error)
        }
    }
}