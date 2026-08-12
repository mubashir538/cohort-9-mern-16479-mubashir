import {Request,Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import AppError from '../utils/Errors';
import asyncHandler from '../utils/asyncHandler';


interface TokenPayload{
    userId: string;
    email: string;
}

const verifyToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    
    const token = req.cookies?.token;

    if (!token) {
        throw new AppError('No Token Provided', 401, "NO_TOKEN_PROVIDED");
    }

    try{
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET as string) as TokenPayload;

        req.userId = decodedToken.userId;
        next();

    }catch(error){
        throw new AppError('Invalid or Expired Token Provided ', 401, "INVALID_TOKEN");
    }
});

export default verifyToken;

