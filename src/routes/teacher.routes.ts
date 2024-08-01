import express from "express";

import { TeacherInteractor } from "../application/interactor/teacher.interactor";
import { TeacherController } from "../presentation/gateway/teacher.gateway";
import { TeacherRepo } from "../infrastructure/repositories/teacher.repo";
import { HashPassword } from "../application/service/bcrypt";
import { EmailService } from "../application/service/mailer";
import { JWT } from "../application/service/jwt";
import _ from "lodash";
import { customAlphabet } from "nanoid";

import validate from "../presentation/middleware/validate.req.data.middleware";
import { registrationSchema } from "../schema/registration.schema";
import { verificationOTPSchema } from "../schema/otp.verification.schema";
import { loginSchema } from "../schema/login.schema";
import { logoutSchema } from "../schema/logut.schema";
import { TeacherAuthMiddleware } from "../presentation/middleware/teacher.auth.middleware";
import { TeacherAuthInteractor } from "../application/interactor/teacher.auth.interactor";
import { googelLoginSchema } from "../schema/google.login.schema";
import { API } from "../application/service/api.requests";
import { ClassroomInteractor } from "../application/interactor/classroom.interactor";
import { ClassroomRepo } from "../infrastructure/repositories/classroom.repo";
import { ClassroomGateway } from "../presentation/gateway/classroom.gateway";
import { createClassroomSchema } from "../schema/create.classroom.schema";
import { UniqueIDGenerator } from "../application/service/unique.id";



const hashPassword = new HashPassword();
const emailService = new EmailService();
const jwt = new JWT();
const APIRequests = new API();
const uniqueIdGenerator = new UniqueIDGenerator(customAlphabet)


const teacherRepo = new TeacherRepo();
const classroomRepo = new ClassroomRepo()

const classroomInteractor = new ClassroomInteractor(classroomRepo, uniqueIdGenerator)
const teacherInteractor = new TeacherInteractor(teacherRepo, jwt, hashPassword, emailService, _, APIRequests);

const classroomGateway = new ClassroomGateway(classroomInteractor)
const teacherGateway = new TeacherController(teacherInteractor)

const teachrAuthInteractor = new TeacherAuthInteractor(jwt, teacherRepo)
const teacherAuth = new TeacherAuthMiddleware(teachrAuthInteractor)

const router = express.Router();

router.post('/register',
    validate(registrationSchema),
    teacherGateway.onRegister.bind(teacherGateway));

router.post('/verify',
    validate(verificationOTPSchema),
    teacherGateway.onVerifyOTP.bind(teacherGateway));

router.post('/login',
    validate(loginSchema),
    teacherGateway.onLogin.bind(teacherGateway));

router.post('/logout',
    validate(logoutSchema),
    teacherGateway.onLogout.bind(teacherGateway));

router.post('/google_login',
    validate(googelLoginSchema),
    teacherGateway.onGoogleLogin.bind(teacherGateway)
)

router.route('/classroom')
    .post(validate(createClassroomSchema),
        teacherAuth.authenticateTeacher.bind(teacherAuth),
        classroomGateway.onCreateClassroom.bind(classroomGateway))
    .get()

router.route('/classrooms/:class_teacher_id')
    .get(teacherAuth.authenticateTeacher.bind(teacherAuth),
        classroomGateway.onGetTeacherAllClassrooms.bind(classroomGateway))

router.route('/classroom/:classroom_id')
    .get(teacherAuth.authenticateTeacher.bind(teacherAuth),
        classroomGateway.onGetTeacherClassroom.bind(classroomGateway));

router.route('/classroom/:classroom_id/requests/accept')
    .patch(teacherAuth.authenticateTeacher.bind(teacherAuth),
    classroomGateway.onAcceptJoiningRequest.bind(classroomGateway)
)

router.route('/classroom/:classroom_id/requests/reject')
    .patch(teacherAuth.authenticateTeacher.bind(teacherAuth),
    classroomGateway.onRejectJoinRequest.bind(classroomGateway)
)

router.get('/auth',
    teacherAuth.authenticateTeacher.bind(teacherAuth),
    teacherGateway.onAuthRoute.bind(teacherGateway)
)

export default router;