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
export const EMAIL = getEnv("EMAIL")
export const JWT_PRIVATE_KEY = getEnv("JWT_PRIVATE_KEY");
export const JWT_PUBLIC_KEY = getEnv("JWT_PUBLIC_KEY");