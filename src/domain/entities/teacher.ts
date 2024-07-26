export class Teacher{
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

    public static newTeacher(
        name:string,
        email:string,
        password:string|null,
        blocked:boolean,
        verified:boolean,
        classrooms:[],
        profile_image:string|undefined|null){
        return new Teacher(name,email,password,blocked,verified,classrooms,profile_image)
    }

}