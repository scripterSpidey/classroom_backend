
import { CreateClassroomInputType } from "../../schema/create.classroom.schema";
import { I_UniqueIDGenerator } from "../../interface/service_interface/I_Unique.id";
import { ClassroomDocument, ClassroomMaterialType, ClassroomMessage, MaterialType } from "../../infrastructure/model/classroom.model";
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
import { SendPrivateMessageBodyType, SendPrivateMessageParamsType } from "../../schema/send.private.message.schema";
import crypto from 'crypto'
import { I_S3Bucket } from "../../interface/service_interface/I_S3.bucket";
import { AWS_S3_BUCKET_NAME } from "../../infrastructure/constants/env";
import { DeleteMaterialQueryType, UploadMaterialBodyType } from "../../schema/upload.material.schema";
import { CreateWorkBodyType, UpdateWorkMarkBodyType, UpdateWorkMarkParamsType } from "../../schema/work.schema";
import { WorkFileType, WorksDocument, WorkType } from "../../infrastructure/model/works.model";
import mongoose, { mongo } from "mongoose";
import { I_DayJS } from "../../interface/service_interface/I_DayJS";
import { CreateExamType, PublishExamBodyType } from "../../schema/exam.schema";
import { ExamAttendedType, ExamQuestionType, ExamsDocument, QuestionPaperEnum, QuestionTypeEnum } from "../../infrastructure/model/exam.model";
import { AnnouncementsDocument, NotificationTypeEnum } from "../../infrastructure/model/announcements.model";
import { CopyObjectOutputFilterSensitiveLog } from "@aws-sdk/client-s3";
import { I_ZegoCloud } from "../../interface/service_interface/I_Zegocloud";
import { StartLiveClassBodyType } from "../../schema/live.class.schema";
import { LiveClassDocument } from "../../infrastructure/model/live.class.model";
import { date } from "zod";

export class TeacherClassroomInteractor implements I_TeacherClassroomInteractor {

    private teacherClassroomRepo: I_TeacherClassroomRepo;
    private studentRepo: I_StudentRepo;
    private teacherRepo: I_TeacherRepo;
    private uniqueIdGenerator: I_UniqueIDGenerator;
    private jwt: I_JWT;
    private socketServices: I_SocketServices;
    private s3Bucket: I_S3Bucket;
    private dayJS: I_DayJS
    private zegoCloud: I_ZegoCloud;

    constructor(teacherClassroomRepo: I_TeacherClassroomRepo,
        studentRepo: I_StudentRepo,
        teacherRepo: I_TeacherRepo,
        uniqueIdGenerator: I_UniqueIDGenerator,
        jwt: I_JWT,
        socketServices: I_SocketServices,
        s3Bucket: I_S3Bucket,
        dayJS: I_DayJS,
        zegoCloud: I_ZegoCloud) {
        this.teacherClassroomRepo = teacherClassroomRepo
        this.studentRepo = studentRepo;
        this.teacherRepo = teacherRepo;
        this.uniqueIdGenerator = uniqueIdGenerator;
        this.jwt = jwt;
        this.socketServices = socketServices;
        this.s3Bucket = s3Bucket;
        this.dayJS = dayJS;
        this.zegoCloud = zegoCloud
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

            if (classroomDetails.banned) throw new CostumeError(403, "This classroom has been temporarily banned!")

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

            this.socketServices.emitClassroomMessage(classroom.classroom_id, savedMessage)

            return
        } catch (error) {
            throw error
        }
    }

    async sendPrivateMessage(user: UserJwtPayload, classroom: ClassroomJwtPayload, body: SendPrivateMessageBodyType, receiver: SendPrivateMessageParamsType): Promise<void> {
        try {
            const teacher = await this.teacherRepo.findTeacherById(user.userId);

            if (!teacher) throw new CostumeError(401, "Teacher can not be found")
            const data: PrivateChatDocument = {
                classroom_id: new ObjectId(classroom.classroom_id),
                sender_id: new ObjectId(user.userId),
                sender_name: teacher.name,
                receiver_name: body.receiverName,
                receiver_id: new ObjectId(receiver.receiverId),
                message: body.message,
                type: ChatType.TEXT,
                sender_role: RoleType.TEACHER,
                read: false
            }
            const savedMessage = await this.teacherClassroomRepo.savePrivateMessage(data);

            const id = [user.userId, receiver.receiverId, classroom.classroom_id].sort().join('-');
            const chatroomId = crypto.createHash('sha256').update(id).digest('hex').substring(0, 16);

            this.socketServices.emitPrivateMessage(chatroomId, savedMessage)
            return
        } catch (error) {
            throw error
        }
    }

    async getPrivateMessages(teacher: UserJwtPayload, receiver: SendPrivateMessageParamsType, classroom: ClassroomJwtPayload): Promise<PrivateChatDocument[]> {
        try {
            const messages = await this.teacherClassroomRepo.fetchPrivateMessages(String(teacher.userId), receiver.receiverId, classroom.classroom_id);
            console.log('private messages: ', messages)
            return messages
        } catch (error) {
            throw error
        }
    }

    async uploadMaterial(user: UserJwtPayload, clasroom: ClassroomJwtPayload, data: UploadMaterialBodyType, file: Express.Multer.File): Promise<ClassroomMaterialType> {
        try {
            if (!file) throw new CostumeError(400, 'Material is required!');

            const materialId = this.uniqueIdGenerator.generateMaterialId();

            const fileName = `material-${clasroom?.classroom_id}-${materialId}`;
            const fileUrl = `https://${AWS_S3_BUCKET_NAME}.s3.amazonaws.com/materials/${fileName}`;

            await this.s3Bucket.uploadClassroomMaterial(fileName, file.buffer, file.mimetype);

            const materialDoc: ClassroomMaterialType = {
                title: data.title,
                description: data.description,
                type: MaterialType.PDF,
                url: fileUrl,
                created_at: new Date()
            }

            const material = await this.teacherClassroomRepo.saveClassroomMaterial(clasroom.classroom_id, materialDoc);

            if (!material) throw new CostumeError(503, "Failed to upload material. Please try again later!");

            const newAnnouncement: AnnouncementsDocument = {
                classroom_id: new mongoose.Types.ObjectId(clasroom.classroom_id),
                type: NotificationTypeEnum.MATERIAL,
                content: `New material ${material.title} has been published.`,
                pinned: false,
                important: false,
                createdAt: new Date()
            }

            const announcement = await this.teacherClassroomRepo.saveNewAnnouncement(newAnnouncement);

            this.socketServices.emitAnnouncement(clasroom.classroom_id, announcement)

            return material

        } catch (error) {
            throw error;
        }
    }

    async getMaterials(user: UserJwtPayload, classroom: ClassroomJwtPayload): Promise<ClassroomMaterialType[] | null> {
        try {
            const materials = await this.teacherClassroomRepo.fetchClassroomMaterials(classroom.classroom_id, user.userId as string);

            return materials;
        } catch (error) {
            throw error;
        }
    }

    async deleteMaterial(user: UserJwtPayload, clasroom: ClassroomJwtPayload, material: DeleteMaterialQueryType): Promise<void> {
        try {

            await this.teacherClassroomRepo.deleteClassroomMaterial(clasroom.classroom_id, material.materialId)
        } catch (error) {
            throw error;
        }
    }

    async createWork(body: CreateWorkBodyType, file: Express.Multer.File, classroom: ClassroomJwtPayload): Promise<WorksDocument> {
        try {

            const deadline = this.dayJS.convertToInternationalTime(body.submissionDate, body.submissionTime);
            if (deadline <= new Date()) {
                throw new CostumeError(400, "Submission date can not be in past!")
            }

            const workFileId = this.uniqueIdGenerator.generateMaterialId();
            const fileName = `work-${classroom?.classroom_id}-${workFileId}`;
            const fileUrl = `https://${AWS_S3_BUCKET_NAME}.s3.amazonaws.com/works/question_papers/${fileName}`

            await this.s3Bucket.uploadClassroomWorks(fileName, file.buffer, file.mimetype);

            const newWork: WorksDocument = {
                classroom_id: new mongoose.Types.ObjectId(classroom.classroom_id),
                work_type: body.workType == 'assignment' ? WorkType.ASSIGNMENT : WorkType.HOMEWORK,
                work_file_url: fileUrl,
                work_file_type: file.mimetype == 'application/pdf' ? WorkFileType.PDF : WorkFileType.IMAGE,
                deadline: deadline,
                max_marks: Number(body.maxMarks),
                submissions: [],
                topic: body.topic,
                description: body.description
            }



            const work = await this.teacherClassroomRepo.saveNewWork(newWork);

            const newAnnouncement: AnnouncementsDocument = {
                classroom_id: new mongoose.Types.ObjectId(classroom.classroom_id),
                type: NotificationTypeEnum.WORK,
                content: `New ${work.work_type} ${work.topic} has been published.`,
                pinned: false,
                important: false,
                createdAt: new Date()
            }

            const announcement = await this.teacherClassroomRepo.saveNewAnnouncement(newAnnouncement);

            this.socketServices.emitAnnouncement(classroom.classroom_id, announcement)

            return work;

        } catch (error) {
            throw error;
        }
    }

    async getAllWorks(clasroom: ClassroomJwtPayload): Promise<WorksDocument[] | null> {
        try {
            const works = await this.teacherClassroomRepo.fetchAllClassroomWorks(clasroom.classroom_id);
            console.log('works: ', works)
            return works;
        } catch (error) {
            throw error
        }
    }

    async updateWorkMark(workId: UpdateWorkMarkParamsType, data: UpdateWorkMarkBodyType): Promise<WorksDocument | null> {
        try {
            const updateMark = await this.teacherClassroomRepo.editWorkMark(workId.workId, data.studentId, Number(data.mark));
            return updateMark;
        } catch (error) {
            throw error
        }
    }

    async createExam(classroom: ClassroomJwtPayload, exam: CreateExamType): Promise<ExamsDocument> {
        try {

            const utcStartTime = this.dayJS.convertToUTC(exam.startTime);
            const utcEndTime = this.dayJS.convertToUTC(exam.lastTimeToStart);
            if (utcStartTime === 'Invalid date' || utcEndTime === 'Invalid date') {
                console.log('invalid')
                throw new CostumeError(400, 'Invalid date format')
            }

            const questionPaperType = exam.questionPaperType == QuestionPaperEnum.ADD ? QuestionPaperEnum.ADD :
                exam.questionPaperType == QuestionPaperEnum.BANK ? QuestionPaperEnum.BANK :
                    QuestionPaperEnum.UPLOAD;

            console.log(utcStartTime, utcEndTime);

            const questions: ExamQuestionType[] = exam.questions.map(question => {
                const type = question.type === QuestionTypeEnum.MCQ ? QuestionTypeEnum.MCQ :
                    question.type === QuestionTypeEnum.DESCRIPTIVE ? QuestionTypeEnum.DESCRIPTIVE :
                        question.type === QuestionTypeEnum.TOF ? QuestionTypeEnum.TOF :
                            QuestionTypeEnum.FILL_BLANKS;
                return {
                    question: question.question,
                    type: type,
                    mark: Number(question.mark),
                    options: question.options ? question.options : [],
                    answer: question.answer
                }
            })

            const newExam: ExamsDocument = {
                classroom_id: new mongoose.Types.ObjectId(classroom.classroom_id),
                title: exam.title,
                instructions: exam.instructions || '',
                issued_at: new Date(),
                total_marks: exam.questions.reduce((acc, curr) => acc += Number(curr.mark), 0),
                total_questions: exam.questions.length,
                start_time: this.dayJS.convertToUTC(exam.startTime) as Date,
                last_time_to_start: this.dayJS.convertToUTC(exam.lastTimeToStart) as Date,
                duration: Number(exam.duration),
                question_paper_type: questionPaperType,
                attended: [],
                questions: questions,
                started_students: []
            }

            const saveExam = await this.teacherClassroomRepo.saveNewExam(newExam);

            const newAnnouncement: AnnouncementsDocument = {
                classroom_id: new mongoose.Types.ObjectId(classroom.classroom_id),
                type: NotificationTypeEnum.EXAM,
                content: `New exam:  ${exam.title} has been published.`,
                pinned: false,
                important: false,
                createdAt: new Date()
            }

            const announcement = await this.teacherClassroomRepo.saveNewAnnouncement(newAnnouncement);

            this.socketServices.emitAnnouncement(classroom.classroom_id, announcement)

            return saveExam;
        } catch (error) {
            throw error
        }
    }

    async getAllExams(clasroom: ClassroomJwtPayload): Promise<ExamsDocument[]> {
        try {
            return await this.teacherClassroomRepo.fetchAllExams(clasroom.classroom_id)
        } catch (error) {
            throw error

        }
    }

    async getAnnouncements(clasroom: ClassroomJwtPayload): Promise<AnnouncementsDocument[] | null> {
        try {
            return await this.teacherClassroomRepo.fetchAnnouncements(clasroom.classroom_id)
        } catch (error) {
            throw error

        }
    }

    async publishExamResult(examDetails: { examId: string }, data: PublishExamBodyType): Promise<any> {
        try {
            const { totalMark, status } = data
            await this.teacherClassroomRepo.updateExamResult(examDetails.examId, data.studentId, data.totalMark, data.status)
            console.log(data)
        } catch (error) {
            throw error
        }
    }

    async getLiveClassToken(classroom: ClassroomJwtPayload): Promise<string> {
        try {
            const { classroom_id, class_teacher_id } = classroom;

            if (!classroom_id || !class_teacher_id) {
                throw new CostumeError(401, "You donot have the permission to start the class")
            }
            const token = this.zegoCloud.generateZegoCloudToken(class_teacher_id, classroom_id);

            return token
        } catch (error) {
            throw error
        }
    }

    async startLiveClass(classroom: ClassroomJwtPayload, data: StartLiveClassBodyType): Promise<LiveClassDocument> {
        try {
            const { classroom_id, class_teacher_id } = classroom;

            const newLiveCLass: LiveClassDocument = {
                classroom_id: new mongoose.Types.ObjectId(classroom_id),
                started_at: new Date(),
                title: data.title,
                total_attendence: 0,
                attended_students: [],
            }

            const liveClass = await this.teacherClassroomRepo.saveNewLiveClass(newLiveCLass);
            return liveClass
        } catch (error) {
            throw error
        }
    }

}