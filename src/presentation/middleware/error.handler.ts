import { ErrorRequestHandler } from "express";
import { CostumeError } from "../../utils/costume.error";


const errorHandler: ErrorRequestHandler = (error,req,res,next)=>{

    const statusCode = error instanceof CostumeError ? error.statusCode : 500;
    const message = error instanceof CostumeError ? error.message : "Internal server error"
    console.log(error)
    return res.status(statusCode).send(`${message}`);
}

export default errorHandler;