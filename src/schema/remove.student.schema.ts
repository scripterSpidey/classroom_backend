import { TypeOf, z } from "zod";
import { ObjectId } from "mongodb";

export const studentIdParamsSchema = z.object({
    params: z.object({
        student_id: z.string().refine(
            (val) => ObjectId.isValid(val),
            {
                message: "Invalid ObjectId format"
            }
        )
    })

}); 


export const studentIdBodySchema = z.object({
    body: z.object({
        student_id: z.string().refine(
            (val) => ObjectId.isValid(val),
            {
                message: "Invalid ObjectId format"
            }
        )
    })

}); 

export type studentIdParamType = TypeOf<typeof studentIdParamsSchema>['params']

export type studentIdBodyType = TypeOf<typeof studentIdBodySchema>['body']