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



const studentClassroomRepo = new StudentClassroomRepo();
const studentRepo = new StudentRepo()
const teacherClassroomRepo = new TeacherClassroomRepo();


const jwt = new JWT();
const socket = new SocketServices();


const studentClassroomInteractor = new StudentClassroomInteractor(
    studentClassroomRepo,
    studentRepo,
    jwt,
    socket
)
const studentClassroomGateway = new StudentClassroomGateway(studentClassroomInteractor);
const classroomAuthInteractor = new ClasroomAuthInteractor(
    teacherClassroomRepo,
    studentClassroomRepo,
    jwt
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


export default router;
