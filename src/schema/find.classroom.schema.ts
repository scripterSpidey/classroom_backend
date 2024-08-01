import { z, number, object, string, TypeOf } from "zod";
import mongoose from "mongoose";

const classroomID = z.string({
    required_error: "Classroom ID is required"
}).regex(/^CLRM-[A-Za-z0-9]{6}$/, {
    message: "Invalid classroom code format. It should be 'CLSRM-' followed by 6 alphanumeric characters."
});
export const findClassroomSchema = object({
    params: object({
        classroom_id: classroomID
    })
})

export type FindClasroomInputType = TypeOf<typeof findClassroomSchema>['params']