import { AxiosResponse } from "axios";
import { GoogleLoginInputType } from "../../schema/google.login.schema";



export type GoogleProfileResponseType = {
    id:string,
    email:string,
    verified_email:boolean,
    name:string,
    given_name:string,
    family_name: string,
    picture: string
}

export interface I_API{
    getUserProfileFromGoogle(password:GoogleLoginInputType):Promise<GoogleProfileResponseType>;
    
}
