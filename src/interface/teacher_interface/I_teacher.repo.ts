
export interface I_StudentRepo{
    registerStudent(data:any):Promise<any>;
    findStudent(email:string):Promise<any|null>;
    verifyStudent(data:string):Promise<any|null>;
    createSession(data:object):Promise<any>;
    findSession(data:string):Promise<any|null>;
    endSession(userId:string):Promise<void>;
}