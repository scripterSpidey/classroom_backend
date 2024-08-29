import mongoose, { Model, mongo } from "mongoose";

export enum QuestionTypeEnum {
    MCQ = 'mcq',
    TOF = 'trueOrFalse',
    DESCRIPTIVE = 'descriptive',
    FILL_BLANKS = 'fillBlanks',
}


export enum QuestionPaperEnum {
    ADD = 'addQuestion',
    UPLOAD = 'uploadQuestion',
    BANK = 'chooseQuestion'
}

export enum ExamResultEnum {
    PASS = 'pass',
    FAIL = 'fail',
    ABSENT = 'absent',
}

export interface ExamsDocument {
    _id?: mongoose.Types.ObjectId,
    classroom_id: mongoose.Types.ObjectId,
    title: string,
    instructions: string,
    issued_at: Date,
    total_marks: number,
    total_questions: number,
    start_time: Date,
    last_time_to_start: Date,
    duration: number,
    question_paper_type: QuestionPaperEnum,
    attended: Array<{
        student_id: mongoose.Types.ObjectId,
        student_name: string,
        obtained_mark: number,
        correct_answers: number,
        wrong_answers: number,
        result: ExamResultEnum,
    }>,
    questions: Array<{
        question: string,
        type: QuestionTypeEnum,
        mark: number,
        options: string[],
        answer?: string
    }>
}

export type ExamQuestionType = ExamsDocument['questions'][number];
export type ExamAttendedType = ExamsDocument['attended'][number];

const examsSchema: mongoose.Schema = new mongoose.Schema<ExamsDocument>({
    classroom_id:{type:mongoose.Schema.Types.ObjectId, required:true,index:true,ref:'classrooms'},
    title: { type: String, required: true },
    instructions:{ type: String, default: '' },
    issued_at:{type:Date,default: new Date()},
    total_marks:{ type: Number, required: true },
    total_questions:{ type: Number, required: true },
    start_time:{type:Date,required:true},
    last_time_to_start:{type:Date,required:true},
    duration:{ type: Number, required: true},
    question_paper_type:{type:String,enum:Object.values(QuestionPaperEnum)},
    attended:[{
        student_id: {type:mongoose.Schema.Types.ObjectId,ref:'students',required:true},
        student_name: { type: String, required: true },
        obtained_mark: { type: Number, required: true },
        correct_answers: { type: Number, required: true },
        wrong_answers: { type: Number, required: true },
        result: {type:String,enum:Object.values(ExamResultEnum)},
    }],
    questions:[{
        question: { type: String, required: true },
        type: {type:String,enum:Object.values(QuestionTypeEnum)},
        mark:  { type: Number, required: true },
        options: [String],
        answer:  { type: String, default: '' }
    }]
})

export const ExamsModel: Model<ExamsDocument>=
    mongoose.model<ExamsDocument>('exams',examsSchema)