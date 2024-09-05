import { ClassroomDocument, ClassroomMaterialType, ClassroomMessage, ClassroomModel } from "../model/classroom.model";
import { StudentDocument, StudentModel } from "../model/student.model";
import { I_StudentClassroomRepo } from "../../interface/classroom_interface/I_student.classroom.repo";
import { ObjectId } from "mongodb";
import mongoose, { Aggregate } from "mongoose";
import { CostumeError } from "../../utils/costume.error";
import { PrivateChatDocument, PrivateChatModel } from "../model/private.chat.model";
import { WorksDocument, WorksModel, WorkSubmissionType } from "../model/works.model";
import { AnnouncementsDocument, AnnouncementsModel } from "../model/announcements.model";
import { ExamAttendedType, ExamsDocument, ExamsModel } from "../model/exam.model";

export class StudentClassroomRepo implements I_StudentClassroomRepo {


    async fetchAllClassroomsOfStudent(student_id: string): Promise<StudentDocument | null> {
        try {
            return await StudentModel.findById(student_id)
        } catch (error) {
            throw error;
        }
    }

    async fetchClassroom(classroom_id: string, student_id: string): Promise<ClassroomDocument | null> {
        try {

            return await ClassroomModel.findOne({
                classroom_id,
                "students.student_id": { $ne: student_id },
                joining_requests: { $nin: student_id }
            })


        } catch (error) {
            throw error
        }
    }

    async saveJoiningRequest(classroom_id: string, student_id: string): Promise<ClassroomDocument | null> {
        try {
            return await ClassroomModel.findOneAndUpdate(
                { classroom_id },
                { $addToSet: { joining_requests: student_id } },
                { new: true }
            )
        } catch (error) {
            throw error
        }
    }

    async fetchClassroomDetailsForStudent(classroom_id: string, student_id: string): Promise<ClassroomDocument | null> {
        try {

            const classroom = await ClassroomModel.findById(
                {
                    _id: classroom_id,
                    'students.student_id': student_id
                }
            ).populate('students');


            return classroom;
        } catch (error) {
            throw error
        }
    }

    async saveClassroomMessage(classroom_id: string, message: ClassroomMessage): Promise<ClassroomMessage> {
        try {
            const chat = await ClassroomModel.findByIdAndUpdate(
                classroom_id,
                { $addToSet: { classroom_messages: message } },
                { new: true, projection: { classroom_messages: { $slice: -1 } } }
            )
            if (!chat) throw new CostumeError(404, "Failed to save message")

            return chat.classroom_messages[0]
        } catch (error) {
            throw error
        }
    }
    async fetchClassroomMessages(classroom_id: string): Promise<ClassroomDocument[] | null> {
        try {
            // return await ClassroomModel.findById(classroom_id).select('classroom_messages');
            const aggregation: Aggregate<Array<ClassroomDocument>> = ClassroomModel.aggregate([
                { $match: { _id: new ObjectId(classroom_id) } },
                { $unwind: "$classroom_messages" },
                { $sort: { "classroom_messages.send_at": 1 } },
                {
                    $group: {
                        _id: "$_id",
                        classroom_messages: { $push: "$classroom_messages" }
                    }
                },
                { $project: { classroom_messages: 1 } }
            ]);


            const message: Array<ClassroomDocument> = await aggregation.exec();

            return message
        } catch (error) {
            throw error
        }
    }

    async savePrivateMessage(data: PrivateChatDocument): Promise<PrivateChatDocument> {
        try {
            return await new PrivateChatModel(data).save()
        } catch (error) {
            throw error
        }
    }

    async fetchPrivateMessages(senderId: string, receiverId: string, classroomId: string): Promise<PrivateChatDocument[]> {
        try {
            return await PrivateChatModel.find(
                {
                    $or: [
                        { sender_id: senderId, receiver_id: receiverId, classroom_id: classroomId },
                        { sender_id: receiverId, receiver_id: senderId, classroom_id: classroomId }
                    ]
                }
            ).sort({ createdAt: 1 })
        } catch (error) {
            throw error
        }
    }

    async fetchClassroomMaterials(classroomId: string, studentId: string): Promise<ClassroomMaterialType[] | null> {
        try {


            const materials = await ClassroomModel.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(classroomId) } },
                { $project: { materials: 1 } },
                { $unwind: "$materials" },
                { $sort: { "materials.created_at": -1 } },
                { $group: { _id: "$_id", materials: { $push: "$materials" } } }
            ]);

            return materials[0]?.materials as ClassroomMaterialType[];
        } catch (error) {
            throw error
        }
    }

    async fetchAllClassroomWorks(clasroomId: string): Promise<WorksDocument[] | null> {
        try {
            return await WorksModel.find({
                classroom_id: clasroomId
            }).sort({ createdAt: -1 })
        } catch (error) {
            throw error
        }
    }

    async saveSubmittedWork(classroomId: string, workId: string, work: WorkSubmissionType): Promise<WorksDocument | null> {
        try {
            return await WorksModel.findOneAndUpdate(
                {
                    _id: workId,
                    'submissions.student_id': { $ne: work.student_id }
                },
                { $addToSet: { submissions: work } },
                { new: true }
            ).select('submissions')

        } catch (error) {
            throw error;
        }
    }

    async findWork(workId: string): Promise<WorksDocument | null> {
        try {
            return await WorksModel.findById(workId)
        } catch (error) {
            throw error
        }
    }


    async fetchAllExams(classroomId: string): Promise<ExamsDocument[]> {
        try {

            const exams = await ExamsModel.find({ classroom_id: classroomId })
                .sort({ createdAt: -1 });
            console.log(exams)
            return exams
        } catch (error) {
            throw error
        }
    }

    async fetchAnnouncements(classroomId: string): Promise<AnnouncementsDocument[] | null> {
        try {
            return await AnnouncementsModel.find({ classroom_id: classroomId })
                .sort({ createdAt: -1 })
        } catch (error) {
            throw error
        }
    }

    async saveNewExamCandidate(clasroomId: string, examId: string, studentId: string): Promise<void> {
        try {
            await ExamsModel.findOneAndUpdate(
                { classroom_id: clasroomId, _id: examId },
                { $addToSet: { started_students: studentId } }
            )
        } catch (error) {
            throw error
        }
    }

    async fetchExamDetails(clasroomId: string, examId: string): Promise<ExamsDocument | null> {
        try {
            return await ExamsModel.findOne({ _id: examId, classroom_id: clasroomId });
        } catch (error) {
            throw error
        }
    }

    async saveAnswers(clasroomId: string, examId: string, data: ExamAttendedType): Promise<any> {
        try {

            const exam = await ExamsModel.findOneAndUpdate(
                { _id: examId, classroom_id: clasroomId },
                { $addToSet: { attended: data } },
                { new: true }
            )
        } catch (error) {
            throw error
        }
    }

    async findSubmission(clasroomId: string, examId: string,studentId:string): Promise<any> {
        try {
            return await ExamsModel.findOne({ 
                _id: examId, 
                classroom_id: clasroomId,
                "attended.student_id":studentId
             });
        } catch (error) {
            throw error
        }
    }



}