
import { Student } from "../../domain/entities/student";
import { I_Bcrypt } from "../../interface/service_interface/I_bcrypt";
import { I_StudentInteractor, ResendOTPInput } from "../../interface/student_interface/I_student.interactor";
import { I_StudentRepo } from "../../interface/student_interface/I_student.repo";
import { I_StudentVerificationRepo } from "../../interface/student_interface/I_StudentVerificationRepo";
import { otpExpiration } from "../../utils/timers";
import { VerificationCodeType } from "../../interface/student_interface/I_student.verification";
import { I_Mailer } from "../../interface/service_interface/I_mailer";
import { generateSecureOTP } from "../../utils/randomGenerator";
import { OTPexpirationTime } from "../../infrastructure/constants/appConstants";
import { StudentDocument } from "../../infrastructure/model/student.model";
import { threadId } from "worker_threads";
import { I_JWT } from "../../interface/service_interface/I_jwt";
import { CostumeError } from "../../utils/costume.error";
import { string } from "zod";
import { GoogleLoginInputType } from "../../schema/google.login.schema";
import { I_API } from "../../interface/service_interface/I_API.requests";



export class StudentInteractor implements I_StudentInteractor{

    
    private repository: I_StudentRepo;
    private hashPassword: I_Bcrypt;
    private verificationRepository: I_StudentVerificationRepo;
    private mailer: I_Mailer
    private jwt:I_JWT
    private api:I_API

    constructor(
        repository: I_StudentRepo,
        verificationRepository:I_StudentVerificationRepo,
        hashPassword:I_Bcrypt,
        mailer: I_Mailer,
        jwt:I_JWT,
        api:I_API
    ){
        this.repository = repository;
        this.hashPassword = hashPassword;
        this.verificationRepository = verificationRepository
        this.mailer = mailer;
        this.jwt = jwt;
        this.api = api;
    }
    
    

    async register(data: Student): Promise<any> {
            
        try {
            
            const studentExist = await this.repository.findStudent(data.email);
            if(studentExist){
                throw new CostumeError(409,"This user already exist")
            }
            const hashPassword = await this.hashPassword.encryptPassword(data.password as string);
            
            const newStudent =  Student.newStudent(
                data.name,
                data.email,
                hashPassword,
                false,
                false,
                [],
                null);

            const register =  await this.repository.registerStudent(newStudent);
           
            const otp = generateSecureOTP();

            await this.verificationRepository.saveDocument({
                email:register.email,
                name:register.name,
                role:"student",
                userId:register.id,
                type: VerificationCodeType.EmailVerification,
                createdAt:new Date(),
                expiresAt: otpExpiration(),
                otp
            });

            await this.mailer.sendEmail(register.email,"otp",otp)

            return{
                registered:true,
                message:'Registration successfull',
                email:register.email,
                id:register.id,
                name:register.name
            }
            
        } catch (error) {
            throw error
        }
    }

    async verifyOTP(otp:string,studentId:string):Promise<any>{
        try {
            const otpDocument = await this.verificationRepository.fetchOTP(studentId);

            if(!otpDocument) throw new CostumeError(404,'User not found');

            if(otpDocument && otpDocument.otp== otp
                 && (Date.now()-otpDocument.createdAt.getTime())<=OTPexpirationTime
                ){

                const verifiedStudent = await this.repository.verifyStudent(studentId);
                if(verifiedStudent){
                    const session = await this.repository.createSession({
                        userId:verifiedStudent._id,
                        role:"student",
                        device:"laptop",
                        active:true,
                        createdAt:Date.now()
                    })
                    const accessToken = this.jwt.generateToken({
                        sessionId:session._id,
                        userId:verifiedStudent._id
                    },"1h");

                    const refreshToken = this.jwt.generateToken({
                        sessionId : session._id
                    },"1d");
                    return {
                        accessToken,
                        refreshToken,
                        email:verifiedStudent.email,
                        userId:verifiedStudent._id,
                        name:verifiedStudent.name
                    }
                }else{
                    throw new CostumeError(401,"Verification failed")
                }
                
            }else{
                throw new CostumeError(401,"OTP doesnot match or expired")
            }
            }catch (error:any) {
                throw error
            }
        }

        async login(email: string, password: string): Promise<any> {
           try {
                const student = await this.repository.findStudent(email);
                
                if(student && await this.hashPassword.comparePassword(password,String(student?.password))){

                    const session = await this.repository.createSession({
                        userId:student._id,
                        role:"student",
                        device:"laptop",
                        active: true,
                        createdAt:Date.now(),
                    });

                    const accessToken = this.jwt.generateToken({
                        userId:student._id,
                        sessionId:session._id
                    },"1m");

                    const refreshToken = this.jwt.generateToken({
                        sessionId : session._id
                    },"1d");

                    return {
                        status:200,
                        authenticated:true,
                        message:"Logged in successfully",
                        accessToken,
                        refreshToken,
                        email:student.email,
                        id:student._id,
                        name:student.name
                    }
                }else{
                    return {
                        status:401,
                        authenticated:false,
                        message:"Invalid credentials",
                        data:null
                    }
                }
           } catch (error) {
                throw error
           }
        }
      
        async logout(userId:string):Promise<void>  {
            try {
                await this.repository.endSession(userId);
            } catch (error) {
                throw error
            }
        }

        async resendOTP(data: ResendOTPInput): Promise<any> {
            try {
                const otp = generateSecureOTP();

                await this.verificationRepository.updateOTP({
                    userId:data.userId,
                    otp
                });

                this.mailer.sendEmail(data.userEmail,"otp",otp)
                
            } catch (error) {
                throw error;
            }
        }

       

        async googleLogin(data: GoogleLoginInputType): Promise<object> {
            try {
                
                const userProfile= await this.api.getUserProfileFromGoogle(data)
                
                let existingStudent = await this.repository.findStudent(userProfile.email);
                
                if(!existingStudent){

                    const newStudent =  Student.newStudent(
                        userProfile.name,
                        userProfile.email,
                        null,
                        false,
                        true,
                        [],
                        userProfile.picture
                    );
    
                    existingStudent = await this.repository.registerStudent(newStudent);
                }

                const session = await this.repository.createSession({
                    userId:existingStudent?._id,
                    role:"student",
                    device:"laptop",
                    active: true,
                    createdAt:Date.now(),
                });

                const accessToken = this.jwt.generateToken({
                    userId:existingStudent?._id,
                    sessionId:session._id
                },"1m");

                const refreshToken = this.jwt.generateToken({
                    sessionId : session._id
                },"1d");
                
                return {
                    authenticated:true,
                    message:'google login successfull',
                    accessToken,
                    refreshToken,
                    email:existingStudent?.email,
                    id:existingStudent?._id,
                    name:existingStudent?.name,
                    profile_image:existingStudent?.profile_image
                }
            } catch (error) {
                throw error
            }
        }
    }



