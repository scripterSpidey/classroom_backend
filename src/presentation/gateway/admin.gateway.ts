import { Request,Response,NextFunction } from "express";
import { I_AdminInteractor } from "../../interface/admin_interface/I_adminInteractor";
import {accessTokenExpirationTime} from '../../infrastructure/constants/appConstants'
export class AdminGateway{
    private interactor: I_AdminInteractor;
    constructor(interactor: I_AdminInteractor){
        this.interactor = interactor;
    }

    async onLogin(req:Request,res:Response,next:NextFunction){
        try {
            const body = req.body;
            const data = await   this.interactor.login(body);
            res.cookie('adminAccessToken',data.adminAccessToken,{
                maxAge:accessTokenExpirationTime,
                httpOnly: true,
            })
            res.status(200).json(data)
        } catch (error) {
            next(error)
        }
    }

    async onLogout(req:Request,res:Response,next:NextFunction){
        try {
            res.cookie('adminAccessToken','',{
                maxAge:0,
                httpOnly:true
            })
            res.status(200).json({message:'loged out successfully'})
        } catch (error) {
            next(error)
        }
    }

    async onGetTeachers(req:Request,res:Response,next:NextFunction){
        try {
            const teachers = await this.interactor.getTeachers();
          
            res.status(200).json(teachers)
        } catch (error) {
            next(error)
        }
    }

    async onGetStudents(req:Request,res:Response,next:NextFunction){
        try {
            const students = await this.interactor.getStudents();
            
            res.status(200).json(students)
        } catch (error) {
            next(error)
        }
    }

    async onGetClassrooms(req:Request,res:Response,next:NextFunction){
        try {
            const classrooms = await this.interactor.getClassrooms();

            res.status(200).json(classrooms)
        } catch (error) {
            next(error)
        }
    }

    async onGetTeacherInfo(req:Request,res:Response,next:NextFunction){
        try {
            
            const params = req.params as {teacherId:string};

            const teacher = await this.interactor.getTeacherInfo(params);
            
            res.status(200).json(teacher)
        } catch (error) {
            next(error)
        }
    }

    async onGetStudentInfo(req:Request,res:Response,next:NextFunction){
        try {
            const params  = req.params as {studentId:string}
            const student =  await this.interactor.getStudentInfo(params)
            res.status(200).json(student)
        } catch (error) {
            next(error)
        }
    }

    async onGetClassroomInfo(req:Request,res:Response,next:NextFunction){
        try {
            const params = req.params as {classroomId:string};
            const classroom = await this.interactor.getClassroomInfo(params);

            
            res.status(200).json(classroom)
        } catch (error) {
            next(error)
        }
    }

    
}