import {createContext, useContext, useEffect, useState, useMemo, useCallback, type ReactNode } from 'react';
import {authApi} from '../api/auth.api';
import axios from 'axios';

interface User{
    id: string;
    email: string;
    name: string;
}

function getAuthErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        if (typeof message === 'string') {
            return message;
        }

        if (error.response?.status === 401) {
            return 'Invalid email or password';
        }

        if (error.response?.status === 409) {
            return 'An account with this email already exists';
        }

        if (!error.response) {
            return 'Unable to connect to the server';
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'Something went wrong. Please try again.';
}

interface AuthContextType{
    user: User |null;
    isAuthenticated: boolean;
    isLoading:boolean;
    authError: string | null;
    signup:(name:string, email:string, password:string)=>Promise<User>;
    login: (email:string, password:string)=>Promise<User>;
    logout: ()=>Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({children}: Readonly<{children: ReactNode}>){
    const [user,setUser]= useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authError,setAuthError] = useState<string | null>(null);
    
    useEffect(()=>{
        authApi.getMe().then((response)=>{
            setUser(response.data.data.user);
        }).catch(()=>{
            setUser(null);
        }).finally(()=>{
            setIsLoading(false);
        });
    },[]);

    const signup = useCallback(async (name:string,email:string, password: string): Promise<User> => {
       try{
            setAuthError(null);
           const response = await authApi.signup(name,email,password);
           const newUser = response.data.data.user;
           
           setUser(newUser);
           
           return newUser;
        }catch(error){
            const msg = getAuthErrorMessage(error);
            setAuthError(msg);
            throw new Error(msg);
        }
    }, []);

    const login = useCallback(async (email:string, password: string): Promise<User> => {
        try{
            setAuthError(null);

            const response = await authApi.login(email,password);
            const  loggedinUser = response.data.data.user;
            
            setUser(loggedinUser);
            
            return loggedinUser;
        }catch(error){
            const msg = getAuthErrorMessage(error);
            setAuthError(msg);
            throw new Error(msg);
        }
}, []);

const logout = useCallback(async (): Promise<void> => {
    try{
        setAuthError(null);
        await authApi.logout();
    }catch(error){
        const msg = getAuthErrorMessage(error);
            setAuthError(msg);
            throw new Error(msg);
    }
    finally{
    setUser(null);
    }
}, []);

const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    signup,
    authError,
    login,
    logout
}), [user, isLoading, authError, signup, login, logout]);

return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
);
}

export function useAuth(): AuthContextType{
    const context = useContext(AuthContext);

    if(!context){
        throw new   Error('useAuth must be used within AuthProvider');
    }
    return context;
}