import { Admin } from "../../domain/entities/admin";
import { I_AdminInteractor } from "../../interface/admin_interface/I_adminInteractor";
import { I_AdminRepo } from "../../interface/admin_interface/I_adminRepo";

export class AdminInteractor implements I_AdminInteractor{
    private repository: I_AdminRepo;
    constructor(repository: I_AdminRepo){
        this.repository = repository;
    }
    login(data: Admin): Promise<Admin | null> {
        return this.repository.findAdmin(data)
    }
    logout(): Promise<Boolean> {
        throw new Error("Method not implemented.");
    }
    
}