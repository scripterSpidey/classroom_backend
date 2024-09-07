import { connect } from "http2";
import { Admin } from "../../domain/entities/admin";
import { ClassroomDocument } from "../../infrastructure/model/classroom.model";
import { StudentDocument } from "../../infrastructure/model/student.model";
import { TeacherDocument } from "../../infrastructure/model/teacher.model";
import { I_AdminInteractor } from "../../interface/admin_interface/I_adminInteractor";
import { I_AdminRepo } from "../../interface/admin_interface/I_adminRepo";
import { I_JWT } from "../../interface/service_interface/I_jwt";
import { I_Mailer } from "../../interface/service_interface/I_mailer";
import { CostumeError } from '../../utils/costume.error'
export class AdminInteractor implements I_AdminInteractor {
    private repository: I_AdminRepo;
    private jwt: I_JWT;
    private emailService: I_Mailer;
    constructor(repository: I_AdminRepo, jwt: I_JWT,emailService:I_Mailer) {
        this.repository = repository;
        this.jwt = jwt;
        this.emailService = emailService;
    }


    login(data: Admin): any {
        try {
            const email = process.env.ADMIN_EMAIL;
            const password = process.env.ADMIN_PASSWORD;

            if (data.email == email && data.password == password) {
                const adminAccessToken = this.jwt.generateToken({ admin: 'ahmedgeck@gmail.com' }, '1d');

                return { adminAccessToken, email };
            }
            throw new CostumeError(401, "Invalid credentials")
        } catch (error) {
            throw error
        }

    }
    logout(): Promise<Boolean> {
        throw new Error("Method not implemented.");
    }

    async getTeachers(query:{page:number,rows:number}): Promise<TeacherDocument[]> {
        try {
            const {page,rows} = query;
            const teachers = await this.repository.fetchTeachers((page-1)*rows,rows);

            return teachers;
        } catch (error) {
            throw error;
        }
    }

    async getStudents(query:{page:number,rows:number}): Promise<StudentDocument[]> {
        try {
            const {page,rows} = query;
            const students = await this.repository.fetchStudents((page-1)*rows,rows);
            return students;
        } catch (error) {
            throw error;
        }
    }

    async getClassrooms(query:{page:number,rows:number}): Promise<ClassroomDocument[]> {
        try {
            const {page,rows} = query;
            console.log(query)
            const calssrooms = await this.repository.fetchClassrooms((page-1)*rows,rows);
            console.log(calssrooms)
            return calssrooms;
        } catch (error) {
            throw error;
        }
    }

    async getTeacherInfo(data: { teacherId: string }): Promise<TeacherDocument | null> {
        try {
            const teacher = await this.repository.fetchTeacherInfo(data.teacherId);
            console.log(teacher?.classrooms)
            return teacher;
        } catch (error) {
            throw error;
        }
    }

    async blockOrUnblockTeacher(data: { teacherId: string },body:{reason:string}): Promise<void> {
        try {
            console.log(body)
            const teacher = await this.repository.fetchTeacherInfo(data.teacherId);

            if (!teacher) throw new CostumeError(404, "Can not find the user you are looking for");

            const status = teacher.blocked;

            await this.repository.blockTeacher(data.teacherId, !status);

            if(status == false){
                await this.emailService.sendReasonForBlock(teacher.email,body.reason)
            }else{
                await this.emailService.sendBandRemovedMail(teacher.email,body.reason)
            }
        } catch (error) {
            throw error;
        }
    }

    async getStudentInfo(data: { studentId: string }): Promise<StudentDocument | null> {
        try {
            const student = await this.repository.fetchStudentInfo(data.studentId);
            console.log('student', student)
            return student;
        } catch (error) {
            throw error;
        }
    }

    async getClassroomInfo(data: { classroomId: string }): Promise<ClassroomDocument | null> {
        try {
            const classroom = await this.repository.fetchClassroomInfo(data.classroomId);
            return classroom;
        } catch (error) {
            throw error;
        }
    }

    async banOrUnbanClassroom(classroom:{classroomId:string},body:{reason:string}): Promise<void> {
        try {

            const classroomInfo = await this.repository.fetchClassroomInfo(classroom.classroomId);
            
            if(!classroomInfo) throw new CostumeError(404,'Can not find the classroom you looking for.');
            const teacher = await this.repository.fetchTeacherInfo(String(classroomInfo.class_teacher_id) )
            const banState = classroomInfo.banned
            if(banState==false){
                await this.emailService.sendBanClassroomMail(teacher?.email!,body.reason,classroomInfo.classroom_id,classroomInfo.name)
            }else{
                await this.emailService.sendRemoveBanClassroomMail(teacher?.email!,body.reason,classroomInfo.classroom_id,classroomInfo.name)
            }
            await this.repository.changeBanStateOfClassroom(classroom.classroomId,!banState);
            return
        } catch (error) {
            throw error;
        }
    }

    async blockOrUnblockStudent(data: { studentId: string },body:{reason:string}): Promise<void> {
        try {
            const student = await this.repository.fetchStudentInfo(data.studentId);

            if (!student) throw new CostumeError(404, "Can not find the user you are looking for");

            const status = student.blocked;
            if(status == false){
                await this.emailService.sendReasonForBlock(student.email,body.reason)
            }else{
                await this.emailService.sendBandRemovedMail(student.email,body.reason)
            }

            await this.repository.toggleBlockStatusOfStudent(data.studentId, !status)
            return
        } catch (error) {
            throw error;
        }
    }

}