

import mongoose, { Aggregate } from "mongoose";
import { I_TeacherClassroomRepo } from "../../interface/classroom_interface/I_teacher.classroom.repo";
import { ClassroomDocument, ClassroomMaterialType, ClassroomMessage, ClassroomModel } from "../model/classroom.model";
import { StudentClassroomDocType, StudentDocument, StudentModel } from "../model/student.model";
import { TeacherClassroomDocType, TeacherModel } from "../model/teacher.model";
import { ObjectId } from 'mongodb';
import { CostumeError } from "../../utils/costume.error";
import { PrivateChatDocument, PrivateChatModel } from "../model/private.chat.model";
import { WorksDocument, WorksModel } from "../model/works.model";
import { ExamsDocument, ExamsModel } from "../model/exam.model";

export class TeacherClassroomRepo implements I_TeacherClassroomRepo {


    async createClassroom(data: any, class_teacher_id: string): Promise<ClassroomDocument> {
        try {

            const newClassroom = await new ClassroomModel(data).save();

            return newClassroom;
        } catch (error) {
            throw error
        }
    }



    async getClassroomsforteacher(class_teacher_id: string): Promise<ClassroomDocument[] | []> {
        try {
            const classrooms = await ClassroomModel.find({ class_teacher_id })
            return classrooms
        } catch (error) {
            throw error
        }
    }

    async getTeacherClassroomDetail(classroom_id: string, class_teacher_id: string): Promise<ClassroomDocument | null> {
        try {

            const classroom = await ClassroomModel.findOne({
                _id: classroom_id,
                class_teacher_id
            }).populate({
                path: 'joining_requests',
                select: "-password"
            })

            const detailedClassroom = await ClassroomModel.aggregate([
                { $match: { _id: new ObjectId(classroom_id) } },
                {
                    $lookup: {
                        from: "students",
                        localField: "students.student_id",
                        foreignField: "_id",
                        as: "students"
                    }
                },
                { $unwind: "$students" },
                {
                    $group: {
                        _id: "$_id",
                        students: { $push: "$students" }
                    }
                },
                { $project: { students: 1 } }

            ]);


            return classroom;
        } catch (error) {
            throw error
        }
    }

    async acceptRequest(classroom_id: string, teacher_id: string, student_id: string, data: any, classrooomData: StudentClassroomDocType): Promise<ClassroomDocument | null> {
        try {

            const classrooms = await ClassroomModel.findByIdAndUpdate(
                { _id: classroom_id, class_teacher_id: teacher_id },
                {
                    $addToSet: { students: data },
                    $pull: { joining_requests: student_id }
                },
                { new: true }
            )

            await StudentModel.findByIdAndUpdate(
                student_id,
                { $addToSet: { classrooms: classrooomData } }
            )
            return classrooms;

        } catch (error) {
            throw error
        }
    }

    async rejectRequest(classroom_id: string, teacher_id: string, student_id: string): Promise<ClassroomDocument | null> {
        try {
            return await ClassroomModel.findByIdAndUpdate(
                { _id: classroom_id, class_teacher_id: teacher_id },
                {
                    $pull: { joining_requests: student_id }
                },
                { new: true }
            ).populate({
                path: 'students',
                select: '-password'
            }).exec();
        } catch (error) {
            throw error
        }
    }

    async fetchStudentProfile(student_id: any): Promise<StudentDocument | null> {
        try {
            return await StudentModel.findById(student_id).select('-password')
        } catch (error) {
            throw error
        }
    }

    async deleteStudentFromClassroom(student_id: string, classroom_id: string): Promise<void> {
        try {
            await ClassroomModel.findByIdAndUpdate(
                classroom_id,
                { $pull: { students: { student_id: student_id } } },
                { new: true }
            )

            await StudentModel.findByIdAndUpdate(
                student_id,
                { $pull: { classrooms: classroom_id } }
            )

        } catch (error) {
            throw error
        }
    }

    async toggleStudentAccess(student_id: string, classroom_id: string, teacher_id: string): Promise<void> {
        try {

            const currentState = await ClassroomModel.aggregate([
                //what the heck is this?
                { $unwind: "$students" },
                { $match: { "students.student_id": new ObjectId(student_id) } },
                { $project: { "students": 1 } }
            ]);

            const value = !currentState[0].students.blocked

            await ClassroomModel.findOneAndUpdate(
                {
                    _id: classroom_id,
                    class_teacher_id: teacher_id,
                    'students.student_id': student_id
                },
                {
                    $set:
                    {
                        'students.$.blocked': value
                    }
                }
            )



            await StudentModel.findOneAndUpdate(
                {
                    _id: student_id,
                    "classrooms.classroom_id": classroom_id
                },
                {
                    $set: {
                        'classrooms.$.blocked': value
                    }
                }
            )

            return
        } catch (error) {
            throw error
        }
    }

    async fetchClassTeacherInfo(classroom_id: string) {

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

    async saveClassroomMaterial(clasroomId: string, data: ClassroomMaterialType): Promise<ClassroomMaterialType | null> {
        try {
            const materials = await ClassroomModel.findByIdAndUpdate(
                clasroomId,
                { $addToSet: { materials: data } },
                { new: true, projection: { materials: { $slice: -1 } } }
            );
            if (!materials) return null;

            return materials?.materials[0]
        } catch (error) {
            throw error;
        }
    }

    async fetchClassroomMaterials(classroomId: string, classTeacherId: string): Promise<ClassroomMaterialType[] | null> {
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

    async deleteClassroomMaterial(classroomId: string, materialId: string): Promise<void> {
        try {

        } catch (error) {
            throw error
        }
    }

    async saveNewWork(data: WorksDocument): Promise<WorksDocument> {
        try {
            return await new WorksModel(data).save();
        } catch (error) {
            throw error;
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

    async editWorkMark(workId: string, studentId: string, mark: number): Promise<WorksDocument | null> {
        try {
            const markUpdated = await WorksModel.findOneAndUpdate(
                {
                    _id: workId,
                    "submissions.student_id": studentId
                },
                {
                    $set: {
                        "submissions.$.marks": mark,
                        "submissions.$.valuated": true
                    }
                },
                { new: true }
            );

            return markUpdated
        } catch (error) {
            throw error
        }
    }

    async saveNewExam(exam:ExamsDocument): Promise<ExamsDocument> {
        try {
            const newExam = await new ExamsModel(exam).save();
            return newExam
        } catch (error) {
            throw error
        }
    }

    async fetchAllExams(classroomId: string): Promise<ExamsDocument[]> {
        try {
            
            const exams = await  ExamsModel.find({classroom_id:classroomId});
           
            return exams
        } catch (error) {
            throw error
        }
    }
}