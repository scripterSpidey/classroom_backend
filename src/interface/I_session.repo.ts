import { Primitive } from "zod";
import { roleType } from "../infrastructure/model/session.model"
import { StudentDocument } from "../infrastructure/model/student.model";

export type SessionRepoInputType={
    userId:string,
    role: roleType,
    device: string,
    expiresAt: Date 
}

export interface I_SessionRepo{
    createSession(data:SessionRepoInputType):Promise<StudentDocument>;
    findSession(sessionId:string):Promise<any>;
}