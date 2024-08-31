export interface I_Mailer {
    sendEmail( recipient: string,type:string, message:string,):Promise<any>;

    sendResetPasswordMail(recipient:string,link:string):Promise<void>;
}