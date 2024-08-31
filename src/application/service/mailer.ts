import { I_Mailer } from "../../interface/service_interface/I_mailer";
import nodemailer from "nodemailer"
import { EMAIL_PASSKEY } from "../../infrastructure/constants/env";
import { EMAIL } from "../../infrastructure/constants/env";
import { formatMessage, resetPasswordLinkMail } from "../../utils/OTPmailContent";

export class EmailService implements I_Mailer{

    constructor(){}
    async sendResetPasswordMail(recipient: string, link: string): Promise<void> {
        try {
            let transporter = nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:EMAIL,
                    pass:EMAIL_PASSKEY
                }
            });

            let mailOptions ={
                from:"Class connect",
                to: recipient,
                subject: "Reset your password",
                html:resetPasswordLinkMail(link)
            };
            await transporter.sendMail(mailOptions);
            return
        } catch (error) {
            throw error
        }
    }

    async sendEmail(recipient: string,type:string,message:string): Promise<any> {
        let transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:EMAIL,
                pass:EMAIL_PASSKEY
            }
        });

        let mailOptions ={
            from:"Valar jorrāelis",
            to: recipient,
            subject: "Registration OTP",
            html:formatMessage(message)
        };

        try {
            let info = await transporter.sendMail(mailOptions);
            return info
        } catch (error) {
            throw error
        }
    }

}