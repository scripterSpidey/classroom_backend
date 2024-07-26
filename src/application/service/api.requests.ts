import axios, { AxiosResponse } from "axios";
import { I_API } from "../../interface/service_interface/I_API.requests";
import { GoogleProfileResponseType } from "../../interface/service_interface/I_API.requests";
import { GoogleLoginInputType } from "../../schema/google.login.schema";



export class API implements I_API  {

    constructor(){};

    async getUserProfileFromGoogle(googleResponse:GoogleLoginInputType):Promise<GoogleProfileResponseType>{
        try {
            const response = await axios.get(
                `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${googleResponse.access_token}`,
                {
                  headers: {
                    Authorization: `Bearer ${googleResponse.access_token}`,
                    Accept: 'application/json'
                  }
                }
              );
              return response.data
        } catch (error) {
            throw error
        }
    }
    
}
