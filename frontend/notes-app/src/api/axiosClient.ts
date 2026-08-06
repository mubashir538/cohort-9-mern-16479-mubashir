import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.BACKEND_URL,
    headers : {
        'Content-Type': 'application/json'
    },
withCredentials: true

});


export default axiosClient;