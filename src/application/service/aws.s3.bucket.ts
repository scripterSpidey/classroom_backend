
import { S3Client, PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
import { AWS_S3_BUCKET_ACCESS_KEY } from "../../infrastructure/constants/env";
import { AWS_S3_BUCKET_NAME } from "../../infrastructure/constants/env";
import { AWS_S3_BUCKET_SECRET_KEY } from "../../infrastructure/constants/env";
import { AWS_S3_BUCKET_REGION } from "../../infrastructure/constants/env";
import { s3 } from '../../infrastructure/config/aws.s3.bucket.config';
import { I_S3Bucket } from "../../interface/service_interface/I_S3.bucket";


export class AWSS3Bucket implements I_S3Bucket {
    constructor() { }

    async uploadProfileImage(imageName: string, buffer: Buffer, contentType: string) {
 

        const params = {
            Bucket: AWS_S3_BUCKET_NAME,
            Key: `profile_images/${imageName}`,
            Body: buffer,
            ContentType: contentType,
            ACL:ObjectCannedACL.public_read
        }

        try {
            const command = new PutObjectCommand(params);
            const response = await s3.send(command);
    
        } catch (error) {
    
            throw error
        }

    }
}