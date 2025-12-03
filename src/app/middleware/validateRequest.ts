import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";


const validateRequest = (schema: ZodObject) => async (req: Request, res:Response,next:NextFunction) =>{
    try {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data)
        }
        await schema.parseAsync(req.body)
        return next()
    } catch (error) {
      next(error)   
    }
}

export default validateRequest