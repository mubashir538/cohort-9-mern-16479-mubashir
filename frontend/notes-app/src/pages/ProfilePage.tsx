import {Link} from 'react-router-dom';
import type {ReactElement} from 'react';
import { useAuth } from '../context/AuthContext';
import {ArrowLeft,Mail,User as UserIcon,LogOut} from 'lucide-react';
import './ProfilePage.css'


function ProfilePage(): ReactElement{
    const {user,logout}  = useAuth();

    const initials = user?.name
        ? user.name.trim().split(' ').map((part)=>part[0]).slice(0,2).join('').toUpperCase()
        : '?';

    async function handleLogout(): Promise<void>{
        try{
            await logout();
        }catch(err){
            console.error('Failed to log out',err);
        }
    }

    return (
        <div className="ProfilePage">

            <Link to="/dashboard" className="ProfileBackLink">
            <ArrowLeft size={16}/>
            Back
            </Link>

            <div className="ProfileHero">
                <div className="ProfileAvatar">{initials}</div>
                <h1 className="ProfileHeroName">{user?.name}</h1>
                <span className="ProfileHeroBadge">Notes App Member</span>
            </div>

            <div className="ProfileCard">

                <div className="ProfileRow">
                    <span className="ProfileRowIcon"><UserIcon size={18}/></span>
                    <div className="ProfileRowText">
                    <span className="ProfileLabel">Name</span>
                    <span className="ProfileValue">{user?.name}</span>
                    </div>
                </div>

                <div className="ProfileRow">
                    <span className="ProfileRowIcon"><Mail size={18}/></span>
                    <div className="ProfileRowText">
                    <span className="ProfileLabel">Email</span>
                    <span className="ProfileValue">{user?.email}</span>
                    </div>
                </div>

            </div>

            <div className="ProfileActions">
                <Link to="/dashboard" className="ProfileDashboardButton">Go to Dashboard</Link>

                <button onClick={handleLogout} className="ProfileLogoutButton">
                <LogOut size={16}/>
                Logout
                </button>
            </div>

        </div>
    );
}

export default ProfilePage;