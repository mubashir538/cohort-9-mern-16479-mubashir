import {useAuth} from '../context/AuthContext';

function DashboardPage(){
    const {user, logout} = useAuth();


    return (<>
    <h1>Dashboard</h1>
    <h2>Welcome {user?.name}</h2>
    <button onClick={logout}>Logout</button>
    <p>Your Notes will Appear Here</p>
    </>);
}


export default DashboardPage;