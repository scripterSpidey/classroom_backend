import { ClassroomDocument } from "../../infrastructure/model/classroom.model";
import { CreateClassroomInputType } from "../../schema/create.classroom.schema";

export interface I_ClassroomInteractor{
    createClassroom(data:CreateClassroomInputType):Promise<any>;
    getTeacherClassrooms(data:any,user:any):Promise<ClassroomDocument[]|[]>;
    getTeacherClassroomDetails(data:any,user:any):Promise<ClassroomDocument|null>;
    findClassroom(data:any,user:any):Promise<ClassroomDocument|null>;
    requestToJoinClassroom(data:any,user:any):Promise<any>;
    acceptJoiningRequest(data:any,user:any,body:any):Promise<ClassroomDocument>;
    rejectJoiningRequest(data:any,user:any,body:any):Promise<any>;
    getAllClassroomsForStudent(data:any):Promise<any>;
    getClassroomDetailsForStudent(user:any,data:any):Promise<ClassroomDocument|null>;
}