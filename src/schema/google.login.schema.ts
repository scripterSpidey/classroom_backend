import {  number, object,string, TypeOf } from "zod";


export const googelLoginSchema = object({
    body: object({
        access_token:string({
            required_error:"invalid google auth response"
        }),
        token_type:string({
            required_error:"invalid google auth response"
        }),
        expires_in:number({
            required_error:'invalid google auth response'
        })
    })
});

export type GoogleLoginInputType = TypeOf<typeof googelLoginSchema>['body']