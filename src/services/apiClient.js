
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://amelieapp.alwaysdata.net/api', 
  headers: {
    'Content-Type': 'application/json',
    
  },
});

export default apiClient;
