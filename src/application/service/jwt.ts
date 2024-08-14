import { JwtPayload } from "jsonwebtoken";
import { I_JWT, JwtPayloadOutput, UserJwtPayload } from "../../interface/service_interface/I_jwt";
import jwt from "jsonwebtoken"
import { JWT_PRIVATE_KEY } from "../../infrastructure/constants/env";
import { JWT_PUBLIC_KEY } from "../../infrastructure/constants/env";

import { ClassroomJwtPayload } from "../../interface/I_classroom.auth.interactor";

export type JWToutput = {
    payload: UserJwtPayload | ClassroomJwtPayload | null,
    message: string
}



export class JWT implements I_JWT {

    constructor() { };


    generateToken(payload: object, expiresIn?: string | number | undefined): string {
        try {
            
            const options: jwt.SignOptions = { algorithm: 'RS256' }
            if (expiresIn) options.expiresIn = expiresIn;
            return jwt.sign(
                payload,
                JWT_PRIVATE_KEY,
                options
            )
        } catch (error) {
            throw error
        }
    }

    verifyToken(token: string): JWToutput {
        try {
            const decoded = jwt.verify(token, JWT_PUBLIC_KEY) as JwtPayloadOutput;
            return {
                payload: decoded,
                message: "Authenticated"
            }
        } catch (error: any) {
            return {
                payload: null,
                message: error.message
            }
        }
    }
    verifyRefreshToken(toke: string): JwtPayload | null {
        throw new Error("Method not implemented.");
    }

}