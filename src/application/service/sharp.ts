import sharp from "sharp";
import { I_Sharp } from "../../interface/service_interface/I_sharp";



export class FileModifier implements I_Sharp {

    constructor() { }

    async resizeImage(file: Buffer): Promise<Buffer> {

        try {
            return await sharp(file)
                .resize({
                    height: 400,
                    width: 400,
                    fit: "cover"
                })
                .webp()
                .toBuffer()
        } catch (error) {
            throw error
        }

    }
}