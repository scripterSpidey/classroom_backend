import { I_UniqueIDGenerator } from "../../interface/service_interface/I_Unique.id";
import { NanoIDType } from "../../interface/service_interface/I_Unique.id";
import { nanoid } from "nanoid";

export class UniqueIDGenerator implements I_UniqueIDGenerator{
    private generator ;

    constructor(generator:NanoIDType){
        this.generator = generator;
    }
    generateId():string {
        const contents = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const costumId = this.generator(contents,6)
        return costumId();
    }

    generateMaterialId():string{
        const contents = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
        const materialId = this.generator(contents,16)
        return materialId()
    }
    
}