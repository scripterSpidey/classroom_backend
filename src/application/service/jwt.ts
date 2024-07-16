import { JwtPayload } from "jsonwebtoken";
import { I_JWT } from "../../interface/service_interface/I_jwt";
import jwt from "jsonwebtoken"
import { JWT_PRIVATE_KEY } from "../../infrastructure/constants/env";
import { JWT_PUBLIC_KEY } from "../../infrastructure/constants/env";
import { number, object } from "zod";

export type JWToutput = {
    payload: JwtPayload  | null,
    message: string
}


export class JWT implements I_JWT{

    constructor(){};


    generateToken(payload: object, expiresIn: string|number): string {

        return jwt.sign(payload,JWT_PRIVATE_KEY,{algorithm:'RS256',expiresIn})
        
    }
    verifyToken(token: string): JWToutput | null {
        try {
            const decoded = jwt.verify(token,JWT_PUBLIC_KEY) as JwtPayload;
            return {
                payload: decoded,
                message: "Authenticated"
            } 
        } catch (error:any) {
            return {
                payload : null,
                message: error.message
            }
        }
    }
    verifyRefreshToken(toke: string): JwtPayload | null {
        throw new Error("Method not implemented.");
    }
    
}