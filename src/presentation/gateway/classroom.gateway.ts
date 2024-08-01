import { I_ClassroomInteractor } from "../../interface/classroom_interface/I_classroom.interactor";
import { Request, Response, NextFunction } from "express";
import { ClassroomDocument } from "../../infrastructure/model/classroom.model";
import { CostumeRequest } from "../../interface/I_express.request";

export class ClassroomGateway {
    private interactor: I_ClassroomInteractor;

    constructor(interactor: I_ClassroomInteractor) {
        this.interactor = interactor;
    }

    async onCreateClassroom(req: Request, res: Response, next: NextFunction) {
        const data = req.body;
        try {
            const response: ClassroomDocument = await this.interactor.createClassroom(data);
           
            res.status(201).json(response)
        } catch (error) {
            next(error)
        }
    }

    async onGetStudentAllClassrooms(req:CostumeRequest,res:Response,next:NextFunction){
        const user = req.user;
        try {
            const response = await this.interactor.getAllClassroomsForStudent(user);
            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

    async onGetTeacherAllClassrooms(req: CostumeRequest, res: Response, next: NextFunction) {
        const data = req.params;
        const user = req.user;
        try {

            const classrooms = await this.interactor.getTeacherClassrooms(data,user);
            res.status(200).json(classrooms)
        } catch (error) {

        }
    }

    async onGetTeacherClassroom(req: CostumeRequest, res: Response, next: NextFunction) {
        try {
            const data = req.params;
            const user = req.user;

            const classroomDetails = await this.interactor.getTeacherClassroomDetails(data, user);
          
            res.status(200).json(classroomDetails)
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

    async onAcceptJoiningRequest(req: CostumeRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = req.body;
            const data = req.params;
            const user = req.user;
            
            const accepted = await this.interactor.acceptJoiningRequest(data,user,body)
            
            
            res.status(200).json(accepted)
            
        } catch (error) {
            next(error)
        }
    }

    async onRejectJoinRequest(req: CostumeRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = req.body;
            const data = req.params;
            const user = req.user;
           
            const rejected = await this.interactor.acceptJoiningRequest(data,user,body)
            
            
            res.status(200).json(rejected)
            
        } catch (error) {
            next(error)
        }
    }

    async onGetClassroomDetailsForStudent(req:CostumeRequest,res:Response,next:NextFunction){
        try {
            const user = req.user;
            const data = req.params;
            const classroom = await this.interactor.getClassroomDetailsForStudent(user,data);

            res.status(200).json(classroom)
        } catch (error) {
            next(error)
        }
    }
}