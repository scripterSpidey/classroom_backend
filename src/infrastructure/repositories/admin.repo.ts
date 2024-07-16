import { Admin } from "../../domain/entities/admin";
import { I_AdminRepo } from "../../interface/admin_interface/I_adminRepo";
import { AdminModel } from "../model/admin.model";

export class AdminRepo implements I_AdminRepo{

    async findAdmin(data: Admin): Promise<Admin | null> {

        const adminDoc = await AdminModel.findOne(
            {email:data.email,password:data.password},
            {password:0}
        )

        if(!adminDoc) return null;

        const admin:Admin ={
            id:adminDoc?._id as string,
            name:adminDoc?.name as string,
            email:adminDoc?.email as string,
            password:''
        }
        
        return admin
    }

    logout(): Promise<Boolean> {
        throw new Error("Method not implemented.");
    }
    
}