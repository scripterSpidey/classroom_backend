import { Request,Response,NextFunction } from "express";
import { I_AdminInteractor } from "../../interface/admin_interface/I_adminInteractor";

export class AdminContoller{
    private interactor: I_AdminInteractor;
    constructor(interactor: I_AdminInteractor){
        this.interactor = interactor;
    }

    async onLogin(req:Request,res:Response,next:NextFunction){
        try {
            const body = req.body;
            const data = await this.interactor.login(body);
            if(!data){
                return res.status(401).json({
                    authenticated: false,
                    message:"Invalid credentials",
                    data:null
                });
            }
            
            return res.status(200).json({
                authenticated:true,
                message:"Admin logged in successfully",
                data:{
                    id:data.id,
                    email:data.email,
                    name:data.name
                }
            });
        } catch (error) {
            
        }
    }
}