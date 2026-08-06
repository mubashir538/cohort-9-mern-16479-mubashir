import {createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {authApi} from '../api/auth.api';

interface User{
    id: string;
    email: string;
    name: string;
}

interface AuthContextType{
    user: User |null;
    isAuthenticated: boolean;
    isLoading:boolean;
    signup:(name:string, email:string, password:string)=>Promise<User>;
    login: (email:string, password:string)=>Promise<User>;
    logout: ()=>Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({children}: {children: ReactNode}){
    const [user,setUser]= useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(()=>{
        authApi.getMe().then((response)=>{
            setUser(response.data.data.user);
        }).catch(()=>{
            setUser(null);
        }).finally(()=>{
            setIsLoading(false);
        });
    },[]);

    async function signup(name:string,email:string, password: string): Promise<User>{
        const response = await authApi.signup(name,email,password);
        const newUser = response.data.data.user;

        setUser(newUser);

        return newUser;
    }

    async function login(email:string, password: string): Promise<User>{
        const response = await authApi.login(email,password);
        const  loggedinUser = response.data.data.user;

        setUser(loggedinUser);

        return loggedinUser;
}

async function logout(): Promise<void>{
    try{
        await authApi.logout();
    }finally{
    setUser(null);
    }
}

const value : AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signup,
    login,
    logout
};

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