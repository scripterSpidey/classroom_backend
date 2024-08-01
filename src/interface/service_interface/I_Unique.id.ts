import { customAlphabet } from "nanoid";

export type NanoIDType = typeof customAlphabet

export interface I_UniqueIDGenerator{
    generateId():string;
}