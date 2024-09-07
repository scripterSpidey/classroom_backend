import { AnnouncementsDocument } from "../../infrastructure/model/announcements.model";
import { ClassroomDocument, ClassroomMaterialType, ClassroomMessage } from "../../infrastructure/model/classroom.model";
import { ExamAttendedType, ExamsDocument } from "../../infrastructure/model/exam.model";
import { PrivateChatDocument } from "../../infrastructure/model/private.chat.model";
import { StudentDocument } from "../../infrastructure/model/student.model";
import { WorksDocument, WorkSubmissionType } from "../../infrastructure/model/works.model";

export interface I_StudentClassroomRepo {
    fetchClassroom(data: string, student_id: string): Promise<ClassroomDocument | null>;
    
    saveJoiningRequest(classroom_id: string, student_id: string): Promise<ClassroomDocument | null>;

    fetchAllClassroomsOfStudent(student_id: string): Promise<StudentDocument | null>;

    fetchClassroomDetailsForStudent(classroom_id: string,student_id:string): Promise<ClassroomDocument | null>;

    saveClassroomMessage(classroom_id:string,message:ClassroomMessage):Promise<ClassroomMessage>;

    fetchClassroomMessages(classroom_id:string):Promise<ClassroomDocument[]|null>;

    savePrivateMessage(data:PrivateChatDocument):Promise<PrivateChatDocument>;

    fetchPrivateMessages(senderId:string,receiverId:string,classroomId:string):Promise<PrivateChatDocument[]>
    
    fetchClassroomMaterials(classroomId:string,classTeacherId:string,):Promise<ClassroomMaterialType[]|null>;

    fetchAllClassroomWorks(clasroomId:string):Promise<WorksDocument[]|null>;

    saveSubmittedWork(classroomId:string,workId:string,work:WorkSubmissionType):Promise<WorksDocument|null>;

    findWork(workId:string):Promise<WorksDocument|null>;

    fetchAnnouncements(classroomId:string):Promise<AnnouncementsDocument[]|null>;

    fetchAllExams(classroomId:string):Promise<ExamsDocument[]>;

    saveNewExamCandidate(classroomId:string,examId:string,studentId:string):Promise<void>;

    fetchExamDetails(clasroomId:string,examId:string):Promise<ExamsDocument|null>;

    saveAnswers(clasroomId: string, examId: string,data:ExamAttendedType):Promise<any>;

    findSubmission(clasroomId: string, examId: string,studentId:string):Promise<any>;

    saveJoiningStudentInfoInLiveClass(clasroomId: string,studentId:string): Promise<any>
}