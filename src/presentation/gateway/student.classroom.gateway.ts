import { I_StudentClassroomInteractor } from "../../interface/classroom_interface/I_student.classroom.interactor";
import { Request, Response, NextFunction } from "express";

import { CostumeRequest } from "../../interface/I_express.request";
import { saveMessageInput } from "../../schema/saveMessageSchema";
import { SendPrivateMessageBodyType, SendPrivateMessageParamsType } from "../../schema/send.private.message.schema";
import { ClassroomJwtPayload } from "../middleware/classroom.auth.middleware";
import { UploadMaterialBodyType } from "../../schema/upload.material.schema";
import { SubmitWorkQueryType } from "../../schema/work.schema";
import { UserJwtPayload } from "../../interface/service_interface/I_jwt";
import { SubmitExamType } from "../../schema/exam.schema";
import { NODE_ENV } from "../../infrastructure/constants/env";

export class StudentClassroomGateway {
    private interactor: I_StudentClassroomInteractor;

    constructor(interactor: I_StudentClassroomInteractor) {
        this.interactor = interactor;
    }

    async onGetStudentAllClassrooms(req: Request, res: Response, next: NextFunction): Promise<void> {
        const user = req.user;

        try {
            const response = await this.interactor.getAllClassroomsForStudent(user);
            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

    async onSearchClassroom(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.params;
            const user = req.user;

            const classroom = await this.interactor.findClassroom(data, user);

            res.status(200).json(classroom)
        } catch (error) {
            next(error)
        }
    }

    async onRequestToJoinClassroom(req: CostumeRequest, res: Response, next: NextFunction): Promise<void> {
        try {

            const data = req.params;
            const user = req.user;

            const requestToJoin = await this.interactor.requestToJoinClassroom(data, user);

            res.status(200).json(requestToJoin)

        } catch (error) {
            next(error)
        }
    }

    async onGetClassroomDetailsForStudent(req: CostumeRequest, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            const data = req.params;

            const classroom = await this.interactor.getClassroomDetailsForStudent(user, data);

            res.cookie(
                'studentClassroomToken',
                classroom.classroomToken,
                {
                    httpOnly: true,
                    secure: NODE_ENV === 'production',
                    sameSite: 'none'
                }
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

            const body: saveMessageInput = req.body;

            await this.interactor.sendClassroomMessage(user!, classroom!, body);

            res.status(200).json({ message: 'ok' })
        } catch (error) {
            next(error)
        }
    }

    async onSendPrivateMessage(req: CostumeRequest, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            const classroom = req.classroom;
            const body = req.body as SendPrivateMessageBodyType;
            const param = req.params as SendPrivateMessageParamsType;
            await this.interactor.sendPrivateMessage(user!, classroom!, body, param);
            res.status(200).json({ message: 'message send successfully' })
        } catch (error) {
            next(error)
        }
    }

    async onGetPrivateMessages(req: CostumeRequest, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            const params = req.params as SendPrivateMessageParamsType;
            const classroom = req.classroom as ClassroomJwtPayload;
            const messages = await this.interactor.getPrivateMessages(user!, params, classroom);

            res.status(200).json(messages)
        } catch (error) {
            next(error)
        }
    }

    async onGetMaterials(req: CostumeRequest, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            const classroom = req.classroom;
            const response = await this.interactor.getMaterials(user!, classroom!)

            res.status(201).json(response)
        } catch (error) {
            next(error)
        }
    }

    async onGetAllWorks(req: CostumeRequest, res: Response, next: NextFunction) {
        try {
            const clasroom = req.classroom as ClassroomJwtPayload;
            const works = await this.interactor.getAllWorks(clasroom);

            res.status(200).json(works)
        } catch (error) {
            next(error)
        }
    }

    async onSubmitWork(req: CostumeRequest, res: Response, next: NextFunction) {
        try {
            const clasroom = req.classroom as ClassroomJwtPayload;
            const query = req.query as SubmitWorkQueryType
            const file = req.file;
            const user = req.user as UserJwtPayload;
            const submittedWork = await this.interactor.submitWork(clasroom, user, file, query);

            res.status(200).json(submittedWork)
        } catch (error) {
            next(error)
        }
    }

    async onGetAllExams(req: CostumeRequest, res: Response, next: NextFunction) {
        try {
            const classroom = req.classroom as ClassroomJwtPayload;
            const allExams = await this.interactor.getAllExams(classroom);

            res.status(200).json(allExams)
        } catch (error) {
            next(error)
        }
    }

    async onGetAnnouncements(req: CostumeRequest, res: Response, next: NextFunction) {
        try {
            const classroom = req.classroom as ClassroomJwtPayload
            const announcements = await this.interactor.getAnnouncements(classroom)
            console.log(announcements)
            res.status(200).json(announcements)
        } catch (error) {
            next(error)
        }
    }

    async onGetExamDetails(req: CostumeRequest, res: Response, next: NextFunction) {
        try {
            const classroom = req.classroom as ClassroomJwtPayload
            const announcements = await this.interactor.getAnnouncements(classroom)
            console.log(announcements)
            res.status(200).json(announcements)
        } catch (error) {
            next(error)
        }
    }

    async onStartExam(req: CostumeRequest, res: Response, next: NextFunction) {
        try {
            const clasroom = req.classroom as ClassroomJwtPayload;
            const params = req.params as { examId: string };
            const user = req.user as UserJwtPayload;
            const exam = await this.interactor.startExam(user, clasroom, params);

            res.status(200).json(exam)
        } catch (error) {
            next(error)
        }
    }

    async onSubmitExam(req: CostumeRequest, res: Response, next: NextFunction) {
        try {
            const clasroom = req.classroom as ClassroomJwtPayload;
            const params = req.params as { examId: string };
            const user = req.user as UserJwtPayload;
            const exam = req.body as SubmitExamType

            await this.interactor.submitExam(clasroom, exam)

            res.status(200).json(exam)
        } catch (error) {
            next(error)
        }
    }

    async onGetJoiningTokenForLiveClass(req: Request, res: Response, next: NextFunction) {
        try {
            const classroom = req.classroom as ClassroomJwtPayload;
            const user = req.user
            const response = await this.interactor.getJoinTokenForLiveClass(user, classroom)
            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

}