
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
import { I_JWT, UserJwtPayload } from "../../interface/service_interface/I_jwt";
import { CostumeError } from "../../utils/costume.error";
import { GoogleLoginInputType } from "../../schema/google.login.schema";
import { I_API } from "../../interface/service_interface/I_API.requests";
import { I_S3Bucket } from "../../interface/service_interface/I_S3.bucket";
import { JwtPayload } from "jsonwebtoken";
import { I_Sharp } from "../../interface/service_interface/I_sharp";
import { AWS_S3_BUCKET_NAME } from "../../infrastructure/constants/env";
import { I_TeacherRepo } from "../../interface/teacher_interface/I_teacher.repo";
import { TeacherDocument } from "../../infrastructure/model/teacher.model";



export class StudentInteractor implements I_StudentInteractor{

    
    private repository: I_StudentRepo;
    private teacherRepo:I_TeacherRepo
    private hashPassword: I_Bcrypt;
    private verificationRepository: I_StudentVerificationRepo;
    private mailer: I_Mailer
    private jwt:I_JWT
    private api:I_API
    private s3Bucket:I_S3Bucket
    private sharp:I_Sharp

    constructor(
        repository: I_StudentRepo,
        teacherRepo:I_TeacherRepo,
        verificationRepository:I_StudentVerificationRepo,
        hashPassword:I_Bcrypt,
        mailer: I_Mailer,
        jwt:I_JWT,
        api:I_API,
        s3Bucket:I_S3Bucket,
        sharp:I_Sharp
    ){
        this.repository = repository;
        this.teacherRepo = teacherRepo;
        this.hashPassword = hashPassword;
        this.verificationRepository = verificationRepository
        this.mailer = mailer;
        this.jwt = jwt;
        this.api = api;
        this.s3Bucket = s3Bucket
        this.sharp = sharp
    }
    
    

    async register(data: Student): Promise<any> {
            
        try {
            
            const studentExist = await this.repository.findStudent(data.email);
            const teacherExist = await this.teacherRepo.findTeacher(data.email)
            if(studentExist || teacherExist){
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
                        ...verifiedStudent.toObject()
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
                    student.password = ''
                    return {
                        accessToken,
                        refreshToken,
                        ...student.toObject()
                    }
                }else{
                    throw new CostumeError(401,"Password doesnot match")
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
                let existingTeacher = await this.teacherRepo.findTeacher(userProfile.email);
                if(existingTeacher) throw new CostumeError(403,"This is an admin account! choose a different one for student!")
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

                
                existingStudent.password = ''
                return {
                    accessToken,
                    refreshToken,
                    ...existingStudent.toObject()
                }
            } catch (error) {
                throw error
            }
        }

        async uploadProfileImage(user:JwtPayload|null,file:Express.Multer.File):Promise<StudentDocument|null>{
          try {
       
            
            if(!file)  throw new CostumeError(404,'Profile image is missing');

            
            const imageName = `image-${user!.userId}`
            const imageUrl = `https://${AWS_S3_BUCKET_NAME}.s3.amazonaws.com/profile_images/${imageName}`
            const contentType = file.mimetype
            
            const resizedImage = await this.sharp.resizeImage(file.buffer)

            await this.s3Bucket.uploadProfileImage(imageName,resizedImage,contentType);


            const data = await this.repository.saveProfileImage(user!.userId,imageUrl);

            return data;
          } catch (error) {

            throw error
          }  
        }

        async validateStudent(user: UserJwtPayload): Promise<StudentDocument | null> {
            try {
                const student = this.repository.findStudentById(user.userId);
                if(!student) throw new CostumeError(404,"Can not find your account")
                return student
            } catch (error) {
                throw error;
            }
        }
    }



