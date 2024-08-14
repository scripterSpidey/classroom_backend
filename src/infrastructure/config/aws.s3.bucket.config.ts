import { S3Client } from "@aws-sdk/client-s3";
import { AWS_S3_BUCKET_ACCESS_KEY } from "../../infrastructure/constants/env";

import { AWS_S3_BUCKET_SECRET_KEY } from "../../infrastructure/constants/env";
import { AWS_S3_BUCKET_REGION } from "../../infrastructure/constants/env";


export const s3 = new S3Client({
    credentials: {
        accessKeyId: AWS_S3_BUCKET_ACCESS_KEY,
        secretAccessKey:AWS_S3_BUCKET_SECRET_KEY
    },
    region:AWS_S3_BUCKET_REGION
})