import express, { RequestHandler } from "express";
import validate from "../middleware/validate.req.data.middleware"
import { findClassroomSchema } from "../../schema/find.classroom.schema"
import { StudentClassroomRepo } from "../../infrastructure/repositories/student.classroom.repo";
import { StudentClassroomGateway } from "../gateway/student.classroom.gateway";
import { StudentClassroomInteractor } from "../../application/interactor/student.classroom.interactor";
import { saveMessageSchema } from "../../schema/saveMessageSchema";
import { StudentRepo } from "../../infrastructure/repositories/student.repo";
import { JWT } from "../../application/service/jwt";
import { ClassroomAuthMiddleware } from "../middleware/classroom.auth.middleware";
import { TeacherClassroomRepo } from "../../infrastructure/repositories/teacher.classroom.repo";
import { ClasroomAuthInteractor } from "../../application/interactor/classroom.auth.interactor";
import { SocketServices } from "../../application/service/socket.service";
import { sendPrivateMessage } from "../../schema/send.private.message.schema";
import multer from "multer";
import { submitWorkSchema } from "../../schema/work.schema";
import { UniqueIDGenerator } from "../../application/service/unique.id";
import { customAlphabet } from "nanoid";
import { AWSS3Bucket } from "../../application/service/aws.s3.bucket";
import { submitExamSchema } from "../../schema/exam.schema";

const storage = multer.memoryStorage()
const upload = multer({ storage });


const studentClassroomRepo = new StudentClassroomRepo();
const studentRepo = new StudentRepo()
const teacherClassroomRepo = new TeacherClassroomRepo();


const jwt = new JWT();
const socket = new SocketServices();
const uniqueIdGenerator = new UniqueIDGenerator(customAlphabet);
const s3Bucket = new AWSS3Bucket();


const studentClassroomInteractor = new StudentClassroomInteractor(
    studentClassroomRepo,
    studentRepo,
    jwt,
    socket,
    uniqueIdGenerator,
    s3Bucket
)
const studentClassroomGateway = new StudentClassroomGateway(studentClassroomInteractor);
const classroomAuthInteractor = new ClasroomAuthInteractor(
    teacherClassroomRepo,
    studentClassroomRepo,
    jwt,

)

const classroomAuth = new ClassroomAuthMiddleware(classroomAuthInteractor)

const router = express.Router();

router.route('/search/:classroom_id')
    .get(validate(findClassroomSchema),
        studentClassroomGateway.onSearchClassroom.bind(studentClassroomGateway) as RequestHandler)
    .post(validate(findClassroomSchema),
        studentClassroomGateway.onRequestToJoinClassroom.bind(studentClassroomGateway) as RequestHandler
    )

router.route('/all')
    .get(
        studentClassroomGateway.onGetStudentAllClassrooms.bind(studentClassroomGateway) as RequestHandler
    ).post()



router.route('/summary/:classroom_id')
    .get(studentClassroomGateway.onGetClassroomDetailsForStudent.bind(studentClassroomGateway) as RequestHandler);


router.use(classroomAuth.studentClassroomGatekeeper.bind(classroomAuth) as express.RequestHandler)

router.route('/chat')
    .get(studentClassroomGateway.onGetClassroomMessages.bind(studentClassroomGateway) as RequestHandler)
    .post(validate(saveMessageSchema),
        studentClassroomGateway.onSendClassroomMessage.bind(studentClassroomGateway) as RequestHandler)

router.route('/chat/:receiverId')
    .get(studentClassroomGateway.onGetPrivateMessages.bind(studentClassroomGateway) as RequestHandler)
    .post(validate(sendPrivateMessage),
        studentClassroomGateway.onSendPrivateMessage.bind(studentClassroomGateway) as RequestHandler)

router.route('/materials')
    .get(studentClassroomGateway.onGetMaterials.bind(studentClassroomGateway) as RequestHandler)

router.route('/works')
    .get(studentClassroomGateway.onGetAllWorks.bind(studentClassroomGateway) as RequestHandler);

router.route('/work')
    .get()
    .post(upload.single('workSubmission'),
        validate(submitWorkSchema),
        studentClassroomGateway.onSubmitWork.bind(studentClassroomGateway) as RequestHandler);

router.route('/exams')
    .get(studentClassroomGateway.onGetAllExams.bind(studentClassroomGateway) as RequestHandler);

router.route('/exam/:examId')
    .patch(studentClassroomGateway.onStartExam.bind(studentClassroomGateway) as RequestHandler)
    .post(validate(submitExamSchema),
        studentClassroomGateway.onSubmitExam.bind(studentClassroomGateway) as RequestHandler)

router.route('/announcements')
    .get(studentClassroomGateway.onGetAnnouncements.bind(studentClassroomGateway) as RequestHandler)

export default router;
