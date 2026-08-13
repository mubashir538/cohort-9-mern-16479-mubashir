import {Link} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


function ProfilePage(){
    const {user,logout}  = useAuth();
    return (
        <div>
            <Link to="/dashboard">Back to Dashboard</Link>
            <h1>Your Profile</h1>
            <p>
                <strong>Name: </strong>
                {user?.name}
                <strong>Email: </strong>
                {user?.email}
                <button onClick={logout}>Logout</button>
            </p>
        </div>
    );
}

export default ProfilePage;