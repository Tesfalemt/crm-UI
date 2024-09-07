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
    apiService.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshedToken = await apiService.refreshToken();
            apiService.setAuthToken(refreshedToken);
            originalRequest.headers['Authorization'] = `Bearer ${refreshedToken}`;
            return apiService.axiosInstance(originalRequest);
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            apiService.setAuthToken(null);
            // Redirect to login page or handle as needed
            throw refreshError;
          }
        }
        return Promise.reject(error);
      }
    );
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

  ensureToken: () => {
    const token = apiService.getAuthToken();
    if (!token) {
      throw new Error('No auth token found. Please log in again.');
    }
    apiService.setAuthToken(token);
  },

  handleApiError: (error) => {
    console.error('API Error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  },

  registerUser: async (userInfo) => {
    try {
      apiService.ensureToken();
      const response = await apiService.axiosInstance.post('/auth/register', userInfo);
      return response.data;
    } catch (error) {
      return apiService.handleApiError(error);
    }
  },

  searchUsers: async (email) => {
    try {
      apiService.ensureToken();
      const response = await apiService.axiosInstance.get(`/users/search?email=${email}`);
      return response.data;
    } catch (error) {
      return apiService.handleApiError(error);
    }
  },

  checkAdminStatus: async () => {
    try {
      apiService.ensureToken();
      const response = await apiService.axiosInstance.get('/auth/check-admin');
      return response.data.isAdmin;
    } catch (error) {
      return apiService.handleApiError(error);
    }
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
      return apiService.handleApiError(error);
    }
  },

  fetchParkingSpaces: async () => {
    try {
      console.log('Fetching parking spaces...');
      apiService.ensureToken();
      console.log('Making request to:', `${API_URL}/parkinglots/spaces`);
      const response = await apiService.axiosInstance.get('/parkinglots/spaces');
      console.log('Parking spaces response received:', response.data);
      return response.data;
    } catch (error) {
      return apiService.handleApiError(error);
    }
  },
  refreshToken: async () => {
    const currentToken = apiService.getAuthToken();
    if (!currentToken) {
      throw new Error('No token to refresh');
    }
    try {
      const response = await apiService.axiosInstance.post('/auth/refresh', {}, {
        headers: { 'Authorization': currentToken }
      });
      return response.data.jwt;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  },
};

export default apiService;