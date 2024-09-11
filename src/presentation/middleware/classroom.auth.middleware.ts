import { Request, Response, NextFunction } from "express";
import {  I_ClassroomAuthInteractor } from "../../interface/I_classroom.auth.interactor";
import { CostumeError } from "../../utils/costume.error";
import { I_AuthMiddlewareInteractor } from "../../interface/I_auth.middleware.interactor";
import { CostumeRequest } from "../../interface/I_express.request";
import { JwtPayload } from "jsonwebtoken";
import { ClassroomJwtPayload } from "../../interface/service_interface/I_jwt";


export class ClassroomAuthMiddleware {

    private interactor: I_ClassroomAuthInteractor
    constructor(interactor: I_ClassroomAuthInteractor) {
        this.interactor = interactor;
    }
    async teacherClassroomGatekeeper(req: CostumeRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            
            const { teacherClassroomToken } = req.cookies;
            const teacher = req.user;
            if (teacherClassroomToken) {
                const classroom:ClassroomJwtPayload|null = await this.interactor.validateClassroomOwnership(teacherClassroomToken, teacher)
                req.classroom = classroom as ClassroomJwtPayload;
                return next()
            }
            throw new CostumeError(401, "No classroom access token!")
        } catch (error) {
            next(error)
        }
    }

    async studentClassroomGatekeeper(req: CostumeRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            
            const { studentClassroomToken } = req.cookies;
            const student = req.user;
            if (studentClassroomToken) {
                const classroom:ClassroomJwtPayload|null = await this.interactor.validateClassroomMembership(studentClassroomToken, student!)
                req.classroom = classroom as ClassroomJwtPayload;
                return next()
            }
            throw new CostumeError(401, "No student classroom access token!")
        } catch (error) {
            next(error)
        }
    }

}

export { ClassroomJwtPayload };
