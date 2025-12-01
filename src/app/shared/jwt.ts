
import Jwt, { JwtPayload, SignOptions } from "jsonwebtoken"

 export const generateToken = (payload : JwtPayload, secret:string , expiresIn: string) =>{
   const token = Jwt.sign(payload,secret,{
    expiresIn
   } as SignOptions)
   return token
}
 
 export const verifyTokens = (token: string , secret: string) =>{
    const verifiedToken = Jwt.verify(token,secret)
    return verifiedToken
}