import { Admin } from "../../domain/entities/admin";

export interface I_AdminInteractor{
    login(data:Admin):Promise<Admin | null>;
    logout():Promise<Boolean>;
}