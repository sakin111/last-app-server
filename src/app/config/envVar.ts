import dotenv from "dotenv"

dotenv.config()

export interface interConfig  {
    PORT: string,
    NODE_ENV: "development" | "production",
}

const envProvider = (): interConfig =>{
    const configKey: string[] =  ['PORT','DB_URL','NODE_ENV']
    configKey.forEach((key) =>{
        if(!process.env[key]){
            throw new Error("key is missing in the env")
        }
    })
       return{
        PORT: process.env.PORT as string,
        NODE_ENV: process.env.NODE_ENV as "development" | "production",
       }
  
}

export const envVar = envProvider()