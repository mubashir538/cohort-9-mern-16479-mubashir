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

const signup = asyncHandler(async (req:Request<{}, {}, signupBody>, res:Response) => {
    const {name,email,password} = req.body;

    if (!name || !email || !password){
        throw new AppError('Missing required fields', 400, "MISSING_FIELDS");
    }

    const result = await authService.signup(name,email,password);

    res.status(201).json({success: true, data: result});
});

const login = asyncHandler(async (req:Request<{}, {}, loginBody>, res:Response) => {
    const {email,password} = req.body;

    if (!email || !password){
        throw new AppError('Missing required fields', 400, "MISSING_FIELDS");
    }

    const result = await authService.login(email,password);

    res.status(200).json({success: true, data: result});
});


const logout = asyncHandler(async (req:Request, res:Response) => {
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