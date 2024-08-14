import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { ClassroomJwtPayload } from "./I_classroom.auth.interactor";
import { UserJwtPayload } from "./service_interface/I_jwt";

export interface CostumeRequest extends Request{
    file: any;
    user?:UserJwtPayload|null
    classroom:ClassroomJwtPayload|null
}