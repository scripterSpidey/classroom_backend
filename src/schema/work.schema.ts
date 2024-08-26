
import { TypeOf, z } from "zod";

export const createWorkSchema = z.object({
    body: z.object({
        topic: z.string({
            required_error: 'Topic for the  work is required!'
        }),
        description: z.string().optional(),
        submissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
            message: 'Invalid date format. Please use YYYY-MM-DD.'
        }),
        submissionTime: z.string().regex(/^\d{2}:\d{2}$/, {
            message: 'Invalid time format. Please use HH:mm.'
        }),
        maxMarks:z.string().regex(/^[0-9]*$/,{
            message:"Invalid mark"
        }),
        workType:z.enum(['assignment','homework'],{
            errorMap:()=>({message:'Invalid work type'})        
        })
    }),
    file: z.object({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.union([
            z.literal('image/jpeg'),
            z.literal('image/png'),
            z.literal('application/pdf'),
            z.literal('image/webp')
        ]),
        size: z.number(),
        destination: z.string().optional(),
        filename: z.string().optional(),
        path: z.string().optional(),
        buffer: z.instanceof(Buffer).optional(),
    }).nullable().refine(file => file != null, "Work file is required!"),
    
})


export const submitWorkSchema = z.object({
    file:z.object({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.union([
            z.literal('image/jpeg'),
            z.literal('image/png'),
            z.literal('application/pdf'),
            z.literal('image/webp')
        ]),
        size: z.number(),
        destination: z.string().optional(),
        filename: z.string().optional(),
        path: z.string().optional(),
        buffer: z.instanceof(Buffer).optional()
    }).nullable().refine(file => file != null, "Work submission file is required!"),
    query:z.object({
        workId:z.string({
            required_error:'Work id can not be empty'
        })
    })
})

export const updateWorkMarkSchema = z.object({
    body:z.object({
        studentId:z.string({
            required_error:'student id is required'
        }),
        mark:z.number({
            required_error:'Mark can not be empty'
        })
    }),
    params:z.object({
        workId:z.string({
            required_error:'work id is required'
        })
    })
})

export type CreateWorkBodyType = TypeOf<typeof createWorkSchema>['body']
export type CreateWorkFileType = TypeOf<typeof createWorkSchema>['file'];
export type SubmitWorkQueryType = TypeOf<typeof submitWorkSchema>['query'];
export type UpdateWorkMarkParamsType = TypeOf<typeof updateWorkMarkSchema>['params']
export type UpdateWorkMarkBodyType = TypeOf<typeof updateWorkMarkSchema>['body']