import { JwtPayload } from "jsonwebtoken";
import { ClassroomDocument } from "../infrastructure/model/classroom.model";

import { ClassroomJwtPayload } from "./service_interface/I_jwt";





export interface I_ClassroomAuthInteractor{

    validateClassroomOwnership(token:string,user:JwtPayload|undefined|null):Promise<ClassroomJwtPayload|null>;

    validateClassroomMembership(token: string, user: JwtPayload | undefined):Promise<ClassroomJwtPayload|null>
}

export { ClassroomJwtPayload };
