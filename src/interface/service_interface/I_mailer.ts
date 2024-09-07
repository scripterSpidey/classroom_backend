export interface I_Mailer {
    sendEmail( recipient: string,type:string, message:string,):Promise<any>;

    sendResetPasswordMail(recipient:string,link:string):Promise<void>;

    sendReasonForBlock(recipient: string, content: string): Promise<void>;

    sendBandRemovedMail(recipient: string, content: string): Promise<void>;

    sendBanClassroomMail(recipient: string, content: string,classroomId:string,classroomName:string): Promise<void>;

    sendRemoveBanClassroomMail(recipient: string, content: string,classroomId:string,classroomName:string): Promise<void>
}