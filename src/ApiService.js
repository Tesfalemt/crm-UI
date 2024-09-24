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

  setupInterceptors: () => {
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
  addVehicle: async (vehicleData) => {
    try {
      const token = localStorage.getItem('token'); // Ensure you're storing the token in localStorage after login
      if (token) {
        apiService.setAuthToken(token);
      }
      const response = await apiService.axiosInstance.post('/vehicles', vehicleData);
      return response.data;
    } catch (error) {
      console.error('Error in addVehicle:', error.response);
      throw error;
    }
  },
  getVehicleByVin: async (vin) => {
    try {
      apiService.ensureToken();
      const response = await apiService.axiosInstance.get(`${API_URL}/vehicles/vin/${vin}`);
      return response.data;
    } catch (error) {
      return apiService.handleApiError(error);
    }
  },

  updateVehicleMileage: async (plateNumber, newMileage) => {
    try {
      apiService.ensureToken();
      const response = await apiService.axiosInstance.patch(`${API_URL}/vehicles/${plateNumber}/mileage?newMileage=${newMileage}`);
      return response.data;
    } catch (error) {
      return apiService.handleApiError(error);
    }
  },
  registerUser: async (userData) => {
    try {
      console.log('Sending registration request with data:', userData);
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Raw server response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        if (response.ok) {
          return { message: 'User registered successfully' };
        } else {
          throw new Error(`Server response is not valid JSON: ${responseText}`);
        }
      }

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  registerUserByAdmin: async (userData, token) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData || 'Admin registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Admin registration error:', error);
      throw error;
    }
  },
  registerUserWithPayment: async function(userData) {
    try {
      console.log('Sending request to:', `${API_URL}/auth/register`);
      console.log('Request payload:', userData);
      const response = await this.axiosInstance.post('/auth/register', userData);
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in registerUserWithPayment:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      throw error;
    }
  },

  updateUserWithPayment: async function(userId, userData) {
    try {
      const response = await this.axiosInstance.put(`/auth/update/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error in updateUserWithPayment:', error);
      throw error;
    }
  },

  deleteUser: async function(userId) {
    try {
      const response = await this.axiosInstance.delete(`/auth/delete/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  },
  getAllTransactions: async () => {
    try {
      apiService.ensureToken();
      const response = await apiService.axiosInstance.get('/transactions');
      return response.data;
    } catch (error) {
      return apiService.handleApiError(error);
    }
  },

  addTransaction: async (transactionData) => {
    try {
      apiService.ensureToken();
      const response = await apiService.axiosInstance.post('/transactions', transactionData);
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