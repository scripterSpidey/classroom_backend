import { Request } from "express";

export interface CostumeRequest extends Request{
    user?:any
}