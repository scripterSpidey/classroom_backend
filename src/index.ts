import express from "express";
import dotenv from 'dotenv';
dotenv.config()
import { connectToDB } from "./infrastructure/config/mongoDB";

import { PORT } from "./infrastructure/constants/env";
import { API_ORIGIN } from "./infrastructure/constants/env";
import cors from "cors"
import cookieParser from "cookie-parser";
import errorHandler from "./presentation/middleware/errorHandler";

import adminRouter from "./routes/admin.routes";
import studentRouter from "./routes/student.routes";
import teacherRouter from "./routes/teacher.routes"

const startServer = async(): Promise<void>=>{
    
    await connectToDB();

    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({extended:true}));
    app.use(
        cors({
            origin: API_ORIGIN,
            credentials:true
        })
    )
    app.use(cookieParser())
    // app.get('/', catchErrors(async (req,res,next)=>{
    //     try {
    //         throw new Error('test error')
    //     } catch (error) {
    //         next(error)
    //     }
    // }))
    app.use('/admin',adminRouter);
    app.use('/teacher',teacherRouter);
    app.use('/student',studentRouter);
    
    app.use(errorHandler)
    app.listen(PORT,()=>{
        console.log(`server active on port:${PORT}`)
    }) 

}  

startServer();   