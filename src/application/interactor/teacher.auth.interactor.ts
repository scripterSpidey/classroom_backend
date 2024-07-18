import { I_AuthMiddlewareInteractor } from "../../interface/I_auth.middleware.interactor";
import { I_JWT } from "../../interface/service_interface/I_jwt";
import { I_TeacherRepo } from "../../interface/teacher_interface/I_teacher.repo";
import { JWToutput } from "../service/jwt";


export class TeacherAuthInteractor implements I_AuthMiddlewareInteractor{
    private jwt: I_JWT;
    private repository:I_TeacherRepo;
    constructor(
        jwt:I_JWT,
        repository:I_TeacherRepo){
        this.jwt = jwt;
        this.repository = repository;
    }

    async validateSession(sessionId: string):Promise< boolean >{
        try {
            const session = await  this.repository.findSession(sessionId);
            if(session && session.active && session.role == 'teacher'){
                return true
            } 
            return false
        } catch (error) {
            throw error;
        }
    }

    async newAccessToken(sessionId: string):Promise< String> {

        try {
            const session = await  this.repository.findSession(sessionId);

            const accessToken = this.jwt.generateToken({
                userId:session?.userId,
                sessionId:session?._id
            },'2m')

            return accessToken
        } catch (error) {
            throw error
        }
        
    }

    decryptToken(accessToken:string): JWToutput {
        try {
            return this.jwt.verifyToken(accessToken);

        } catch (error) {
            throw error;
        }
    } 
}