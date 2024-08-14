
import { TypeOf, z } from "zod";


export const sendPrivateMessage = z.object({
    body:z.object({
        message:z.string({
            required_error:"message can not be empty"
        }),
        receiverName:z.string({
            required_error:'Reciever name is not mentioned'
        })
    }),
    params:z.object({
        receiverId:z.string({
            required_error:'Receiver id is not provided'
        })
    })
})

export type SendPrivateMessageBodyType = TypeOf<typeof sendPrivateMessage>['body']
export type SendPrivateMessageParamsType = TypeOf<typeof sendPrivateMessage>['params']