import {Request,Response} from 'express';
import  authService  from '../services/auth.service';
import asyncHandler from '../utils/asyncHandler';
import  AppError from '../utils/Errors';
import ms from 'ms';
import { signupSchema, loginSchema } from '../validators/auth.validator';
import type { SignupInput, LoginInput } from '../validators/auth.validator';
import parseOrThrow from '../utils/parseOrThrow';


const isProduction = process.env.NODE_ENV === 'production';

function setTokenCookie(res:Response, token: string): void {
    const expiry = process.env.JWT_EXPIRY || '7d';
    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: ms(expiry as ms.StringValue),

    })
}


const signup = asyncHandler(async (req:Request<{}, {}, SignupInput>, res:Response) => {
    const {name,email,password} = parseOrThrow(signupSchema, req.body);

    const result = await authService.signup(name,email,password);

    setTokenCookie(res, result.token);

    res.status(201).json({success: true, data: {user: result.user}});
});

const login = asyncHandler(async (req:Request<{}, {}, LoginInput>, res:Response) => {
    const {email,password} = parseOrThrow(loginSchema, req.body);

    const result = await authService.login(email,password);
    setTokenCookie(res, result.token);
    res.status(200).json({success: true, data: {user: result.user}});
});


const logout = asyncHandler(async (req:Request, res:Response) => {

    res.clearCookie('token',{
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
    });

    
    res.status(200).json({success: true, data: {message: 'Logged out successfully'}});
});

const getMe = asyncHandler(async (req:Request, res:Response) => {
    const user = await authService.getUserById(req.userId as string);
    res.status(200).json({success: true, data: {user}});
});


export default {
    signup,
    login,
    logout,
    getMe
};