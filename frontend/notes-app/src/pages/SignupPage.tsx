import {useState} from 'react';
import type {FormEvent} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

function SignupPage(){
    const [email,setEmail] = useState('');
    const [name,setName] = useState('');
    const [password,setPassword] = useState('');
    const [error,setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {signup} = useAuth();
    const navigate = useNavigate();


    async function handleSubmit(e:FormEvent<HTMLFormElement>){
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try{
            await signup(name,email,password);
            navigate('/dashboard');
        }
        catch(err:any){
            const errorMessage = err.response?.data?.error?.message || "Something went wrong";
            setError(errorMessage);
        }
        finally{
            setIsSubmitting(false);
        }

    }
    return (<>
    <form onSubmit={handleSubmit}>
        <h1>Signup </h1>
        {error && <p>{error}</p>}

        <input id="name" type="text" value={name} onChange={(e)=>setName(e.target.value)} required/>
        <input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
        <input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={8}/>
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating Your Account...' : 'Signup'}</button>

        <p>Already have an account? <Link to="/login">Login</Link></p>
    </form>
    </>);
}


export default SignupPage;