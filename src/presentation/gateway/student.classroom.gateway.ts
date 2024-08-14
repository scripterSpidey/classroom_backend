import { I_StudentClassroomInteractor } from "../../interface/classroom_interface/I_student.classroom.interactor";
import { Request, Response, NextFunction } from "express";

import { CostumeRequest } from "../../interface/I_express.request";
import { saveMessageInput } from "../../schema/saveMessageSchema";
import { SendPrivateMessageBodyType, SendPrivateMessageParamsType } from "../../schema/send.private.message.schema";
import { ClassroomJwtPayload } from "../middleware/classroom.auth.middleware";

export class StudentClassroomGateway {
    private interactor: I_StudentClassroomInteractor;

    constructor(interactor: I_StudentClassroomInteractor) {
        this.interactor = interactor;
    }

    async onGetStudentAllClassrooms(req:CostumeRequest,res:Response,next:NextFunction):Promise<void>{
        const user = req.user;
       
        try {
            const response = await this.interactor.getAllClassroomsForStudent(user);
            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    } 

    async onSearchClassroom(req: CostumeRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.params;
            const user = req.user;
            
            const classroom = await this.interactor.findClassroom(data,user);
           
            res.status(200).json(classroom)
        } catch (error) {
            next(error)
        }
    }

    async onRequestToJoinClassroom(req: CostumeRequest, res: Response, next: NextFunction): Promise<void> {
        try {

            const data = req.params;
            const user = req.user;

            const requestToJoin = await this.interactor.requestToJoinClassroom(data,user);
            
            res.status(200).json(requestToJoin)
            
        } catch (error) {
            next(error)
        }
    }

    async onGetClassroomDetailsForStudent(req:CostumeRequest,res:Response,next:NextFunction){
        try {
            const user = req.user;
            const data = req.params;
            
            const classroom = await this.interactor.getClassroomDetailsForStudent(user,data);

            res.cookie(
                'studentClassroomToken',
                classroom.classroomToken,
                { httpOnly: true }
            )

            res.status(200).json(classroom)
        } catch (error) {
            next(error)
        }
    }

    async onGetClassroomMessages(req: CostumeRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user;
            const classroom = req.classroom;
            const response = await this.interactor.getClassroomMessages(user!, classroom!)
            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

    async onSendClassroomMessage(req: CostumeRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user;

            const classroom = req.classroom;

            const body:saveMessageInput = req.body;

            await this.interactor.sendClassroomMessage(user!, classroom!,body);

            res.status(200).json({message:'ok'})
        } catch (error) {
            next(error)
        }
    }

    async onSendPrivateMessage(req:CostumeRequest,res:Response,next:NextFunction){
        try {
            const user = req.user;
            const classroom =req.classroom;
            const body = req.body as SendPrivateMessageBodyType;
            const param = req.params as SendPrivateMessageParamsType;
            await this.interactor.sendPrivateMessage(user!,classroom!,body,param);
            res.status(200).json({message:'message send successfully'})
        } catch (error) {
           next(error) 
        }
    }

    async onGetPrivateMessages(req:CostumeRequest,res:Response,next:NextFunction){
        try {
            const user = req.user;
            const params =req.params as SendPrivateMessageParamsType;
            const classroom = req.classroom as ClassroomJwtPayload;
            const messages = await this.interactor.getPrivateMessages(user!,params,classroom);

            res.status(200).json(messages)
        } catch (error) {
            next(error)
        }
    }
}