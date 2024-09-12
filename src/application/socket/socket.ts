import { Server } from "socket.io";
import http from 'http';

import express from 'express';
import { API_ORIGIN } from "../../infrastructure/constants/env";
import crypto from 'crypto'
const app = express();

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: API_ORIGIN,
        credentials:true,
        methods: ['GET', 'POST'],
    },
    path: "/classconnect/socket.io"
});

export const getReceiverSocketId = (receiverId:string)=>{
    return userSocketMap[receiverId]
}

type OnlineUsersType={
   [classroomId:string]:{
    [userId:string]:string
   }
}

const onlineUsers:OnlineUsersType = {}
const userSocketMap: { [userId: string]: string } = {}
const classroomState = new Map()
io.on('connection',(socket)=>{
    
    const userId = socket.handshake.query.userId as string;
    const classroomId = socket.handshake.query.classroomId as string;
    console.log(`A new user: ${userId} joined in classroom: ${classroomId}`);

    socket.emit('classroomState',classroomState.get(classroomId))
    if(userId && classroomId){
        socket.join(classroomId);

        if(!onlineUsers[classroomId]){
            onlineUsers[classroomId] = {}
        }

        onlineUsers[classroomId][userId] = socket.id
        userSocketMap[userId] = socket.id  
    }
    //listener for starting of live class
    socket.on('liveClassStarted',(classroomId)=>{
        console.log(`${classroomId} started  live class`)
        if(!classroomState.get(classroomId)){
            classroomState.set(classroomId,{})
        }
        classroomState.get(classroomId)['live'] = true;
        console.log('current state of classroom: ',classroomState);
        io.to(classroomId).emit('liveClassStarted',classroomState.get(classroomId))
    });

    //listener for ending live class
    socket.on('liveClassEnded',(classroomId)=>{
        if(!classroomState.get(classroomId)) return;
        classroomState.get(classroomId)['live']=false;
        console.log('live class ended: ',classroomId) 
        io.to(classroomId).emit('liveClassEnded',classroomState.get(classroomId))
    })

    
    
    //one to one classroom private chat register
    socket.on('joinChatroom',userIds=>{
        console.log('user connected to chatroom',userIds)
        const id = userIds.sort().join('-');
        const chatroomId = crypto.createHash('sha256').update(id).digest('hex').substring(0,16);
        socket.join(chatroomId)
       
    }) 

    io.to(classroomId).emit("onlineUsers",Object.keys(onlineUsers[classroomId]));
    
    socket.on('disconnect',()=>{   
   
        delete onlineUsers[classroomId][userId];
        
        io.to(classroomId).emit('onlineUsers',Object.keys(onlineUsers[classroomId]));
       
    })
})


export { app, io, server }  