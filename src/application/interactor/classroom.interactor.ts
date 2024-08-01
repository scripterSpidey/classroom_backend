import { I_ClassroomInteractor } from "../../interface/classroom_interface/I_classroom.interactor";
import { I_ClassroomRepo } from "../../interface/classroom_interface/I_classroom.repo";
import { CreateClassroomInputType } from "../../schema/create.classroom.schema";
import { I_UniqueIDGenerator } from "../../interface/service_interface/I_Unique.id";

import { ClassroomDocument } from "../../infrastructure/model/classroom.model";

import { CostumeError } from "../../utils/costume.error";

export class ClassroomInteractor implements I_ClassroomInteractor {
    private classroomRepo: I_ClassroomRepo;
    private uniqueIdGenerator: I_UniqueIDGenerator;
    constructor(classroomRepo: I_ClassroomRepo, uniqueIdGenerator: I_UniqueIDGenerator) {
        this.classroomRepo = classroomRepo
        this.uniqueIdGenerator = uniqueIdGenerator;
    }
  


    async createClassroom(data: CreateClassroomInputType): Promise<ClassroomDocument> {
        try {
            
            const classroomData = {
                ...data,
                classroom_id: 'CLRM-' + this.uniqueIdGenerator.generateId()
            }
            return await this.classroomRepo.createClassroom(classroomData,data.class_teacher_id);

        } catch (error) {
            throw error;
        }

    }


    async getTeacherClassrooms(data: any,user:any): Promise<ClassroomDocument[] | []> {
        try {
            return await this.classroomRepo.getClassroomsforteacher(data.class_teacher_id)
        } catch (error) {
            throw error
        }
    }

    async getAllClassroomsForStudent(data: any): Promise<any> {
        try {
            const classrooms = await this.classroomRepo.fetchAllClassroomsOfStudent(data.userId);
            return classrooms?.classrooms;
        } catch (error) {
            throw error;
        }
    }

    async getTeacherClassroomDetails(data: any, user: any): Promise<any> {
        try {
            
            
            const classroomDetails = await this.classroomRepo.getTeacherClassroomDetail(data.classroom_id,user.userId);
            


            return classroomDetails
        } catch (error) {
            throw error
        }
    }

    async findClassroom(data: any,user:any): Promise<ClassroomDocument | null> {
        try {

            const clasroom = await this.classroomRepo.fetchClassroom(data.classroom_id.toUpperCase(),user.userId);
            return clasroom;
        } catch (error) {
            throw error
        }
    }

    async requestToJoinClassroom(classroom: any, user: any): Promise<any> {
        try {
            
            if(!user.userId) throw new CostumeError(401,"Invalid credentials");

            const saveRequest = await this.classroomRepo.saveJoiningRequest(
                classroom.classroom_id.toUpperCase(),
                user.userId
            );
            if(saveRequest){
                return {
                    message:"Joining request send successfully"
                }
            }
            throw new CostumeError(500,"something went wrong")
            
        } catch (error) {
            throw error
        }
    }


    async acceptJoiningRequest(data: any,user:any,body:any): Promise<ClassroomDocument> {
        try {
            
            const acceptRequest = await this.classroomRepo.acceptRequest(
                data.classroom_id,
                user.userId,
                body.student_id
            );
            
            if(!acceptRequest) throw new CostumeError(403,"Forbidden request");

            return acceptRequest;
        } catch (error) {
            throw error
        }
    }
    async rejectJoiningRequest(data: any,user:any,body:any): Promise<{message:string}> {
        try {
            
            const rejectReuqest = await this.classroomRepo.rejectRequest(
                data.classroom_id,
                user.userId,
                body.student_id
            );
            
            if(!rejectReuqest) throw new CostumeError(403,"Forbidden request");

            return{
                message:"Request rejected successfully"
            }
        } catch (error) {
            throw error
        }
    }

    async getClassroomDetailsForStudent(user: any, data: any): Promise<ClassroomDocument|null> {
        try {
            const classroom = await this.classroomRepo.fetchClassroomDetailsForStudent(data.classroom_id);
            
            return classroom;
        } catch (error) {
            throw error
        }
    }
} 