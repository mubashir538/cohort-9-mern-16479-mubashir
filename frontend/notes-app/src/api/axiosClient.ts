import axios from 'axios';


const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

if(!baseURL){
    throw new Error('Vite backend url not configured');
}

const axiosClient = axios.create({
    baseURL: baseURL,
    headers : {
        'Content-Type': 'application/json'
    },
withCredentials: true

});


export default axiosClient;