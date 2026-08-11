import {useState} from 'react';
import type {FormEvent} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import axios from 'axios';

function LoginPage(){
    const [email,setEmail]= useState('');
    const [password,setPassword] = useState('');
    const [error,setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {login} = useAuth();
    const navigate  = useNavigate();

    async function handleSubmit(e:FormEvent<HTMLFormElement>){
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try{
            await login(email,password);
            navigate('/dashboard');
        }catch(err:unknown){
            if(axios.isAxiosError(err)){
                const msg = err.response?.data?.error?.message || "Something went wrong";
                setError(msg); 
            }
            else{
                setError('Something went wrong');
            }
        }finally{
            setIsSubmitting(false);
        }   
    }

     return (
            <>
            <form onSubmit={handleSubmit} >
                <h1>Login</h1>
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
                <label htmlFor="password">Password</label>
                <input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required/>
                <p>{error}</p>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging in...' : 'Login'}
                </button>

                <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
            </form>
            </>
        );

    
}

export default LoginPage