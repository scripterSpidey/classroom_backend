
import { CreateClassroomInputType } from "../../schema/create.classroom.schema";
import { I_UniqueIDGenerator } from "../../interface/service_interface/I_Unique.id";

import { ClassroomDocument, ClassroomMessage } from "../../infrastructure/model/classroom.model";

import { CostumeError } from "../../utils/costume.error";
import { I_TeacherClassroomInteractor } from "../../interface/classroom_interface/I_teacher.classroom.interactor";
import { I_TeacherClassroomRepo } from "../../interface/classroom_interface/I_teacher.classroom.repo";
import { ClassroomJwtPayload, I_JWT, UserJwtPayload } from "../../interface/service_interface/I_jwt";
import { StudentDocument } from "../../infrastructure/model/student.model";
import { studentIdParamType } from "../../schema/remove.student.schema";
import { I_StudentRepo } from "../../interface/student_interface/I_student.repo";

import { I_TeacherRepo } from "../../interface/teacher_interface/I_teacher.repo";
import { TeacherDocument } from "../../infrastructure/model/teacher.model";
import { saveMessageInput } from "../../schema/saveMessageSchema";

import { ObjectId } from "mongodb";
import { I_SocketServices } from "../../interface/service_interface/I_Socket";
import { ChatType, PrivateChatDocument, RoleType } from "../../infrastructure/model/private.chat.model";

import { SendPrivateMessageBodyType,SendPrivateMessageParamsType } from "../../schema/send.private.message.schema";
import { getReceiverSocketId } from "../socket/socket";
import crypto from 'crypto'


export class TeacherClassroomInteractor implements I_TeacherClassroomInteractor {

    private teacherClassroomRepo: I_TeacherClassroomRepo;
    private studentRepo: I_StudentRepo;
    private teacherRepo: I_TeacherRepo;
    private uniqueIdGenerator: I_UniqueIDGenerator;
    private jwt: I_JWT;
    private socketServices: I_SocketServices;

    constructor(teacherClassroomRepo: I_TeacherClassroomRepo,
        studentRepo: I_StudentRepo,
        teacherRepo: I_TeacherRepo,
        uniqueIdGenerator: I_UniqueIDGenerator,
        jwt: I_JWT,
        socketServices: I_SocketServices) {
        this.teacherClassroomRepo = teacherClassroomRepo
        this.studentRepo = studentRepo;
        this.teacherRepo = teacherRepo;
        this.uniqueIdGenerator = uniqueIdGenerator;
        this.jwt = jwt;
        this.socketServices = socketServices;
    }


    async createClassroom(data: CreateClassroomInputType): Promise<ClassroomDocument> {
        try {

            const teacher = await this.teacherRepo.findTeacherById(data.class_teacher_id);

            if (!teacher) throw new CostumeError(401, "Can not find teacher")
            const classroomData = {
                ...data,
                classroom_id: 'CLRM-' + this.uniqueIdGenerator.generateId()
            }
            const newClassrom: ClassroomDocument = await this.teacherClassroomRepo.createClassroom(classroomData, data.class_teacher_id);

            const classroomSubDoc = {
                classroom_id: newClassrom._id,
                classroom_name: newClassrom.name,
                class_teacher_name: teacher.name,
                subject: newClassrom.subject,
                joined_at: newClassrom.createdAt,
                blocked: false
            }

            await this.teacherRepo.saveNewClassroomToTeaherDoc(data.class_teacher_id, classroomSubDoc)

            return newClassrom;
        } catch (error) {
            throw error;
        }

    }

    async getTeacherClassrooms(data: any, user: any): Promise<ClassroomDocument[] | []> {
        try {
            return await this.teacherClassroomRepo.getClassroomsforteacher(data.class_teacher_id)
        } catch (error) {
            throw error
        }
    }

    async getTeacherClassroomDetails(data: any, user: any): Promise<{ classroomToken: string }> {
        try {


            const classroomDetails = await this.teacherClassroomRepo.getTeacherClassroomDetail(
                data.classroom_id,
                user.userId
            );

            if (!classroomDetails) {
                throw new CostumeError(403, "Really? Are you trying to steal others stuff? You dont have access to this classroom!");
            }

            const payload = {
                class_teacher_id: classroomDetails.class_teacher_id,
                classroom_id: classroomDetails._id
            }

            const classroomToken = this.jwt.generateToken(payload)

            return {
                ...classroomDetails.toObject(),
                classroomToken
            }
        } catch (error) {
            throw error
        }
    }

    async acceptJoiningRequest(data: any, user: any, body: any): Promise<ClassroomDocument> {
        try {
            if (!body.student_id) throw new CostumeError(403, "student_id is not provided");
            const [student, classroom] = await Promise.all([
                this.studentRepo.findStudentById(body.student_id),
                this.teacherClassroomRepo.getTeacherClassroomDetail(data.classroom_id, user.userId)
            ]);

            if (!student) throw new CostumeError(404, "This student is not registered or the invalid monogdbId");
            if (!classroom) throw new CostumeError(403, "You dont have the permissions to this classroom");



            const newStudent = {
                student_id: student?._id,
                email: student?.email,
                name: student?.name
            }

            const newClassroom = {
                classroom_id: data.classroom_id as ObjectId,
                class_teacher_name: classroom.class_teacher_name,
                subject: classroom.subject,
                classroom_name: classroom.name,
                joined_at: new Date(),
                blocked: false
            }

            const acceptRequest = await this.teacherClassroomRepo.acceptRequest(
                data.classroom_id,
                user.userId,
                body.student_id,
                newStudent,
                newClassroom
            );

            if (!acceptRequest) throw new CostumeError(403, "Forbidden request");

            return acceptRequest;
        } catch (error) {
            throw error
        }
    }

    async rejectJoiningRequest(data: any, user: any, body: any): Promise<{ message: string }> {
        try {

            const rejectReuqest = await this.teacherClassroomRepo.rejectRequest(
                data.classroom_id,
                user.userId,
                body.student_id
            );

            if (!rejectReuqest) throw new CostumeError(403, "Forbidden request");

            return {
                message: "Request rejected successfully"
            }
        } catch (error) {
            throw error
        }
    }

    async getStudentProfile(data: any): Promise<StudentDocument | null> {
        try {
            const student = await this.teacherClassroomRepo.fetchStudentProfile(data.student_id);
            return student;
        } catch (error) {
            throw error
        }
    }

    async removeStudent(data: studentIdParamType, classroom: { classroom_id: string }): Promise<void> {
        try {
            await this.teacherClassroomRepo.deleteStudentFromClassroom(data.student_id, classroom.classroom_id);
        } catch (error) {
            throw error
        }
    }

    async blockOrUnblockOrStudent(data: studentIdParamType, classroom: ClassroomJwtPayload): Promise<void> {
        try {
            if (!classroom) throw new CostumeError(401, "You dont have access to this classrooms");

            await this.teacherClassroomRepo.toggleStudentAccess(
                data.student_id,
                classroom.classroom_id,
                classroom.class_teacher_id
            );


            return
        } catch (error) {
            throw error
        }
    }

    async getClassroomMessages(user: UserJwtPayload, classroom: ClassroomJwtPayload): Promise<ClassroomMessage[] | []> {
        try {
            const messages = await this.teacherClassroomRepo.fetchClassroomMessages(classroom.classroom_id);
            if (!messages) return []
            const chats = messages[0]?.classroom_messages as ClassroomMessage[];

            return chats
        } catch (error) {
            throw error
        }
    }

    async sendClassroomMessage(user: UserJwtPayload, classroom: ClassroomJwtPayload, data: saveMessageInput): Promise<void> {
        try {
            const sender: TeacherDocument | null = await this.teacherRepo.findTeacherById(user.userId);

            if (!sender) throw new CostumeError(404, "User not found");

            const message: ClassroomMessage = {
                sender_id: sender._id,
                sender_name: sender?.name,
                message: data.message,
                send_at: new Date()
            }

            const savedMessage = await this.teacherClassroomRepo.saveClassroomMessage(classroom.classroom_id, message);
            
            this.socketServices.emitClassroomMessage(classroom.classroom_id,savedMessage)
            // io.to(classroom.classroom_id).emit('classroomMessage', savedMessage)

            return
        } catch (error) {
            throw error
        }
    }

    async sendPrivateMessage(user: UserJwtPayload, classroom: ClassroomJwtPayload, body: SendPrivateMessageBodyType,receiver:SendPrivateMessageParamsType): Promise<void> {
        try {
            const teacher = await this.teacherRepo.findTeacherById(user.userId);
           
            if(!teacher) throw new CostumeError(401,"Teacher can not be found")
            const data:PrivateChatDocument ={
                classroom_id:new ObjectId(classroom.classroom_id),
                sender_id: new ObjectId(user.userId),
                sender_name:teacher.name,
                receiver_name:body.receiverName,
                receiver_id:new ObjectId(receiver.receiverId),
                message:body.message,
                type:ChatType.TEXT,
                sender_role:RoleType.TEACHER,
                read:false
            }
            const savedMessage = await this.teacherClassroomRepo.savePrivateMessage(data);

            const id = [user.userId,receiver.receiverId,classroom.classroom_id].sort().join('-');
            const chatroomId = crypto.createHash('sha256').update(id).digest('hex').substring(0,16);
            
            this.socketServices.emitPrivateMessage(chatroomId,savedMessage)
            return 
        } catch (error) {
            throw error
        }
    }

    async getPrivateMessages(teacher:UserJwtPayload,receiver:SendPrivateMessageParamsType,classroom:ClassroomJwtPayload): Promise<PrivateChatDocument[]> {
        try {
            const messages = await  this.teacherClassroomRepo.fetchPrivateMessages(String(teacher.userId),receiver.receiverId,classroom.classroom_id);
            console.log('private messages: ',messages)
            return messages
        } catch (error) {
            throw error
        }
    }

}