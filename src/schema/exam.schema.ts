import { TypeOf, z } from "zod";

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

export type CreateExamQuestionType = TypeOf<typeof questionSchema>
export type CreateExamType = TypeOf<typeof createExamSchema>['body']