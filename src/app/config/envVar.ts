import dotenv from "dotenv"

dotenv.config()

export interface interConfig {
    PORT: string,
    NODE_ENV: "development" | "production",
    DATABASE_URL: string,
    JWT_ACCESS_SECRET: string
    JWT_SALT: string
    JWT_REFRESH_SECRET: string
    JWT_ACCESS_EXPIRE: string
    JWT_REFRESH_EXPIRE: string
    ADMIN_EMAIL:string,
    ADMIN_PASS:string,
    CLOUDINARY_API_CLOUD: string,
    CLOUDINARY_API_KEY: string,
    CLOUDINARY_API_SECRET: string,
    STRIPE_SECRET_KEY: string,
    FRONTEND_URL:string,
    STRIPE_WEBHOOK_SECRET:string
}

const envProvider = (): interConfig => {
    const configKey: string[] = ['PORT','DATABASE_URL','NODE_ENV','JWT_ACCESS_SECRET','JWT_REFRESH_SECRET','JWT_SALT','JWT_ACCESS_EXPIRE','JWT_REFRESH_EXPIRE','ADMIN_EMAIL','ADMIN_PASS','CLOUDINARY_API_CLOUD','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET','STRIPE_SECRET_KEY','FRONTEND_URL','STRIPE_WEBHOOK_SECRET']
    configKey.forEach((key) => {
        if (!process.env[key]) {
            throw new Error(`Missing environment variable: ${key}`);

        }
    })
    return {
    PORT: process.env.PORT as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    DATABASE_URL: process.env.DATABASE_URL as string,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_SALT: process.env.JWT_SALT  as string,
    JWT_ACCESS_EXPIRE:process.env.JWT_ACCESS_EXPIRE as string,
    JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE as string,
    ADMIN_EMAIL:process.env.ADMIN_EMAIL as string,
    ADMIN_PASS:process.env.ADMIN_PASS as string,
    CLOUDINARY_API_CLOUD: process.env.CLOUDINARY_API_CLOUD as string,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string
    }

}

export const envVar = envProvider()