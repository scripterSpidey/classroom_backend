export class Teacher {
    constructor(
        readonly name: string,
        readonly subject: string,
        readonly class_teacher_name: string,
        readonly class_teacher_id:string,
        readonly students:[string],
        readonly strength:number,
        readonly joining_requests:[string],
        readonly banned:boolean,
        readonly classroom_id:string,
        readonly id?:string
    ) { }

    public static newClassroom(
        name: string,
        subject: string,
        class_teacher_name: string,
        class_teacher_id:string,
        students:[string],
        strength:number,
        joining_requests:[string],
        banned:boolean,
        classroom_id:string
        ) {
            
        return new Teacher(name,subject,class_teacher_name,class_teacher_id,students,strength,joining_requests,banned,classroom_id)
    }

}