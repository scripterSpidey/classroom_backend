import { I_TeacherInteractor } from "../../interface/teacher_interface/I_teacher.interactor";

export class TeacherInteractor implements I_TeacherInteractor{
    register(data: any): Promise<any> {
        throw new Error("Method not implemented.");
    }
    verifyOTP(otp: string, studentId: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    login(email: string, password: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    logout(userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}