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

  getAuthToken: () => {
    return localStorage.getItem('token');
  },

  register: async (email, password) => {
    try {
      const response = await apiService.axiosInstance.post('/auth/register', { email, password });
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiService.axiosInstance.post('/auth/login', { username: email, password });
      console.log('Login response:', response.data);
      const { jwt } = response.data;
      apiService.setAuthToken(jwt);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      throw error;
    }
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
      const token = apiService.getAuthToken();
      if (!token) {
        throw new Error('No auth token found');
      }
      apiService.setAuthToken(token);  // Ensure the token is set for this request
      const response = await apiService.axiosInstance.get('/parkinglots/spaces');
      return response.data;
    } catch (error) {
      console.error('Error fetching parking spaces:', error);
      throw error;
    }
  },

  // ... other methods ...
};

export default apiService;