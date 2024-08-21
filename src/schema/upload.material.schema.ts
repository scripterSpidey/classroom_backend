import { query } from "express";
import { TypeOf, z } from "zod";


export const uploadMaterilaSchema = z.object({
    body: z.object({
        title: z.string({
            required_error: "Title for the material is  required!"
        }),
        description: z.string({
            required_error: "Description for the material is required!"
        })
    }),
    file:z.object({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.string(),
        size: z.number(),
        destination: z.string().optional(),
        filename: z.string().optional(),
        path: z.string().optional(),
        buffer: z.instanceof(Buffer).optional(),
      }).nullable().refine(file => file != null, "Material file is required!")
})

export const  deleteMaterialSchema = z.object({
    query:z.object({
        materialId:z.string({
            required_error:'Material id can not be empty'
        })
    })
})

export type UploadMaterialBodyType = TypeOf<typeof uploadMaterilaSchema>['body']
export type UploadMaterialFileType = TypeOf<typeof uploadMaterilaSchema>['file']
export type DeleteMaterialQueryType = TypeOf<typeof deleteMaterialSchema>['query']