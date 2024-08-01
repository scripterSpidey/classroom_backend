import e from "express";
import { I_ClassroomRepo } from "../../interface/classroom_interface/I_classroom.repo";
import { ClassroomDocument, ClassroomModel } from "../model/classroom.model";
import { StudentDocument, StudentModel } from "../model/student.model";
import { TeacherModel } from "../model/teacher.model";

export class ClassroomRepo implements I_ClassroomRepo {



    async createClassroom(data: any,class_teacher_id:string): Promise<ClassroomDocument> {
        try {
            
            const newClassroom =  await new ClassroomModel(data).save();
            await TeacherModel.updateOne(
                {_id:class_teacher_id},
                {$addToSet:{classrooms:newClassroom._id}}
            )
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

    async fetchAllClassroomsOfStudent(student_id: string): Promise<StudentDocument | null> {
        try {
            return await StudentModel.findById(student_id).populate('classrooms')
        } catch (error) {
            throw error;
        }
    }

    async getTeacherClassroomDetail(classroom_id: string, class_teacher_id: string): Promise<ClassroomDocument | null> {
        try {
            return await ClassroomModel.findOne({
                _id: classroom_id,
                class_teacher_id
            })
                .populate({
                    path: 'students',
                    select: '-password'
                })
                .populate({
                    path: 'joining_requests',
                    select: '-password'
                });
        } catch (error) {
            throw error
        }
    }
    async fetchClassroom(classroom_id: string, student_id: string): Promise<ClassroomDocument | null> {
        try {
            return await ClassroomModel.findOne({
                classroom_id,
                students: { $nin: student_id },
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

    async acceptRequest(classroom_id: string, teacher_id: string, student_id: string): Promise<ClassroomDocument | null> {
        try {
            const classrooms =  await ClassroomModel.findByIdAndUpdate(
                { _id: classroom_id, class_teacher_id: teacher_id },
                {
                    $addToSet: { students: student_id },
                    $pull: { joining_requests: student_id }
                },
                { new: true }
            ).populate({
                path: 'students',
                select: '-password'
            }).populate({
                path: 'joining_requests',
                select: '-password'
            }).exec();
 
            await StudentModel.findByIdAndUpdate(
                student_id,
                {$addToSet:{classrooms:classroom_id}}
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

    async fetchClassroomDetailsForStudent(classroom_id: string): Promise<ClassroomDocument|null> {
        try {
            console.log('id: ',classroom_id)
            return await ClassroomModel.findById(classroom_id).populate('students')
        } catch (error) {
            throw error
        }
    }
}