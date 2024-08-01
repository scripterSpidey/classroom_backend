import { Teacher } from "../../domain/entities/teacher";
import { I_Bcrypt } from "../../interface/service_interface/I_bcrypt";
import { I_Mailer } from "../../interface/service_interface/I_mailer";
import { VerificationCodeType } from "../../interface/student_interface/I_student.verification";
import { I_TeacherInteractor, VerifyOTPInput } from "../../interface/teacher_interface/I_teacher.interactor";
import { I_TeacherRepo } from "../../interface/teacher_interface/I_teacher.repo";
import { generateSecureOTP } from "../../utils/randomGenerator";
import { otpExpiration } from "../../utils/timers";
import { LoDashStatic } from "lodash";
import { OTPexpirationTime } from "../../infrastructure/constants/appConstants";
import { I_JWT } from "../../interface/service_interface/I_jwt";
import { CostumeError } from "../../utils/costume.error";
import { GoogleLoginInputType } from "../../schema/google.login.schema";
import { I_API } from "../../interface/service_interface/I_API.requests";
import { TeacherRepo } from "../../infrastructure/repositories/teacher.repo";


export class TeacherInteractor implements I_TeacherInteractor {

    private repository: I_TeacherRepo;
    private jwt: I_JWT;
    private bcrypt: I_Bcrypt;
    private nodemailer: I_Mailer;
    private lodash: LoDashStatic;
    private api:I_API
    constructor(
        repository: I_TeacherRepo,
        jwt: I_JWT,
        bcrypt: I_Bcrypt,
        nodemailer: I_Mailer,
        lodash: LoDashStatic,
        api:I_API
    ) {
        this.repository = repository;
        this.jwt = jwt;
        this.bcrypt = bcrypt;
        this.nodemailer = nodemailer;
        this.lodash = lodash,
        this.api = api;
    }
    
    resendOTP(data: { userId: string; userEmail: string; }): Promise<any> {
        throw new Error("Method not implemented.");
    }

    async register(data: any): Promise<any> {
        try {

            const existingTeacher = await this.repository.findTeacher(data.email);
            if (existingTeacher) {
                throw new CostumeError(409, "This user already exist")
            }

            const hashedPassword = await this.bcrypt.encryptPassword(data.password);

            const newTeacher = Teacher.newTeacher(data.name,
                data.email,
                hashedPassword,
                false,
                false,
                [],
                null);

            const registerTeacher = await this.repository.registerTeacher(newTeacher);

            const teacher = this.lodash.omit(registerTeacher.toObject(), ['password', 'classrooms']);

            console.log(teacher);
            const otp = generateSecureOTP();

            await this.repository.createVerificationDocument({
                userId: registerTeacher._id,
                role: "teacher",
                email: registerTeacher.email,
                name: registerTeacher.name,
                type: VerificationCodeType.EmailVerification,
                createdAt: new Date(),
                expiresAt: otpExpiration(),
                otp
            });

            await this.nodemailer.sendEmail(registerTeacher.email, 'otp', otp);

            return {
                registered: true,
                message: "Registration successfull",
                id: teacher._id,
                email: teacher.email,
                name: teacher.name
            }
        } catch (error) {
            throw error
        }
    }
    async verifyOTP(data: VerifyOTPInput): Promise<any | null> {
        try {

            const verificationDocument = await this.repository.getVerificationDocument(data.userId);

            if (!verificationDocument || verificationDocument.otp != data.otp ||
                ((Date.now() - verificationDocument.createdAt.getTime()) >= OTPexpirationTime)) {

                throw new CostumeError(401, "OTP expired or do not match")
            }

            const verify = await this.repository.verifyTeacher(data.userId)

            const session = await this.repository.createSession({
                userId: data.userId,
                role: "teacher",
                device: "laptop",
                active: true,
                createdAt: Date.now()
            })

            const accessToken = this.jwt.generateToken({
                sessionId: session._id,
                userId: data.userId
            }, "1h");


            const refreshToken = this.jwt.generateToken({
                sessionId: session._id,
                userId: data.userId
            }, "1d");

            return {
                
                accessToken,
                refreshToken,
                ...verify!.toObject()
            }

        } catch (error) {
            throw error
        }

    }
    async login(data: any): Promise<any> {
        try {

            const teacher = await this.repository.findTeacher(data.email)

            if (!teacher) throw new CostumeError(401, "User doesnot exist");

            if (teacher && await this.bcrypt.comparePassword(data.password, String(teacher.password))) {

                const session = await this.repository.createSession({
                    userId: teacher._id,
                    role: 'teacher',
                    device: 'laptop',
                    createdAt: Date.now(),
                    active: true
                })

                const accessToken = this.jwt.generateToken({
                    userId: teacher._id,
                    sessionId: session._id
                }, "2m");

                const refreshToken = this.jwt.generateToken({
                    userId: teacher._id,
                    sessionId: session._id
                }, "1d");
                teacher.password = ''
                return {
                   
                    accessToken,
                    refreshToken,
                    ...teacher.toObject()
                }
            }
            throw new CostumeError(401, "Invalid credentials");
        } catch (error) {
            throw error
        }
    }



    async logout(data: any): Promise<void> {
        try {
            await this.repository.endSession(data.userId, new Date())
            return
        } catch (error) {
            throw error
        }
    }

    async googleLogin(data: GoogleLoginInputType): Promise<object> {
        try {

            const userProfile = await this.api.getUserProfileFromGoogle(data)

            let existingTeacher = await this.repository.findTeacher(userProfile.email);

            if (!existingTeacher) {

                const newTeacher = Teacher.newTeacher(
                    userProfile.name,
                    userProfile.email,
                    null,
                    false,
                    true,
                    [],
                    userProfile.picture
                );

                existingTeacher = await this.repository.registerTeacher(newTeacher);
            }
            existingTeacher.password = ''
            const session = await this.repository.createSession({
                userId: existingTeacher?._id,
                role: "teacher",
                device: "laptop",
                active: true,
                createdAt: Date.now(),
            });

            const accessToken = this.jwt.generateToken({
                userId: existingTeacher?._id,
                sessionId: session._id
            }, "1m");

            const refreshToken = this.jwt.generateToken({
                userId: existingTeacher?._id,
                sessionId: session._id
            }, "1d");
            console.log('existing teacher from google: ',existingTeacher)
            return {
               
                accessToken,
                refreshToken,
                ...existingTeacher.toObject()
            }
        } catch (error) {
            throw error
        }
    }

}