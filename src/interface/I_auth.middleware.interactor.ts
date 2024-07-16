import { JwtPayload } from "jsonwebtoken";
import { JWToutput } from "../application/service/jwt";

export interface I_AuthMiddlewareInteractor{
    decryptToken(accessToken:string):JWToutput;
    newAccessToken(data:string):Promise<String>;
    validateSession(data:string):Promise<boolean>;
}