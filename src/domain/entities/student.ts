export class Student{
    constructor(
         readonly name: string,
         readonly email: string,
         readonly password: string,
         readonly id?: string,
         readonly is_blocked?: boolean,
         readonly classrooms?: [],
    ){}

    public static newStudent(name:string,email:string,password:string){
        return new Student(name,email,password)
    }

}