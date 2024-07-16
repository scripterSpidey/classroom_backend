import { I_Bcrypt } from "../../interface/service_interface/I_bcrypt";
import bcrypt from 'bcryptjs';

export class HashPassword implements I_Bcrypt{

    constructor(){};

    async encryptPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt);
        return hashedPassword;
    }

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password,hashedPassword)
    }
    
}

