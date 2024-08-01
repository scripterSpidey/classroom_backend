import {  number, object,string, TypeOf } from "zod";
export const createClassroomSchema = object({
    body:object({
        name:string({
            required_error:"Class room name should be given."
        }),
        subject:string({
            required_error:"Subject should be specified"
        }),
        purpose:string({
            required_error:"purpose needs to be mentioned"
        }),
        class_teacher_id:string({
            required_error:"Class teacher id should be mentioned"
        }),
        class_teacher_name:string({
            required_error:"Class teacher name should be specified"
        })
    })
})

export type CreateClassroomInputType = TypeOf<typeof createClassroomSchema>['body']