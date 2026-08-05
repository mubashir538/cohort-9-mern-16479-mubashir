import { Request, Response, NextFunction, RequestHandler } from 'express';

function asyncHandler<P = Record<string,string>, ResBody = unknown, ReqBody = unknown, ReqQuery =  unknown>(
    fn : (req : Request<P, ResBody, ReqBody, ReqQuery>, res : Response<ResBody>, next : NextFunction) => Promise<void>
): RequestHandler<P, ResBody, ReqBody, ReqQuery>{
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        }

    }

export default asyncHandler;