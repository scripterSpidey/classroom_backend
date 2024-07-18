import { object,string, TypeOf } from "zod";


export const loginSchema = object({
    body: object({
        email:string({
            required_error:"email is required"
        }).email('Not a valid email address'),
        password:string({
            required_error:"password is required"
        })
    })
});

export type LoginSchemaInput = TypeOf<typeof loginSchema>