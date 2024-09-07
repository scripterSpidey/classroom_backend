import { TypeOf, z } from "zod";

export const startLiveClassSchema = z.object({
    body: z.object({
        title: z.string({
            required_error: 'A title for the class is required'
        })
    })

});

export type StartLiveClassBodyType = TypeOf<typeof startLiveClassSchema>['body']