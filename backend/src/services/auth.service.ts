import bycrypt from "bcrypt";
import {User} from '../models';
import {IUser} from '../models/user.model';
import jwt from 'jsonwebtoken';
import AppError from "../utils/Errors";
import logger from "../config/logger";

const SALT_ROUNDS: number =  12;

interface AuthResult{
    token:string,
    user : {
        id: string;
        email: string;
        name : string;
    };
}

function generateToken(user:IUser):string{
    return jwt.sign(
        {userId: user._id.toString(),email : user.email},
        process.env.JWT_SECRET as string,
        {expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn']}
    );
}

async function signup(name:string,email:string,password:string):Promise<AuthResult>{
    const isExistingUser = await User.findOne({email});
    if (isExistingUser){
        throw new AppError('User with this email already exists', 400, "USER_ALREADY_EXISTS");
    }

    const passwordHashed = await bycrypt.hash(password,SALT_ROUNDS);
    const user = await User.create({name,email,passwordHashed});
    logger.info({userId: user._id.toString()},'New User created successfully');

    const token = generateToken(user);

    return({token, user:{id: user._id.toString(), email: user.email, name: user.name}});
}

async function login(email:string,password:string):Promise<AuthResult>{
    const user = await User.findOne({email});

    if (!user){
        throw new AppError('Invalid email or password', 401, "INVALID_CREDENTIALS");
    }
    const PasswordValid = await bycrypt.compare(password,user.passwordHashed);

    if (!PasswordValid){
        throw new AppError('Invalid email or password', 401, "INVALID_CREDENTIALS");
    }

    const currentRounds = bycrypt.getRounds(user.passwordHashed);
    if (currentRounds < SALT_ROUNDS){
        try{
            user.passwordHashed = await bycrypt.hash(password,SALT_ROUNDS);
            await user.save();
            logger.info({userId: user._id.toString()},'Upgraded password hash to current cost');
        }catch(err){
            logger.error({err,userId: user._id.toString()},'Failed to upgrade password hash');
        }
    }
    logger.info({userId: user._id.toString()},'User logged in successfully');
    const token = generateToken(user);

    return({token, user:{id: user._id.toString(), email: user.email, name: user.name}});
}


async function getUserById(userId:string):Promise<IUser>{
    const user = await User.findById(userId).select('-passwordHashed');

    if(!user){
        throw new AppError('User not found', 404, "USER_NOT_FOUND");
    
    }
    return user;
}


export default {
    signup,
    login,
    getUserById
};