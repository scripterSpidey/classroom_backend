export class Student{
    constructor(
         readonly name: string,
         readonly email: string,
         readonly password: string|null,
         readonly blocked: boolean,
         readonly verified:boolean,
         readonly classrooms: [],
         readonly profile_image?: string | undefined | null,
         readonly id?: string,
    ){}

    public static newStudent(
        name:string,
        email:string,
        password:string|null,
        blocked:boolean,
        verified:boolean,
        classrooms:[],
        profile_image:string|undefined|null){
        return new Student(name,email,password,blocked,verified,classrooms,profile_image)
    }

}