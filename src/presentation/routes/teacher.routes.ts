import express from "express";

import { TeacherInteractor } from "../../application/interactor/teacher.interactor";
import { TeacherController } from "../gateway/teacher.gateway";
import { TeacherRepo } from "../../infrastructure/repositories/teacher.repo";
import { HashPassword } from "../../application/service/bcrypt";
import { EmailService } from "../../application/service/mailer";
import { JWT } from "../../application/service/jwt";
import _ from "lodash";
import validate from "../middleware/validate.req.data.middleware";
import { registrationSchema } from "../../schema/registration.schema";
import { verificationOTPSchema } from "../../schema/otp.verification.schema";
import { loginSchema } from "../../schema/login.schema";
import { logoutSchema } from "../../schema/logut.schema";
import { TeacherAuthMiddleware } from "../middleware/teacher.auth.middleware";
import { TeacherAuthInteractor } from "../../application/interactor/teacher.auth.interactor";
import { googelLoginSchema } from "../../schema/google.login.schema";
import { API } from "../../application/service/api.requests";
import { AWSS3Bucket } from "../../application/service/aws.s3.bucket";
import { FileModifier } from "../../application/service/sharp";
import multer from "multer";
import teacherRouter from "./teacher.classroom.route";
import { StudentRepo } from "../../infrastructure/repositories/student.repo";

const storage = multer.memoryStorage()
const upload = multer({ storage });
//services
const hashPassword = new HashPassword();
const emailService = new EmailService();
const jwt = new JWT();
const APIRequests = new API();
const s3Bucket = new AWSS3Bucket();
const sharp = new FileModifier()

//repositories
const teacherRepo = new TeacherRepo();
const studentRepo = new StudentRepo();
//interactor
const teacherInteractor = new TeacherInteractor(
    teacherRepo,
    studentRepo,
    jwt,
    hashPassword,
    emailService,
    _,
    APIRequests,
    s3Bucket,
    sharp
);
const teachrAuthInteractor = new TeacherAuthInteractor(jwt, teacherRepo);


//gateways
const teacherGateway = new TeacherController(teacherInteractor)

//middlewares
const teacherAuth = new TeacherAuthMiddleware(teachrAuthInteractor);


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

router.route('/profile/image')
    .post(teacherAuth.authenticateTeacher.bind(teacherAuth) as express.RequestHandler,
        upload.single('profile_image'),
        teacherGateway.onProfielImageUpload.bind(teacherGateway) as express.RequestHandler)

router.get('/auth',
    teacherAuth.authenticateTeacher.bind(teacherAuth) as express.RequestHandler,
    teacherGateway.onAuthRoute.bind(teacherGateway) as express.RequestHandler
)

router.use('/classroom',
    teacherAuth.authenticateTeacher.bind(teacherAuth) as express.RequestHandler,
    teacherRouter
)

export default router;