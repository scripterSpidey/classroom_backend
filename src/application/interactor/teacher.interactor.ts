import { Teacher } from "../../domain/entities/teacher";
import { I_Bcrypt } from "../../interface/service_interface/I_bcrypt";
import { I_Mailer } from "../../interface/service_interface/I_mailer";
import { VerificationCodeType } from "../../interface/student_interface/I_student.verification";
import { I_TeacherInteractor, VerifyOTPInput } from "../../interface/teacher_interface/I_teacher.interactor";
import { I_TeacherRepo } from "../../interface/teacher_interface/I_teacher.repo";
import { generateSecureOTP } from "../../utils/randomGenerator";
import { otpExpiration } from "../../utils/timers";
import { LoDashStatic } from "lodash";
import { I_VerificationDocument } from "../../interface/student_interface/I_student.verification";
import { OTPexpirationTime } from "../../infrastructure/constants/appConstants";
import { I_JWT } from "../../interface/service_interface/I_jwt";
import { CostumeError } from "../../utils/costume.error";
import { Student } from "../../domain/entities/student";


export class TeacherInteractor implements I_TeacherInteractor{

    private repository:I_TeacherRepo;
    private jwt: I_JWT;
    private bcrypt:I_Bcrypt;
    private nodemailer:I_Mailer;
    private lodash: LoDashStatic;
    constructor(
        repository:I_TeacherRepo,
        jwt:I_JWT,
        bcrypt:I_Bcrypt,
        nodemailer:I_Mailer,
        lodash: LoDashStatic
    ){
        this.repository = repository;
        this.jwt = jwt;
        this.bcrypt = bcrypt;
        this.nodemailer = nodemailer;
        this.lodash = lodash
    }

    async register(data: any): Promise<any> {
        try {

            const existingTeacher = await this.repository.findTeacher(data.email);
            if(existingTeacher){
                throw new CostumeError(409,"This user already exist")
            }

            const hashedPassword = await this.bcrypt.encryptPassword(data.password);

            const newTeacher = Teacher.newTeacher(data.name,data.email,hashedPassword);

            const registerTeacher  = await this.repository.registerTeacher(newTeacher);

            const teacher = this.lodash.omit(registerTeacher.toObject(),['password','classrooms']);

            console.log(teacher);
            const otp = generateSecureOTP();

            await this.repository.createVerificationDocument({
                userId:registerTeacher._id,
                role:"teacher",
                email:registerTeacher.email,
                name:registerTeacher.name,
                type:VerificationCodeType.EmailVerification,
                createdAt:new Date(),
                expiresAt:otpExpiration(),
                otp
            });

            await this.nodemailer.sendEmail(registerTeacher.email,'otp',otp); 

            return{
                registered:true,
                message:"Registration successfull",
                data:teacher
            }
        } catch (error) {    
            throw error
        }
    }
    async verifyOTP(data: VerifyOTPInput): Promise<any|null> {
        try {

            const verificationDocument = await this.repository.getVerificationDocument(data.userId);
            
            if(!verificationDocument || verificationDocument.otp != data.otp || 
                ((Date.now()-verificationDocument.createdAt.getTime())>=OTPexpirationTime)){
                
                throw new CostumeError(401,"OTP expired or do not match")
            }

            await this.repository.verifyTeacher(data.userId)
            
            const session = await this.repository.createSession({
                userId:data.userId,
                role:"teacher",
                device:"laptop",
                active:true,
                createdAt:Date.now()
            })

            const accessToken = this.jwt.generateToken({
                sessionId:session._id,
                userId:data.userId
            },"1h");


            const refreshToken = this.jwt.generateToken({
                sessionId : session._id
            },"1d");

            return {
                status:200,
                verified:true,
                message:"OTP verification successfull",
                accessToken,
                refreshToken,
                data:{
                    id:data.userId
                }
            }

        } catch (error) {
            throw error
        }
        
    }
    async login(data:any): Promise<any> {
        try {
            
            const teacher = await this.repository.findTeacher(data.email)

            if(!teacher) throw new CostumeError(401,"User doesnot exist");

            if(teacher && await this.bcrypt.comparePassword(data.password,teacher.password)){

                const session = await this.repository.createSession({
                    userId:teacher._id,
                    role:'teacher',
                    device:'laptop',
                    createdAt:Date.now(),
                    active:true
                })

                const accessToken = this.jwt.generateToken({
                    userId:teacher._id,
                    sessionId:session._id
                },"2m");

                const refreshToken = this.jwt.generateToken({
                    sessionId:session._id
                },"1d");

                return{
                    authenticated:true,
                    message:"Logged in successully",
                    accessToken,
                    refreshToken,
                    data:{
                        email:teacher.email,
                        id:teacher._id,
                        name:teacher.name
                    }
                }
            }
            throw new CostumeError(401,"Invalid credentials");
        } catch (error) {
            throw error
        }
    }

    async logout(data: any): Promise<void> {
        try {
            await this.repository.endSession(data.userId,new Date())
            return
        } catch (error) {
            throw error
        }
    }

}