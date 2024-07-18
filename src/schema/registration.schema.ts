import { object,string, TypeOf } from "zod";

export const registrationSchema = object({
    body: object({
        email:string({
            required_error:"Email is required"
        }).email('Not a valid email address'),
        name:string({
            required_error:"Name is required"
        }),
        password: string({
            required_error:"Password is required"
        }).min(6,"Password must be 6 chars minimum"),
        confirmPassword:string({
            required_error:"Password confirmation is needed"
        })
    }).refine((data)=>data.password == data.confirmPassword,{
        message:"Password doesnot match",
        path:["confirmPassword"]
    })
});

export type CreateUserInput = TypeOf<typeof registrationSchema>