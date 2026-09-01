import {Request,Response} from 'express';
import  authService  from '../services/auth.service';
import asyncHandler from '../utils/asyncHandler';
import ms from 'ms';
import { signupSchema, loginSchema } from '../validators/auth.validator';
import type { SignupInput, LoginInput } from '../validators/auth.validator';
import parseOrThrow from '../utils/parseOrThrow';
import AppError from '../utils/Errors';

const isProduction = process.env.NODE_ENV === 'production';

interface PublicUser{
    id: string;
    name: string;
    email: string;
}

interface AuthResponseBody{
    success: boolean;
    data: { user: PublicUser };
}

interface LogoutResponseBody{
    success: boolean;
    data: { message: string };
}

function setTokenCookie(res:Response, token: string): void {
    const expiry = process.env.JWT_EXPIRES_IN || '7d';
    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: ms(expiry as ms.StringValue),

    })
}


const signup = asyncHandler(async (req:Request<{}, AuthResponseBody, SignupInput>, res:Response<AuthResponseBody>) => {
    const {name,email,password} = parseOrThrow(signupSchema, req.body);

    try{

        const result = await authService.signup(name,email,password);
        setTokenCookie(res, result.token);
        res.status(201).json({success: true, data: {user: result.user}});
    }catch(error){
        if (error instanceof AppError){
            throw error;
        }
        throw new AppError('Signup failed', 500, 'SIGNUP_FAILED');
    }

});

const login = asyncHandler(async (req:Request<{}, AuthResponseBody, LoginInput>, res:Response<AuthResponseBody>) => {
    const {email,password} = parseOrThrow(loginSchema, req.body);

    try{
        const result = await authService.login(email,password);
        setTokenCookie(res, result.token);
        res.status(200).json({success: true, data: {user: result.user}});
    }catch(error){
        if (error instanceof AppError){
            throw error;
        }
        throw new AppError('Login failed', 500, 'LOGIN_FAILED');
    }
});


const logout = asyncHandler(async (req:Request<{},LogoutResponseBody>, res:Response<LogoutResponseBody>) => {

    res.clearCookie('token',{
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
    });

    
    res.status(200).json({success: true, data: {message: 'Logged out successfully'}});
});

const getMe = asyncHandler(async (req:Request<{},AuthResponseBody>, res:Response<AuthResponseBody>) => {
    try{
        const user = await authService.getUserById(req.userId as string);
        res.status(200).json({success: true, data: {user: {id: user._id.toString(), name: user.name, email: user.email}}});
    }catch(error){
        if (error instanceof AppError){
            throw error;
        }
        throw new AppError('Could not load user', 500, 'GET_ME_FAILED');
    }
});


export default {
    signup,
    login,
    logout,
    getMe
};