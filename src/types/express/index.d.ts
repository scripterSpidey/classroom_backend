
export {}
declare global{
    namespace Express{
        export interface Request{
            user: {
                userId:string,
                sessionId:string,
                role?:string
            };
            classroom:{
                classroom_id:string,
                class_teacher_id:string,
                student_id:string
            }
        }
    }
}