
import { JWToutput } from "../application/service/jwt";
import { SessionDocument } from "../infrastructure/model/session.model";

export interface I_AuthMiddlewareInteractor{
    decryptToken(accessToken:string):JWToutput;
    newAccessToken(data:string):Promise<String>;
    validateSession(data:string):Promise<false|SessionDocument>;
}