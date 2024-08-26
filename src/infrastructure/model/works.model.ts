import mongoose, { Model, ObjectId } from "mongoose"

export enum WorkType {
    HOMEWORK = 'homework',
    ASSIGNMENT = 'assignment'
}

export enum WorkFileType {
    PDF = 'pdf',
    IMAGE = 'image'
}

export interface WorksDocument {
    _id?: mongoose.Types.ObjectId,
    classroom_id: mongoose.Types.ObjectId,
    topic: string,
    description?: string,
    work_type: WorkType,
    work_file_url: string,
    work_file_type: WorkFileType,
    deadline: Date,
    max_marks: number,
    submissions: Array<{
        student_id: mongoose.Types.ObjectId,
        student_name: string,
        submission_time: Date,
        submitted_file_url: string,
        submitted_file_type: WorkFileType,
        marks: number,
        valuated?:boolean
    }>,

}

export type WorkSubmissionType = WorksDocument['submissions'][number]

const worksSchema: mongoose.Schema = new mongoose.Schema<WorksDocument>({

    classroom_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
        ref: 'classrooms'
    },
    topic: { type: String, required: true },
    description: { type: String, default: '' },
    work_type: { type: String, enum: Object.values(WorkType) },
    work_file_url: { type: String, required: true },
    work_file_type: { type: String, enum: Object.values(WorkFileType), required: true },
    deadline: { type: Date, required: true },
    max_marks: { type: Number, required: true },
    submissions: [{
        student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'students', required: true },
        student_name: { type: String, required: true },
        submission_time: { type: Date, required: true },
        submitted_file_url: { type: String, required: true },
        submitted_file_type: { type: Object.values(WorkFileType), required: true },
        marks: { type: Number, required: true },
        valuated:{type:Boolean,default:false}
    }]
}, { timestamps: true })

export const WorksModel: Model<WorksDocument> =
    mongoose.model<WorksDocument>('works', worksSchema)