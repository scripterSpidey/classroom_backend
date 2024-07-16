
import { Student } from "../../domain/entities/student";
import { StudentDocument } from "../../infrastructure/model/student.model";
import { SessionDocument } from "../../infrastructure/model/session.model";
export interface I_StudentRepo{
    registerStudent(data:Student):Promise<any>;
    findStudent(email:string):Promise<StudentDocument|null>;
    verifyStudent(data:string):Promise<StudentDocument|null>;
    createSession(data:object):Promise<SessionDocument>;
    findSession(data:string):Promise<SessionDocument|null>;
    endSession(userId:string):Promise<void>;
}