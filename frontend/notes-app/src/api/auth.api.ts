import axiosClient  from "./axiosClient";

export interface AuthResponse{
    success: boolean,
    data:{
        token:string,
        user: {
            id: string,
            email: string,
            name: string
        };
    };
}

export interface  LogoutResponse{
    success: boolean;
    data: {
        message: string;
    };
}

export const authApi = {
    signup: (name:string, email:string, password:string)=> axiosClient.post<AuthResponse>('/auth/signup', {name,email,password}),
    login: (email:string, password:string)=> axiosClient.post<AuthResponse>('/auth/login', {email,password}),
    logout: ()=> axiosClient.post<LogoutResponse>('/auth/logout'),
    getMe: ()=> axiosClient.get<AuthResponse>('/auth/me'),
};