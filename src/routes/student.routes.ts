import express from "express";
import { StudentRepo } from "../infrastructure/repositories/student.repo";
import { StudentInteractor } from "../application/interactor/student.interactor";
import { StudentController } from "../presentation/gateway/student.gateway";
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
import { googelLoginSchema } from "../schema/google.login.schema";

import { API } from "../application/service/api.requests";

// services
const bcrypt = new HashPassword();
const jwtTokens = new JWT();
const emailService = new EmailService();
const APIRequests = new API()

// repositories
const studentRepo = new StudentRepo();
const verificationRepo = new StudentVerificationRepo();

// interactors
const studentInteractor = new StudentInteractor(studentRepo,verificationRepo,bcrypt,emailService,jwtTokens,APIRequests);

//controller
const studentGateway = new StudentController(studentInteractor);

const authMiddlewareInteractor = new StudentAuthInteractor(jwtTokens,studentRepo);
const studentAuth = new StudentAuthMiddleware(authMiddlewareInteractor);


const router = express.Router();

//authentication

router.post('/register',
    validate(registrationSchema),
    studentGateway.onRegister.bind(studentGateway));
router.post('/verify',
    validate(verificationOTPSchema),
    studentGateway.onVerifyOTP.bind(studentGateway));
router.post('/login',
    validate(loginSchema),
    studentGateway.onLogin.bind(studentGateway));
router.post('/logout',
    validate(logoutSchema),
    studentGateway.onLogout.bind(studentGateway))
router.patch('/resend_otp',
    studentGateway.onResendOTP.bind(studentGateway)
)

router.post('/google_login',
    validate(googelLoginSchema),
    studentGateway.onGoogleLogin.bind(studentGateway)
)


router.get('/auth',
    studentAuth.authenticateStudent.bind(studentAuth),
    studentGateway.onAuthRoute.bind(studentGateway))



export default router 