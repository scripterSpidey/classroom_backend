import { object,string, TypeOf } from "zod";


export const logoutSchema = object({
    body: object({
        userId:string({
            required_error:"user info is required"
        })
    })
});

export type LogoutSchemaInput = TypeOf<typeof logoutSchema>