import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const apiService = {
  axiosInstance: axios.create({
    baseURL: API_URL,
  }),

  init: () => {
    console.log('Initializing ApiService');
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token found in localStorage, setting auth header');
      apiService.setAuthToken(token);
    } else {
      console.log('No token found in localStorage');
    }
  },

  setAuthToken: (token) => {
    if (token) {
      console.log('Setting auth token in headers and localStorage');
      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      apiService.axiosInstance.defaults.headers.common['Authorization'] = bearerToken;
      localStorage.setItem('token', token);
    } else {
      console.log('Removing auth token from headers and localStorage');
      delete apiService.axiosInstance.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  },

  getAuthToken: () => {
    const token = localStorage.getItem('token');
    console.log('Retrieved token from localStorage:', token ? 'Token exists' : 'No token found');
    return token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : null;
  },

  login: async (email, password) => {
    try {
      console.log('Attempting login for email:', email);
      const response = await apiService.axiosInstance.post('/auth/login', { username: email, password });
      console.log('Login response:', response.data);
      const { jwt } = response.data;
      if (jwt) {
        apiService.setAuthToken(jwt);
        console.log('Token set after successful login');
      } else {
        console.warn('No token received in login response');
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  fetchParkingSpaces: async () => {
    try {
      console.log('Fetching parking spaces...');
      const token = apiService.getAuthToken();
      if (!token) {
        console.error('No auth token found');
        throw new Error('No auth token found. Please log in again.');
      }
      console.log('Token found, ensuring auth header is set');
      apiService.setAuthToken(token);  // This will ensure the header is set with the correct format
      console.log('Making request to:', `${API_URL}/parkinglots/spaces`);
      const response = await apiService.axiosInstance.get('/parkinglots/spaces');
      console.log('Parking spaces response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching parking spaces:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  },
};

export default apiService;