
import { Request, Response, NextFunction } from "express";
import { ClassroomDocument, ClassroomModel } from "../../infrastructure/model/classroom.model";
import { CostumeRequest } from "../../interface/I_express.request";
import { I_TeacherClassroomInteractor } from "../../interface/classroom_interface/I_teacher.classroom.interactor";
import { studentIdParamType } from "../../schema/remove.student.schema";
import { saveMessageInput } from "../../schema/saveMessageSchema";
import { SendPrivateMessageBodyType,SendPrivateMessageParamsType } from "../../schema/send.private.message.schema";
import { ClassroomJwtPayload } from "../middleware/classroom.auth.middleware";



export class TeacherClassroomGateway {
    private interactor: I_TeacherClassroomInteractor;

    constructor(interactor: I_TeacherClassroomInteractor) {
        this.interactor = interactor;
    }

    async onCreateClassroom(req: CostumeRequest, res: Response, next: NextFunction) {
        const data = req.body;
        try {
            const response: ClassroomDocument = await this.interactor.createClassroom(data);

            res.status(201).json(response)
        } catch (error) {
            next(error)
        }
    }


    async onGetTeacherAllClassrooms(req: CostumeRequest, res: Response, next: NextFunction) {
        const data = req.params;
        const user = req.user;
        try {

            const classrooms = await this.interactor.getTeacherClassrooms(data, user);
            res.status(200).json(classrooms)
        } catch (error) {

        }
    }

    async onGetTeacherClassroom(req: CostumeRequest, res: Response, next: NextFunction) {
        try {
            const data = req.params;
            const user = req.user;

            const classroomDetails = await this.interactor.getTeacherClassroomDetails(data, user);
            res.cookie(
                'teacherClassroomToken',
                classroomDetails.classroomToken,
                { httpOnly: true }
            )
            res.status(200).json(classroomDetails)
        } catch (error) {
            next(error)
        }
    }




    async onAcceptJoiningRequest(req: CostumeRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = req.body;
            const user = req.user;
            const classroom = req.classroom;
         

            const accepted = await this.interactor.acceptJoiningRequest(classroom, user, body)

            res.status(200).json(accepted)

        } catch (error) {
            next(error)
        }
    }

    async onRejectJoinRequest(req: CostumeRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = req.body;
            const classroom = req.classroom;
            const user = req.user;

            const rejected = await this.interactor.acceptJoiningRequest(classroom, user, body)


            res.status(200).json(rejected)

        } catch (error) {
            next(error)
        }
    }

    async onGetStudentProfile(req: CostumeRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.params;

            const student = await this.interactor.getStudentProfile(data);
            res.status(200).json(student)
        } catch (error) {
            next(error)
        }
    }

    async onRemoveStudent(req: CostumeRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.params as studentIdParamType;
            const classroom = req.classroom as { classroom_id: string }
            await this.interactor.removeStudent(data, classroom);
            res.sendStatus(204)
        } catch (error) {
            next(error)
        }
    }

    async onBlockOrUnblockStudent(req: CostumeRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.params as studentIdParamType;
            const classroom = req.classroom!
            await this.interactor.blockOrUnblockOrStudent(data, classroom);
            res.sendStatus(204)
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