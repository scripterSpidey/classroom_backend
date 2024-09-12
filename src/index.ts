import express from "express";
import dotenv from 'dotenv';
dotenv.config()
import { connectToDB } from "./infrastructure/config/mongoDB";
import http, { IncomingMessage, Server, ServerResponse } from 'http'
import { PORT } from "./infrastructure/constants/env";
import { API_ORIGIN } from "./infrastructure/constants/env";
import cors from "cors"
import morgan from 'morgan';
import cookieParser from "cookie-parser";
import errorHandler from "./presentation/middleware/error.handler";

import adminRouter from "./presentation/routes/admin.routes";
import studentRouter from "./presentation/routes/student.routes";
import teacherRouter from "./presentation/routes/teacher.routes";
import { app,server } from "./application/socket/socket";

const startServer = async(): Promise<void>=>{
    

    await connectToDB();
    app.use(morgan('dev'))

    app.use(express.json());
    app.use(express.urlencoded({extended:true}));
    app.use(
        cors({
            origin: API_ORIGIN,
            credentials:true
        })
    )
    app.use(cookieParser());

    //test req checker...........
    app.use((req,res,next,)=>{
        // console.log('headers: ',req.headers)
        console.log('request: ',req.body);
        next()
    });

    app.use('/admin',adminRouter);
    app.use('/teacher',teacherRouter);
    app.use('/student',studentRouter);
    
    app.use(errorHandler)
    server.listen(PORT,()=>{
        console.log(`server active on port:${PORT}`)
    }) 

    

}  

 startServer();   

