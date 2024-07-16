export class Teacher{
    constructor(
        readonly name:string,
        readonly email:string,
        readonly password:string,
        readonly id?: string,
        readonly is_blocked?: boolean,
        readonly classrooms?: [],
    ){}

    public static newTeacher(name:string,email:string,password:string){
        return new Teacher(name,email,password)
    }

}