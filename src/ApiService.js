import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const apiService = {
  axiosInstance: axios.create({
    baseURL: API_URL,
  }),

  init: () => {
    // If there's any initialization needed, put it here
    console.log('ApiService initialized');
    const token = localStorage.getItem('token');
    if (token) {
      apiService.setAuthToken(token);
    }
  },
  setAuthToken: (token) => {
    if (token) {
      apiService.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete apiService.axiosInstance.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiService.axiosInstance.post('/auth/login', { username: email, password });
      console.log('Login response:', response.data);
      const { token } = response.data;
      apiService.setAuthToken(token);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  register: async (email, username, password) => {
    try {
      const response = await apiService.axiosInstance.post('/auth/register', { email, username, password });
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  getAuthToken: () => {
    return localStorage.getItem('token');
  },
  logout: () => {
    apiService.setAuthToken(null);
  },

  handleError: (error) => {
    if (error.response) {
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response.data);
      throw new Error(error.response.data.message || `Request failed with status ${error.response.status}. ${error.response.data}`);
    } else if (error.request) {
      console.error('Error request:', error.request);
      throw new Error('No response from server. Please try again later.');
    } else {
      console.error('Error:', error.message);
      throw new Error('An error occurred. Please try again.');
    }
  },

  fetchParkingSpaces: async () => {
    try {
      console.log('Fetching parking spaces...');
      const token = apiService.getAuthToken();
      if (!token) {
        console.error('No auth token found');
        throw new Error('No auth token found');
      }
      console.log('Token found, setting auth header');
      apiService.setAuthToken(token);
      console.log('Making request to:', `${API_URL}/parkinglots/spaces`);
      const response = await apiService.axiosInstance.get('/parkinglots/spaces');
      console.log('Response received:', response);
      return response.data;
    } catch (error) {
      console.error('Error in fetchParkingSpaces:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      throw error;
    }
  },
};

export default apiService;