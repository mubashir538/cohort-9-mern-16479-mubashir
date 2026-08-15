import {Link} from 'react-router-dom';
import type {ReactElement} from 'react';
import { useAuth } from '../context/AuthContext';


function ProfilePage(): ReactElement{
    const {user,logout}  = useAuth();

    async function handleLogout(): Promise<void>{
        try{
            await logout();
        }catch(err){
            console.error('Failed to log out',err);
        }
    }

    return (
        <div>
            <Link to="/dashboard">Back to Dashboard</Link>
            <h1>Your Profile</h1>
            <p>
                <strong>Name: </strong>
                {user?.name}
                <strong>Email: </strong>
                {user?.email}
                <button onClick={handleLogout}>Logout</button>
            </p>
        </div>
    );
}

export default ProfilePage;