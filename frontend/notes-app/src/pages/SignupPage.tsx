import {useState, type SubmitEvent} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import axios from 'axios';
import {NotebookPen,User,Mail,LockIcon} from 'lucide-react';
import {validateEmail,validatePassword,validateName} from '../utils/validation';
import './SignupPage.css'

function SignupPage(){
    const [email,setEmail] = useState('');
    const [name,setName] = useState('');
    const [password,setPassword] = useState('');
    const [error,setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nameError,setNameError] = useState('');
    const [emailError,setEmailError] = useState('');
    const [passwordError,setPasswordError] = useState('');

    const {signup} = useAuth();
    const navigate = useNavigate();

    function handleNameBlur(){
        setNameError(validateName(name) ?? '')
    }
    
    function handleEmailBlur(){
        setEmailError(validateEmail(email) ?? '')
    }
    
    function handlePasswordBlur(){
        setPasswordError(validatePassword(password) ?? '')
    }

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>){
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const nameValidationError = validateName(name)
        const emailValidationError = validateEmail(email)
        const passwordValidationError = validatePassword(password)

        if(nameValidationError || emailValidationError || passwordValidationError){
            setNameError(nameValidationError ?? '');
            setEmailError(emailValidationError ?? '');
            setPasswordError(passwordValidationError ?? '');
            return;
        }
        setIsSubmitting(true);
        try{
            await signup(name,email,password);
            navigate('/dashboard');
        }
        catch(err:unknown){
            if(axios.isAxiosError(err)){
                const msg = err.response?.data?.error?.message || "Something went wrong";
                setError(msg);
            }
            else{
                setError('Something went wrong');
            }
        }
        finally{
            setIsSubmitting(false);
        }

    }
    return (
        <div className="SignupPage">
    
            <div className="SignupLeftPanel">
    
                <div className="SignupBrandRow">
                <NotebookPen size={22}/>
                <span className="SignupBrandText">Notes</span>
                </div>
    
                <div className="SignupIllustration">
                    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="35" y="25" width="120" height="150" rx="14" fill="var(--primary100)"/>
                    <rect x="60" y="45" width="140" height="150" rx="14" fill="white" stroke="var(--neutral200)" strokeWidth="2"/>
                    <rect x="80" y="70" width="90" height="10" rx="5" fill="var(--primary400)"/>
                    <rect x="80" y="92" width="100" height="8" rx="4" fill="var(--neutral200)"/>
                    <rect x="80" y="108" width="100" height="8" rx="4" fill="var(--neutral200)"/>
                    <rect x="80" y="124" width="60" height="8" rx="4" fill="var(--neutral200)"/>
                    <circle cx="170" cy="165" r="22" fill="var(--primary500)"/>
                    <path d="M162 165 L168 171 L179 158" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
    
                <p className="SignupIllustrationText">All your notes, organised and always with you</p>
    
                <div className="SignupDotGrid">
                    <span className="SignupDot"></span><span className="SignupDot"></span><span className="SignupDot"></span>
                    <span className="SignupDot"></span><span className="SignupDot"></span><span className="SignupDot"></span>
                </div>
            </div>
    
        <div className="SignupRightPanel">
        <form onSubmit={handleSubmit} className="SignupFormCard">
            <h1 className="SignupTitle">Signup </h1>
            {error && <p className="SignupError">{error}</p>}
    
            <div className="SignupFieldGroup">
            <label htmlFor="name" className="SignupLabel">Name</label>
            <div className="SignupInputWrapper">
            <User size={17} className="SignupInputIcon"/>
            <input id="name" type="text" className="SignupInput" placeholder="Enter your name" onBlur={handleNameBlur} value={name} onChange={(e)=>setName(e.target.value)} required/>
            {nameError && <p className="SignupError">{nameError}</p>}
            </div>
            </div>
    
            <div className="SignupFieldGroup">
            <label htmlFor="email" className="SignupLabel">Email</label>
            <div className="SignupInputWrapper">
            <Mail size={17} className="SignupInputIcon"/>
            <input id="email" type="email" className="SignupInput" placeholder="Enter your email" value={email} onBlur={handleEmailBlur} onChange={(e)=>setEmail(e.target.value)} required/>
            {emailError && <p className="SignupError">{emailError}</p>}
            </div>
            </div>
    
            <div className="SignupFieldGroup">
            <label htmlFor="password" className="SignupLabel">Password</label>
            <div className="SignupInputWrapper">
            <LockIcon size={17} className="SignupInputIcon"/>
            <input id="password" type="password" className="SignupInput" placeholder="Enter your password" value={password} onBlur={handlePasswordBlur} onChange={(e)=>setPassword(e.target.value)} required minLength={8}/>
            {passwordError && <p className="SignupError">{passwordError}</p>}
            </div>
            </div>
    
            <button type="submit" className="SignupButton" disabled={isSubmitting}>{isSubmitting ? 'Creating Your Account...' : 'Signup'}</button>
    
            <p className="SignupFooterText">Already have an account? <Link to="/login" className="SignupFooterLink">Login</Link></p>
        </form>
        </div>
    
        </div>
        );
}


export default SignupPage;