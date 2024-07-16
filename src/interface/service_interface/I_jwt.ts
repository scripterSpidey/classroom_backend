import { JwtPayload } from "jsonwebtoken";

export interface I_JWT{
    generateToken(payload: object, expiresIn: string|number):string;
    // JWTrefreshToken(userId:string,role:string):string;
    verifyToken(token:string):any;
    // verifyRefreshToken(toke:string):JwtPayload|null;
}
