import { Teacher } from "../../domain/entities/teacher";
import { SessionDocument } from "../../infrastructure/model/session.model";
import { TeacherDocument } from "../../infrastructure/model/teacher.model";
import { I_VerificationDocument } from "../student_interface/I_student.verification";

export interface I_TeacherRepo{
    registerTeacher(data:Teacher):Promise<TeacherDocument>;

    findTeacher(email:string):Promise<TeacherDocument|null>;

    getVerificationDocument(userId:string):Promise<I_VerificationDocument|null>;

    verifyTeacher(userId:string):Promise< TeacherDocument|null >;

    createSession(data:object):Promise<SessionDocument>;

    findSession(data:string):Promise<any|null>;

    endSession(userId:string,endTime:Date):Promise<void>;

    createVerificationDocument(data:any):Promise<any>;
}