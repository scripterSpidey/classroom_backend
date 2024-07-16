import { I_TeacherInteractor } from "../../interface/teacher_interface/I_teacher.interactor";


export class TeacherController{
    private interactor: I_TeacherInteractor;

    constructor(
        interactor:I_TeacherInteractor
    ){
        this.interactor = interactor;
    }


}