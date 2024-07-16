import { ErrorRequestHandler } from "express";



const errorHandler: ErrorRequestHandler = (error,req,res,next)=>{
    console.log(`PATH:${req.path} encountered an ${error}`);
    
    return res.status(500).send(`Internal server error ${error}`);
}

export default errorHandler;