import { I_AuthMiddlewareInteractor } from "../../interface/I_auth.middleware.interactor";
import { I_JWT } from "../../interface/service_interface/I_jwt";
import { I_StudentRepo } from "../../interface/student_interface/I_student.repo";
import { JWToutput } from "../service/jwt";


export class StudentAuthInteractor implements I_AuthMiddlewareInteractor{
    private jwt: I_JWT;
    private repository:I_StudentRepo;
    constructor(
        jwt:I_JWT,
        repository:I_StudentRepo){
        this.jwt = jwt;
        this.repository = repository;
    }

    async validateSession(sessionId: string):Promise< boolean >{
        try {
            const session = await  this.repository.findSession(sessionId);
            if(session && session.active && session.role=='student'){
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