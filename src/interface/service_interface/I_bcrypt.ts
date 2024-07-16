export interface I_Bcrypt{
    encryptPassword(password:string):Promise<string>;
    comparePassword(password:string,hashedPassword:string):Promise<boolean>;
}
