import express from "express";

import { TeacherInteractor } from "../application/interactor/teacher.interactor";
import { TeacherController } from "../presentation/controllers/teacher.controller";
import { TeacherRepo } from "../infrastructure/repositories/teacher.repo";
import { HashPassword } from "../application/service/bcrypt";
import { EmailService } from "../application/service/mailer";
import { JWT } from "../application/service/jwt";
import _ from "lodash";

import validate from "../presentation/middleware/validate.req.data.middleware";
import { registrationSchema } from "../schema/registration.schema";
import { verificationOTPSchema } from "../schema/otp.verification.schema";
import { loginSchema } from "../schema/login.schema";
import { logoutSchema } from "../schema/logut.schema";
import { TeacherAuthMiddleware } from "../presentation/middleware/teacher.auth.middleware";
import { TeacherAuthInteractor } from "../application/interactor/teacher.auth.interactor";


const hashPassword = new HashPassword();
const emailService = new EmailService();
const jwt = new JWT()


const teacherRepo = new TeacherRepo()
const teacherInteractor = new TeacherInteractor(teacherRepo,jwt,hashPassword,emailService,_)
const teacherContoller = new TeacherController(teacherInteractor)

const studentAuthInteractor = new TeacherAuthInteractor(jwt,teacherRepo)
const teacherAuth = new TeacherAuthMiddleware(studentAuthInteractor)

const router = express.Router();

router.post('/register',
    validate(registrationSchema),
    teacherContoller.onRegister.bind(teacherContoller));

router.post('/register/verify',
    validate(verificationOTPSchema),
    teacherContoller.onVerifyOTP.bind(teacherContoller));

router.post('/login',
    validate(loginSchema),
    teacherContoller.onLogin.bind(teacherContoller));

router.post('/logout',
    validate(logoutSchema),
    teacherContoller.onLogout.bind(teacherContoller));

router.get('/auth',
    teacherAuth.authenticateHandler.bind(teacherAuth),
    teacherContoller.onAuthRoute.bind(teacherContoller)
)

export default router;