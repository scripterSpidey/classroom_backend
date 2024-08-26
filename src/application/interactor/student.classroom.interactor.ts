import { I_StudentClassroomInteractor } from "../../interface/classroom_interface/I_student.classroom.interactor";
import { I_StudentClassroomRepo } from "../../interface/classroom_interface/I_student.classroom.repo";
import { ClassroomDocument, ClassroomMaterialType, ClassroomMessage } from "../../infrastructure/model/classroom.model";
import { CostumeError } from "../../utils/costume.error";
import { ClassroomJwtPayload } from "../../interface/I_classroom.auth.interactor";
import { I_JWT, UserJwtPayload } from "../../interface/service_interface/I_jwt";
import { saveMessageInput } from "../../schema/saveMessageSchema";

import { I_StudentRepo } from "../../interface/student_interface/I_student.repo";

import { getReceiverSocketId, io } from "../socket/socket";
import { I_SocketServices } from "../../interface/service_interface/I_Socket";
import { SendPrivateMessageBodyType, SendPrivateMessageParamsType } from "../../schema/send.private.message.schema";
import { ObjectId } from "mongodb";
import { ChatType, PrivateChatDocument, RoleType } from "../../infrastructure/model/private.chat.model";
import crypto from 'crypto'
import { WorkFileType, WorksDocument, WorkSubmissionType } from "../../infrastructure/model/works.model";
import { SubmitWorkQueryType } from "../../schema/work.schema";
import { I_UniqueIDGenerator } from "../../interface/service_interface/I_Unique.id";
import { AWS_S3_BUCKET_NAME } from "../../infrastructure/constants/env";
import { I_S3Bucket } from "../../interface/service_interface/I_S3.bucket";
import mongoose from "mongoose";

export class StudentClassroomInteractor implements I_StudentClassroomInteractor {

    private classroomRepo: I_StudentClassroomRepo;
    private studentRepo: I_StudentRepo;
    private jwt: I_JWT;
    private socketService: I_SocketServices;
    private uniqueIdGenerator: I_UniqueIDGenerator;
    private s3Bucket: I_S3Bucket;
    constructor(
        classroomRepo: I_StudentClassroomRepo,
        studentRepo: I_StudentRepo,
        jwt: I_JWT,
        socketServices: I_SocketServices,
        uniqueIdGenerator: I_UniqueIDGenerator,
        s3Bucket: I_S3Bucket) {
        this.classroomRepo = classroomRepo
        this.studentRepo = studentRepo
        this.jwt = jwt;
        this.socketService = socketServices;
        this.uniqueIdGenerator = uniqueIdGenerator;
        this.s3Bucket = s3Bucket
    }


    async getAllClassroomsForStudent(data: any): Promise<any> {
        try {
            const classrooms = await this.classroomRepo.fetchAllClassroomsOfStudent(data.userId);
            return classrooms?.classrooms;
        } catch (error) {
            throw error;
        }
    }

    async findClassroom(data: any, user: any): Promise<ClassroomDocument | null> {
        try {
            const clasroom = await this.classroomRepo.fetchClassroom(data.classroom_id.toUpperCase(), user.userId);
            return clasroom;
        } catch (error) {
            throw error
        }
    }

    async requestToJoinClassroom(classroom: any, user: any): Promise<any> {
        try {

            if (!user.userId) throw new CostumeError(401, "Invalid credentials");

            const saveRequest = await this.classroomRepo.saveJoiningRequest(
                classroom.classroom_id.toUpperCase(),
                user.userId
            );
            if (saveRequest) {
                return {
                    message: "Joining request send successfully"
                }
            }
            throw new CostumeError(500, "something went wrong")

        } catch (error) {
            throw error
        }
    }

    async getClassroomDetailsForStudent(user: any, data: any): Promise<{ classroomToken: string }> {
        try {
            const classroom = await this.classroomRepo.fetchClassroomDetailsForStudent(data.classroom_id, user.userId);

            if (!classroom) throw new CostumeError(403, "You are not a participant of this classroom");



            classroom.students.forEach(student => {
                if (student.student_id == user.userId && student.blocked) {
                    throw new CostumeError(403, "You have been banned from this classroom")
                }
            })

            const payload = {
                student_id: user.userId,
                classroom_id: classroom._id
            }

            const classroomToken = this.jwt.generateToken(payload);

            return {
                ...classroom.toObject(),
                classroomToken
            }

        } catch (error) {
            throw error
        }
    }

    async getClassroomMessages(user: UserJwtPayload, classroom: ClassroomJwtPayload): Promise<ClassroomMessage[] | []> {
        try {
            const messages = await this.classroomRepo.fetchClassroomMessages(classroom.classroom_id);
            if (!messages) return []
            const chats = messages[0]?.classroom_messages as ClassroomMessage[];

            return chats
        } catch (error) {
            throw error
        }
    }

    async sendClassroomMessage(user: UserJwtPayload, classroom: ClassroomJwtPayload, data: saveMessageInput): Promise<any> {
        try {
            const sender = await this.studentRepo.findStudentById(user.userId);

            if (!sender) throw new CostumeError(404, "User not found");

            const message: ClassroomMessage = {
                sender_id: sender._id,
                sender_name: sender?.name,
                message: data.message,
                send_at: new Date()
            }

            const savedMessage = await this.classroomRepo.saveClassroomMessage(classroom.classroom_id, message);
            this.socketService.emitClassroomMessage(classroom.classroom_id, savedMessage)

            return
        } catch (error) {
            throw error
        }
    }

    async sendPrivateMessage(user: UserJwtPayload, classroom: ClassroomJwtPayload, body: SendPrivateMessageBodyType, receiver: SendPrivateMessageParamsType): Promise<void> {
        try {
            const student = await this.studentRepo.findStudentById(user.userId);

            if (!student) throw new CostumeError(401, "Teacher can not be found")
            const data: PrivateChatDocument = {
                classroom_id: new ObjectId(classroom.classroom_id),
                sender_id: new ObjectId(user.userId),
                sender_name: student.name,
                receiver_name: body.receiverName,
                receiver_id: new ObjectId(receiver.receiverId),
                message: body.message,
                type: ChatType.TEXT,
                sender_role: RoleType.STUDENT,
                read: false
            }
            const savedMessage = await this.classroomRepo.savePrivateMessage(data);

            const id = [user.userId, receiver.receiverId, classroom.classroom_id].sort().join('-');
            const chatroomId = crypto.createHash('sha256').update(id).digest('hex').substring(0, 16);

            this.socketService.emitPrivateMessage(chatroomId, savedMessage)

            return
        } catch (error) {
            throw error
        }
    }

    async getPrivateMessages(teacher: UserJwtPayload, receiver: SendPrivateMessageParamsType, classroom: ClassroomJwtPayload): Promise<PrivateChatDocument[]> {
        try {
            const messages = await this.classroomRepo.fetchPrivateMessages(String(teacher.userId), receiver.receiverId, classroom.classroom_id);
            console.log('private messages: ', messages)
            return messages
        } catch (error) {
            throw error
        }
    }

    async getMaterials(user: UserJwtPayload, classroom: ClassroomJwtPayload): Promise<ClassroomMaterialType[] | null> {
        try {
            const materials = await this.classroomRepo.fetchClassroomMaterials(classroom.classroom_id, user.userId as string);
            console.log(materials)
            return materials;
        } catch (error) {
            throw error;
        }
    }


    async getAllWorks(clasroom: ClassroomJwtPayload): Promise<WorksDocument[] | null> {
        try {
            console.log(clasroom)
            const works = await this.classroomRepo.fetchAllClassroomWorks(clasroom.classroom_id);

            return works;
        } catch (error) {
            throw error
        }
    }

    async submitWork(classroom: ClassroomJwtPayload, user: UserJwtPayload, file: Express.Multer.File, workId: SubmitWorkQueryType): Promise<WorkSubmissionType[]|null> {
        try {

            const [work, student] = await Promise.all([
                this.classroomRepo.findWork(workId.workId),
                this.studentRepo.findStudentById(user.userId)
            ])

            if (!work) throw new CostumeError(404, "Can not find the work you are looking for");
            if (!student) throw new CostumeError(401, 'Invalid credentials, can not find the user in database')

            const deadline = work.deadline;

            if (new Date().getTime() >= new Date(deadline).getTime()) throw new CostumeError(403, "Submission time is over!");

            const submissionFileId = this.uniqueIdGenerator.generateMaterialId();
            const fileName = `worksubmission-${classroom.classroom_id}-${workId.workId}-${user.userId}`;
            const fileUrl = `https://${AWS_S3_BUCKET_NAME}.s3.amazonaws.com/works/submissions/${fileName}`

            await this.s3Bucket.uploadWorkSubmissionFile(fileName,file.buffer,file.mimetype);

            const newSubmission: WorkSubmissionType = {
                student_id: new mongoose.Types.ObjectId(user.userId),
                student_name: student.name,
                submission_time: new Date(),
                submitted_file_url: fileUrl,
                submitted_file_type: file.mimetype == 'application/pdf' ? WorkFileType.PDF : WorkFileType.IMAGE,
                marks: 0
            }
            
            const submittedWork = await this.classroomRepo.saveSubmittedWork(classroom.classroom_id,workId.workId,newSubmission);
            if(!submittedWork) throw new CostumeError(403,'You have already submitted this work');

            console.log(submittedWork)
            return submittedWork.submissions;
        } catch (error) {
            throw error;
        }
    }

}  