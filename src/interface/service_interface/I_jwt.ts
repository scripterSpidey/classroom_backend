import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { JWToutput } from "../../application/service/jwt";


export interface UserJwtPayload extends JwtPayload {
    userId:string | Types.ObjectId
    sessionId?:string,
    role?:string
}

export interface ClassroomJwtPayload extends JwtPayload{
    classroom_id:string,
    class_teacher_id:string,
    student_id:string
}


export type JwtPayloadOutput= UserJwtPayload | ClassroomJwtPayload
export interface I_JWT{
    generateToken(payload: object, expiresIn?: string|number|undefined):string;
    // JWTrefreshToken(userId:string,role:string):string;
    verifyToken(token:string):JWToutput;
    // verifyRefreshToken(toke:string):JwtPayload|null;
}
