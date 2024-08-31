const getEnv =(key:string,defaultValue?: string):string  =>{
    const value = process.env[key] || defaultValue;
    if(value == undefined){
        throw new Error(`missing env variable ${key}`)
    }
    return value;
}

export const DATABASE_URL  = getEnv('DATABASE_URL')
export const PORT = getEnv("PORT","4500")
export const NODE_ENV = getEnv("NODE_ENV");
export const API_ORIGIN = getEnv("API_ORIGIN")
export const EMAIL_PASSKEY = getEnv('EMAIL_PASSKEY')
export const EMAIL = getEnv("EMAIL");
export const CLIENT_BASE_URL = getEnv('CLIENT_BASE_URL')

//jwt
export const JWT_PRIVATE_KEY = getEnv("JWT_PRIVATE_KEY");
export const JWT_PUBLIC_KEY = getEnv("JWT_PUBLIC_KEY");

//s3 bucket
export const AWS_S3_BUCKET_NAME = getEnv("AWS_S3_BUCKET_NAME")
export const AWS_S3_BUCKET_REGION =getEnv("AWS_S3_BUCKET_REGION")
export const AWS_S3_BUCKET_ACCESS_KEY = getEnv("AWS_S3_BUCKET_ACCESS_KEY")
export const AWS_S3_BUCKET_SECRET_KEY = getEnv("AWS_S3_BUCKET_SECRET_KEY")