import { Admin } from "../../domain/entities/admin";

export interface I_AdminRepo{
    findAdmin(data:Admin):Promise<Admin | null>;
    logout():Promise<Boolean>;
}