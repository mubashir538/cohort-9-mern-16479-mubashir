import {Request, Response, NextFunction} from 'express';
import logger from '../config/logger';
import AppError from '../utils/Errors';


function errorMiddleWare(err: unknown, req: Request, res: Response, next: NextFunction): void{
    const isAppError = err instanceof AppError;

    const statusCode = isAppError ? err.statusCode : 500;
    const code = isAppError ? err.code : 'INTERNAL_SERVER_ERROR';
    const msg = isAppError ? err.message : 'Something went wrong';

    if(req.log){
        req.log.error({err}, 'Error occurred');
    }else{
logger.error({err}, 'Error occurred');
    }


    res.status(statusCode).json({
        success: false,
        message: {code,msg},
    });
}

export default errorMiddleWare;

