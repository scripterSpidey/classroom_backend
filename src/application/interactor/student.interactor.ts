
import { Student } from "../../domain/entities/student";
import { I_Bcrypt } from "../../interface/service_interface/I_bcrypt";
import { I_StudentInteractor } from "../../interface/student_interface/I_student.interactor";
import { I_StudentRepo } from "../../interface/student_interface/I_student.repo";
import { I_StudentVerificationRepo } from "../../interface/student_interface/I_StudentVerificationRepo";
import { otpExpiration } from "../../utils/timers";
import { VerificationCodeType } from "../../interface/student_interface/I_studentVerification";
import { I_Mailer } from "../../interface/service_interface/I_mailer";
import { generateSecureOTP } from "../../utils/randomGenerator";
import { OTPexpirationTime } from "../../infrastructure/constants/appConstants";
import { StudentDocument } from "../../infrastructure/model/student.model";
import { threadId } from "worker_threads";
import { I_JWT } from "../../interface/service_interface/I_jwt";


export class StudentInteractor implements I_StudentInteractor{

    
    private repository: I_StudentRepo;
    private hashPassword: I_Bcrypt;
    private verificationRepository: I_StudentVerificationRepo;
    private mailer: I_Mailer
    private jwt:I_JWT

    constructor(
        repository: I_StudentRepo,
        verificationRepository:I_StudentVerificationRepo,
        hashPassword:I_Bcrypt,
        mailer: I_Mailer,
        jwt:I_JWT
    ){
        this.repository = repository;
        this.hashPassword = hashPassword;
        this.verificationRepository = verificationRepository
        this.mailer = mailer;
        this.jwt = jwt;
    }
    
    

    async register(data: Student): Promise<any> {
            
        try {
            const hashPassword = await this.hashPassword.encryptPassword(data.password);

            const studentExist = await this.repository.findStudent(data.email);
            if(studentExist){
                return{
                    status:409,
                    registered:false,
                    message:"This account already exists",
                    data:null
                }
            }

            const newStudent =  Student.newStudent(data.name,data.email,hashPassword);

            const register =  await this.repository.registerStudent(newStudent);
           
            const otp = generateSecureOTP();

            await this.verificationRepository.saveDocument({
                email:register.email,
                name:register.name,
                userId:register.id,
                type: VerificationCodeType.EmailVerification,
                expiresAt: otpExpiration(),
                otp
            });

            await this.mailer.sendEmail(register.email,"otp",otp)

            return{
                status:201,
                registered:true,
                message:'Registration successfull',
                data:register
            }
            
        } catch (error) {
            throw error
        }
    }

    async verifyOTP(otp:string,studentId:string):Promise<any>{
        try {
            const otpDocument = await this.verificationRepository.fetchOTP(studentId);
        
            if(otpDocument && otpDocument.otp!= otp && (Date.now()-otpDocument.createdAt.getTime())<=OTPexpirationTime){

                const verifiedStudent = await this.repository.verifyStudent(studentId);

                if(verifiedStudent){
                    const session = await this.repository.createSession({
                        userId:verifiedStudent._id,
                        role:"student",
                        device:"laptop",
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
                        status:200,
                        verified:true,
                        message:"OTP verification successfull",
                        accessToken,
                        refreshToken,
                        data:{
                            email:verifiedStudent.email,
                            userId:verifiedStudent._id,
                            name:verifiedStudent.name
                        }
                    }
                }else{
                    throw new Error("oops! something went wrong")
                }
                
            }else{
                return {
                    status:401,
                    verified:false,
                    message:"OTP expired or doesnot match",
                    data:null
                }
            }
            }catch (error:any) {
                throw error
            }
        }

        async login(email: string, password: string): Promise<any> {
           try {
                const student = await this.repository.findStudent(email);
                if(student && await this.hashPassword.comparePassword(password,student?.password)){

                    const session = await this.repository.createSession({
                        userId:student._id,
                        role:"student",
                        device:"laptop",
                        createdAt:Date.now(),
                        active: true
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
                        data:{
                            email:student.email,
                            id:student._id,
                            name:student.name
                        }
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
    }



