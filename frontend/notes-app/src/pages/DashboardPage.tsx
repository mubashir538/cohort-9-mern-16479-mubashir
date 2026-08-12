import {useAuth} from '../context/AuthContext';

function DashboardPage(){
    const {user, logout} = useAuth();

     async function handleLogout() {
        try {
            await logout();
        } catch {
            console.error('Failed to log out');
        }
    }

    return (<>
    <h1>Dashboard</h1>
    <h2>Welcome {user?.name}</h2>
    <button onClick={()=> handleLogout()}>Logout</button>
    <p>Your Notes will Appear Here</p>
    </>);
}


export default DashboardPage;