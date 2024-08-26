import { Request,Response,NextFunction } from "express";
import { AnyZodObject } from "zod";

const validate = (schema: AnyZodObject)=>(req:Request,res:Response,next:NextFunction)=>{
    try {
    
        schema.parse({
            body:req.body,
            query:req.query,
            params:req.params,
            file:req.file || null
        })
       
        next()
    } catch (error: any) {
        console.error('bad request',error.errors)
        return res.status(400).json(error.errors[0].message)
    }
}

export default validate