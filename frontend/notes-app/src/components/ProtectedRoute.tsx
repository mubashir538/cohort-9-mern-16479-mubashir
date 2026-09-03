import {Navigate} from 'react-router-dom';
import {type ReactNode} from 'react';
import {useAuth} from '../context/AuthContext';

function ProtectedRoute({children}: Readonly<{children: ReactNode}>){
    const {isAuthenticated,isLoading} = useAuth();

    if (isLoading) return <p>Loading...</p>;

    if(!isAuthenticated){
        return <Navigate to="/login" replace/>
    }
    return children;
}

export default ProtectedRoute;