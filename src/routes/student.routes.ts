import express from "express";
import { StudentRepo } from "../infrastructure/repositories/student.repo";
import { StudentInteractor } from "../application/interactor/student.interactor";
import { StudentController } from "../presentation/controllers/student.controller";
import { registrationSchema } from "../schema/registration.schema";
import { verificationOTPSchema } from "../schema/otp.verification.schema";
import { HashPassword } from "../application/service/bcrypt";
import validate from "../presentation/middleware/validate.req.data.middleware";
import { StudentVerificationRepo } from "../infrastructure/repositories/student.verification.repo";
import { EmailService } from "../application/service/mailer";
import { JWT } from "../application/service/jwt";
import { StudentAuthMiddleware } from "../presentation/middleware/student.auth.middleware";
import { StudentAuthInteractor } from "../application/interactor/student.auth.interactor";
import { loginSchema } from "../schema/login.schema";
import { logoutSchema } from "../schema/logut.schema";

// services
const bcrypt = new HashPassword();
const jwtTokens = new JWT();
const emailService = new EmailService();

// repositories
const studentRepo = new StudentRepo();
const verificationRepo = new StudentVerificationRepo();

// interactors
const studentInteractor = new StudentInteractor(studentRepo,verificationRepo,bcrypt,emailService,jwtTokens);

//controller
const studentController = new StudentController(studentInteractor);

const authMiddlewareInteractor = new StudentAuthInteractor(jwtTokens,studentRepo);
const studentAuth = new StudentAuthMiddleware(authMiddlewareInteractor);


const router = express.Router();

//authentication

router.post('/register',
    validate(registrationSchema),
    studentController.onRegister.bind(studentController));
router.post('/register/verify',
    validate(verificationOTPSchema),
    studentController.onVerifyOTP.bind(studentController));
router.post('/login',
    validate(loginSchema),
    studentController.onLogin.bind(studentController));
router.post('/logout',
    validate(logoutSchema),
    studentController.onLogout.bind(studentController))
router.get('/auth',
    studentAuth.authenticateHandler.bind(studentAuth),
    studentController.onAuthRoute.bind(studentController))

export default router 