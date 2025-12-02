import dotenv from "dotenv"

dotenv.config()

export interface interConfig {
    PORT: string,
    NODE_ENV: "development" | "production",
    JWT_ACCESS_SECRET: string
    JWT_SALT: string
    JWT_REFRESH_SECRET: string
    JWT_ACCESS_EXPIRE: string
    JWT_RESET_EXPIRE_IN: string
    JWT_REFRESH_EXPIRE: string
    RESET_PASS_LINK: string
    ADMIN_EMAIL:string,
    ADMIN_PASS:string
}

const envProvider = (): interConfig => {
    const configKey: string[] = ['PORT','DB_URL','NODE_ENV','JWT_ACCESS_SECRET',
        'JWT_REFRESH_SECRET','JWT_SALT','JWT_ACCESS_EXPIRE','JWT_RESET_EXPIRE_IN','JWT_REFRESH_EXPIRE','RESET_PASS_LINK','ADMIN_EMAIL','ADMIN_PASS']
    configKey.forEach((key) => {
        if (!process.env[key]) {
            throw new Error("key is missing in the env")
        }
    })
    return {
    PORT: process.env.PORT as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_SALT: process.env.JWT_SALT  as string,
    JWT_ACCESS_EXPIRE:process.env.JWT_ACCESS_EXPIRE as string,
    JWT_RESET_EXPIRE_IN:process.env.JWT_RESET_EXPIRE_IN as string,
    JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE as string,
    RESET_PASS_LINK:process.env.RESET_PASS_LINK as string,
    ADMIN_EMAIL:process.env.ADMIN_EMAIL as string,
    ADMIN_PASS:process.env.ADMIN_PASS as string,
    }

}

export const envVar = envProvider()