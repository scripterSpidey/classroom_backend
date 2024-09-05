import { string, TypeOf, z } from "zod";

const questionSchema = z.object({
    question: z.string({
        required_error: 'Question is text is required'
    }),
    type: z.enum(['mcq', 'descriptive', 'trueOrFalse', 'fillBlanks']),
    mark: z.string().or(z.number()).refine((val) => !isNaN(Number(val)), {
        message: "Mark must be a valid number",
    }),
    options:z.array(z.string()).optional(),
    answer:z.string().optional()
})

export const createExamSchema = z.object({
    body: z.object({
        title: z.string({
            required_error: 'Title for the exam is needed'
        }),
        instructions: z.string().optional(),
        duration: z.number({
            required_error: 'Duration for the exam is compulsary'
        }),
        startTime: z.string({
            required_error: 'Exam needs a start time'
        }),
        lastTimeToStart: z.string({
            required_error: 'Last time to start exam should be specified'
        }),
        questions:z.array(questionSchema).nonempty('Atleast one question is required for the exam'),
        questionPaperType:z.enum(['addQuestion','uploadQuestion','chooseQuestion'])
    })
})


export const submitExamSchema = z.object({
    body:z.object({
        examId:z.string({
            required_error:"Exam id is required"
        }),
        answers:z.array(z.string({
            required_error:'Each answer must be a string'
        })),
        startedAt:z.string({
            required_error:'Staring time is required'
        }),
        endedAt:z.string({
            required_error:"Ending time is required"
        })

    })
})

export const publishExamSchema = z.object({
    body:z.object({
        studentId:z.string({
            required_error:'Student id is required',
            
        }),
        totalMark:z.number({
            required_error:'Total mark is required'
        }),
        response:z.array(z.boolean()).optional(),
        marks:z.array(z.number()).optional(),
        status:z.string({
            required_error:"Status is required"
        })
    })
})

export type CreateExamQuestionType = TypeOf<typeof questionSchema>
export type CreateExamType = TypeOf<typeof createExamSchema>['body'];
export type SubmitExamType = TypeOf<typeof submitExamSchema>['body'];
export type PublishExamBodyType = TypeOf<typeof publishExamSchema>['body']