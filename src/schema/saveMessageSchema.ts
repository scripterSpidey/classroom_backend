import { TypeOf, z } from "zod";


export const saveMessageSchema = z.object({
    body:z.object({
        message:z.string({
            required_error:"Message can not empty!"
        })
    })
})

export type saveMessageInput = TypeOf<typeof saveMessageSchema>['body']