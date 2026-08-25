import {useState} from 'react';
import type {FormEvent} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import axios from 'axios';
import './LoginPage.css';
import {NotebookPen,Mail,LockIcon} from 'lucide-react';
import {validateEmail} from '../utils/validation'

function LoginPage(){
    const [email,setEmail]= useState('');
    const [emailError,setEmailError] = useState('');
    const [password,setPassword] = useState('');
    const [error,setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {login} = useAuth();
    const navigate  = useNavigate();

    function handleEmailBlur(){
        setEmailError(validateEmail(email) ?? '')
    }


    async function handleSubmit(e:FormEvent<HTMLFormElement>){
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        const emailValidationError = validateEmail(email)
        if(emailValidationError){
            setEmailError(emailValidationError);
            return;
        }
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

    return(
    <div className="LoginPage">

    <div className="LoginLeftPanel">

        <div className="LoginBrandRow">
        <NotebookPen size={22}/>
        <span className="LoginBrandText">Notes</span>
        </div>

        <div className="LoginIllustration">
            <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="35" y="25" width="120" height="150" rx="14" fill="var(--primary100)"/>
            <rect x="60" y="45" width="140" height="150" rx="14" fill="white" stroke="var(--neutral200)" strokeWidth="2"/>
            <rect x="80" y="70" width="90" height="10" rx="5" fill="var(--primary400)"/>
            <rect x="80" y="92" width="100" height="8" rx="4" fill="var(--neutral200)"/>
            <rect x="80" y="108" width="100" height="8" rx="4" fill="var(--neutral200)"/>
            <rect x="80" y="124" width="60" height="8" rx="4" fill="var(--neutral200)"/>
            <circle cx="170" cy="165" r="22" fill="var(--primary500)"/>
            <path d="M170 152 L170 178 M157 165 L183 165" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            </svg>
        </div>

        <p className="LoginIllustrationText">Your thoughts, organised, always with you</p>

        <div className="LoginDotGrid">
            <span className="LoginDot"></span><span className="LoginDot"></span><span className="LoginDot"></span>
            <span className="LoginDot"></span><span className="LoginDot"></span><span className="LoginDot"></span>
        </div>

    </div>

    <div className="LoginRightPanel">

    <form onSubmit={handleSubmit} className="LoginFormCard">

        <h1 className="LoginTitle">Log In</h1>
        <p className="LoginSubtitle">Welcome back, pick up where you left off</p>

        {error && <p className="LoginError">{error}</p>}

        <div className="LoginFieldGroup">
        <label htmlFor="email" className="LoginLabel">Email address</label>
        <div className="LoginInputWrapper">
        <Mail size={17} className="LoginInputIcon"/>
        <input
          id="email"
          type="email"
          className="LoginInput"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {emailError && <p className="LoginError">{emailError}</p>}
        </div>
        </div>

        <div className="LoginFieldGroup">
        <label htmlFor="password" className="LoginLabel">Password</label>
        <div className="LoginInputWrapper">
        <LockIcon size={17} className="LoginInputIcon"/>
        <input
          id="password"
          type="password"
          className="LoginInput"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        </div>
        </div>

        <button
          type="submit"
          className="LoginButton"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in…' : 'Log In'}
        </button>

        <p className="LoginFooterText">
          Don't have an account?{' '}
          <Link to="/signup" className="LoginFooterLink">Sign up</Link>
        </p>

    </form>

    </div>

</div>
);
}

export default LoginPage