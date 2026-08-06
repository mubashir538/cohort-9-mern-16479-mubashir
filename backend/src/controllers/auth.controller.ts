import {Request,Response} from 'express';
import  authService  from '../services/auth.service';
import asyncHandler from '../utils/asyncHandler';
import  AppError from '../utils/Errors';

interface signupBody{
    name: string;
    email: string;
    password: string;
}

interface loginBody{
    email: string;
    password: string;
}


const isProduction = process.env.NODE_ENV === 'production';

function setTokenCookie(res:Response, token: string): void {
    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7,

    })
}


const signup = asyncHandler(async (req:Request<{}, {}, signupBody>, res:Response) => {
    const {name,email,password} = req.body;

    if (!name || !email || !password){
        throw new AppError('Missing required fields', 400, "MISSING_FIELDS");
    }

    const result = await authService.signup(name,email,password);

  setTokenCookie(res, result.token);

    res.status(201).json({success: true, data: {user: result.user}});
});

const login = asyncHandler(async (req:Request<{}, {}, loginBody>, res:Response) => {
    const {email,password} = req.body;

    if (!email || !password){
        throw new AppError('Missing required fields', 400, "MISSING_FIELDS");
    }

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