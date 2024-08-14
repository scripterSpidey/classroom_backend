declare namespace Express {
    export interface Request {
        user: {
            userId:string,
            sessionId:string
        };
        classroom:{
            classroom_id:string,
            class_teacher_id:string,
            student_id:string
        }
    }
    export interface Response {
        user: any;
    }
  }