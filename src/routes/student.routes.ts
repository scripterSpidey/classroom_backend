import express from "express";
import { StudentRepo } from "../infrastructure/repositories/studentRepo";
import { StudentInteractor } from "../application/interactor/student.interactor";
import { StudentController } from "../presentation/controllers/student.controller";
import { createStudentSchema } from "../schema/registerStudentSchema";
import { verificationOTPSchema } from "../schema/otpVerification";
import { HashPassword } from "../application/service/bcrypt";
import validate from "../presentation/middleware/validateRegistrationData";
import { StudentVerificationRepo } from "../infrastructure/repositories/student.verification.repo";
import { EmailService } from "../application/service/mailer";
import { JWT } from "../application/service/jwt";
import { AuthMiddleware } from "../presentation/middleware/authenticationMiddleware";
import { AuthMiddlewareInteractor } from "../application/interactor/middleware.interactor";
import { SessionRepo } from "../infrastructure/repositories/session.repo";
const bcrypt = new HashPassword();
const jwtTokens = new JWT();
const studentRepo = new StudentRepo();
const verificationRepo = new StudentVerificationRepo();
// const sessionRepo = new SessionRepo()
const emailService = new EmailService()
const studentInteractor = new StudentInteractor(studentRepo,verificationRepo,bcrypt,emailService,jwtTokens);
const studentController = new StudentController(studentInteractor);

const authMiddlewareInteractor = new AuthMiddlewareInteractor(jwtTokens,studentRepo);
const authMiddleware = new AuthMiddleware(authMiddlewareInteractor);


const router = express.Router();

router.post('/register',validate(createStudentSchema),studentController.onRegister.bind(studentController));
router.post('/register/verify_otp',validate(verificationOTPSchema),studentController.onVerifyOTP.bind(studentController));
router.post('/login',studentController.onLogin.bind(studentController));
router.post('/logout',studentController.onLogout.bind(studentController))
router.get('/auth',authMiddleware.authenticateHandler.bind(authMiddleware),studentController.onAuthRoute.bind(studentController))

export default router 