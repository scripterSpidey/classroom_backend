import express, { NextFunction, RequestHandler } from "express";
import { StudentRepo } from "../../infrastructure/repositories/student.repo";
import { StudentInteractor } from "../../application/interactor/student.interactor";
import { StudentController } from "../gateway/student.gateway";
import { registrationSchema } from "../../schema/registration.schema";
import { verificationOTPSchema } from "../../schema/otp.verification.schema";
import { HashPassword } from "../../application/service/bcrypt";
import validate from "../middleware/validate.req.data.middleware";
import { StudentVerificationRepo } from "../../infrastructure/repositories/student.verification.repo";
import { EmailService } from "../../application/service/mailer";
import { JWT } from "../../application/service/jwt";
import { StudentAuthMiddleware } from "../middleware/student.auth.middleware";
import { StudentAuthInteractor } from "../../application/interactor/student.auth.interactor";
import { loginSchema } from "../../schema/login.schema";
import { logoutSchema } from "../../schema/logut.schema";
import { googelLoginSchema } from "../../schema/google.login.schema";
import { API } from "../../application/service/api.requests";
import classroomRouter from "./student.classrooms.route";
import multer from "multer";
import { AWSS3Bucket } from "../../application/service/aws.s3.bucket";
import { FileModifier } from "../../application/service/sharp";
import { TeacherRepo } from "../../infrastructure/repositories/teacher.repo";
import { CostumeRequest } from "../../interface/I_express.request";


const storage = multer.memoryStorage()
const upload = multer({ storage });


// services
const bcrypt = new HashPassword();
const jwtTokens = new JWT();
const emailService = new EmailService();
const APIRequests = new API();
const s3Bucket = new AWSS3Bucket();
const sharp = new FileModifier()

// repositories
const teacherRepo = new TeacherRepo()
const studentRepo = new StudentRepo();
const verificationRepo = new StudentVerificationRepo();

// interactors 
const studentInteractor = new StudentInteractor(
    studentRepo,
    teacherRepo,
    verificationRepo,
    bcrypt,
    emailService,
    jwtTokens,
    APIRequests,
    s3Bucket,
    sharp
);
const authMiddlewareInteractor = new StudentAuthInteractor(jwtTokens, studentRepo);


//gateways
const studentGateway = new StudentController(studentInteractor);

//middlewares
const studentAuth = new StudentAuthMiddleware(authMiddlewareInteractor);

const router = express.Router();


router.post('/register',
    validate(registrationSchema),
    studentGateway.onRegister.bind(studentGateway) as express.RequestHandler);

router.post('/verify',
    validate(verificationOTPSchema),
    studentGateway.onVerifyOTP.bind(studentGateway) as express.RequestHandler);

router.post('/login',
    validate(loginSchema),
    studentGateway.onLogin.bind(studentGateway) as express.RequestHandler);

router.post('/logout',
    validate(logoutSchema),
    studentGateway.onLogout.bind(studentGateway) as express.RequestHandler)

router.patch('/resend_otp',
    studentGateway.onResendOTP.bind(studentGateway) as express.RequestHandler
)

router.post('/google_login',
    validate(googelLoginSchema),
    studentGateway.onGoogleLogin.bind(studentGateway) as RequestHandler
)

router.route('/forgotPassword')
    .post(studentGateway.onForgotPassword.bind(studentGateway) as RequestHandler)

router.route('/resetPassword/:resetPasswordToken')
    .post(studentGateway.onResetPassword.bind(studentGateway) as RequestHandler)

router.route('/profile')
    .get()
    .post()

router.route('/profile/image')
    .post(studentAuth.authenticateStudent.bind(studentAuth) as express.RequestHandler,
        upload.single('profile_image'),
        studentGateway.onProfielImageUpload.bind(studentGateway) as express.RequestHandler)

router.get('/auth',
    studentAuth.authenticateStudent.bind(studentAuth) as express.RequestHandler,
    studentGateway.onAuthRoute.bind(studentGateway) as express.RequestHandler)


router.use('/classroom',
    studentAuth.authenticateStudent.bind(studentAuth) as express.RequestHandler,
    classroomRouter)


export default router 