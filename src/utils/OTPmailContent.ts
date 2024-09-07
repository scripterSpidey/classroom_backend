

export const formatMessage  = (message:string):string =>{
    return `
    <h1 style="color: blue; text-align: center;">Welcome</h1>
    <p style="font-size: 16px; color: #333; text-align: center;">Please enter the OTP provided to register on our website.</p>
    <h2 style=" color: #333; text-align: center;">${message}</h2>
`
}

export const resetPasswordLinkMail = (link:string):string=>{
    return`You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
           Please click on the following link, or paste this into your browser to complete the process:\n\n
           ${link} \n\n
           If you did not request this, please ignore this email and your password will remain unchanged.`
}

export const blockReasonMail = (content:string)=>{
    return `
        <h1 style="color: red; text-align: center;">YOU HAVE BEEN BLOCKED</h1>
        <p>${content}</p>
    `
}

export const banRemovedMail = (content:string)=>{
    return `
        <h1 style="color: green; text-align: center;">YOUR BAN HAS BEEN  REMOVED</h1>
        <p>${content}</p>
    `
}

export const banClassroomMail = (content:string,classroomName:string,classroomId:string)=>{
    return `
        <h1 style="color: red; text-align: center;">YOUR CLASSROOM HAS BEEN  BANNED</h1>
        <h2 style =" color:'red'; ">Your classroom ${classroomName} with id ${classroomId} has been banned.</h2>
        <p>${content}</p>
    `
}

export const unbanClassroomMail = (content:string,classroomName:string,classroomId:string)=>{
    return `
        <h1 style="color: green; text-align: center;">YOUR CLASSROOM HAS BEEN  BANNED</h1>
        <h2 style =" color:'green'; "> The ban of Your classroom ${classroomName} with id ${classroomId} has been removed.</h2>
        <p>${content}</p>
    `
}