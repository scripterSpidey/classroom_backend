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
        credentials:true
    }
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

io.on('connection',(socket)=>{

    const userId = socket.handshake.query.userId as string;
    const classroomId = socket.handshake.query.classroomId as string;

    if(userId && classroomId){
        socket.join(classroomId);

        if(!onlineUsers[classroomId]){
            onlineUsers[classroomId] = {}
        }

        onlineUsers[classroomId][userId] = socket.id
        userSocketMap[userId] = socket.id  
    }

    // const room = io.sockets.adapter.rooms; 
    
    socket.on('joinChatroom',userIds=>{
       
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