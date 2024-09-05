import { JwtPayload } from "jsonwebtoken";

import { I_StudentClassroomRepo } from "../../interface/classroom_interface/I_student.classroom.repo";
import { I_TeacherClassroomRepo } from "../../interface/classroom_interface/I_teacher.classroom.repo";
import { I_ClassroomAuthInteractor } from "../../interface/I_classroom.auth.interactor";
import { I_JWT } from "../../interface/service_interface/I_jwt";

import { CostumeError } from "../../utils/costume.error";

import { ClassroomJwtPayload } from "../../presentation/middleware/classroom.auth.middleware";


export class ClasroomAuthInteractor implements I_ClassroomAuthInteractor {
    private teacherClassroomRepo: I_TeacherClassroomRepo;
    private studentClassroomRepo: I_StudentClassroomRepo;
    private jwt: I_JWT
    constructor(teacherClassroomRepo: I_TeacherClassroomRepo, studentClassroomRepo: I_StudentClassroomRepo, jwt: I_JWT) {
        this.teacherClassroomRepo = teacherClassroomRepo
        this.studentClassroomRepo = studentClassroomRepo
        this.jwt = jwt
    }

    async validateClassroomOwnership(token: string, user: JwtPayload | undefined): Promise<ClassroomJwtPayload | null> {
        try {
            if (!user)
                throw new CostumeError(401, "Unautherized user, teacher payload absent");

            const verifyToken = this.jwt.verifyToken(token);

            if (verifyToken.payload) {
               
                const { class_teacher_id } = verifyToken.payload as ClassroomJwtPayload

                if (class_teacher_id != user.userId)
                    throw new CostumeError(403, "You donot have the permission to access this clasroom contents");
              
                return verifyToken.payload as ClassroomJwtPayload
            }

            throw new CostumeError(401, "Unautherized request. Token is not valid")

        } catch (error) {
            throw error; 
        }
    } 


    async validateClassroomMembership(token: string, user: JwtPayload | undefined): Promise<ClassroomJwtPayload | null> {
        try {
            if (!user)
                throw new CostumeError(401, "Unautherized user, student payload absent");
            const verifyToken = this.jwt.verifyToken(token);

            if (verifyToken.payload) {
             
                const { student_id,classroom_id } = verifyToken.payload as ClassroomJwtPayload
                const classroom = await this.studentClassroomRepo.fetchClassroomDetailsForStudent(classroom_id,student_id);
                
               

                if (student_id != user.userId)
                    throw new CostumeError(403, "You donot have the permission to access this clasroom contents");
                const status = classroom?.students.find(student=>student.student_id==user.userId)?.blocked;

                if(status){
                    throw new CostumeError(401,'You have been banned from this classroom!')
                }

                if(classroom?.banned) throw new CostumeError(403,"This classroom has been temporarily banned!")
                    
                return verifyToken.payload as ClassroomJwtPayload
            }

            throw new CostumeError(401, "Unautherized request. Token is not valid")

        } catch (error) {
            throw error;
        }
    }



}