
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://cobalto.alwaysdata.net/api', 
  headers: {
    'Content-Type': 'application/json',
    
  },
});

export default apiClient;
