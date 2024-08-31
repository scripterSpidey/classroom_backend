

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