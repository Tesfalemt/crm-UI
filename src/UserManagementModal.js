import React, { useState, useEffect } from 'react';
import apiService from './ApiService';
import { toast } from 'react-hot-toast';

const UserManagementModal = ({ mode, user, onClose, onSubmit }) => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (user && (mode === 'edit' || mode === 'delete')) {
      setUserData(user);
    }
  }, [user, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsSuccess(false);
    try {
      let result;
      switch (mode) {
        case 'add':
          result = await apiService.registerUser(userData);
          setMessage(`User ${userData.username} has been successfully added!`);
          setIsSuccess(true);
          toast.success(`User ${userData.username} has been successfully added!`);
          break;
        case 'edit':
          result = await apiService.updateUser(userData.id, userData);
          setMessage(`User ${userData.username} has been successfully updated!`);
          setIsSuccess(true);
          toast.success(`User ${userData.username} has been successfully updated!`);
          break;
        case 'delete':
          result = await apiService.deleteUser(userData.id);
          setMessage(`User has been successfully deleted!`);
          setIsSuccess(true);
          toast.success(`User has been successfully deleted!`);
          break;
        default:
          throw new Error('Invalid mode');
      }
      onSubmit(result);
      setTimeout(() => onClose(), 3000); // Close modal after 3 seconds
    } catch (error) {
      console.error('Error in user management:', error);
      setMessage(`Failed to ${mode} user: ${error.message}`);
      setIsSuccess(false);
      toast.error(`Failed to ${mode} user: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header flex justify-between items-center mb-4 pb-2 border-b">
          <h2 className="text-xl font-bold">
            {mode === 'add' ? 'Add User' : mode === 'edit' ? 'Edit User' : 'Delete User'}
          </h2>
          <div className="flex space-x-2">
            <button 
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : mode === 'add' ? 'Add' : mode === 'edit' ? 'Update' : 'Delete'}
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
        {message && (
          <div className={`message p-4 mb-4 rounded ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
        {mode !== 'delete' && !isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="firstName"
              value={userData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              required
              className="w-full px-3 py-2 border rounded"
            />
            <input
              name="lastName"
              value={userData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              required
              className="w-full px-3 py-2 border rounded"
            />
            <input
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              type="email"
              className="w-full px-3 py-2 border rounded"
            />
            <input
              name="phoneNumber"
              value={userData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              required
              className="w-full px-3 py-2 border rounded"
            />
            <input
              name="address"
              value={userData.address}
              onChange={handleChange}
              placeholder="Address"
              required
              className="w-full px-3 py-2 border rounded"
            />
            <input
              name="username"
              value={userData.username}
              onChange={handleChange}
              placeholder="Username"
              required
              className="w-full px-3 py-2 border rounded"
            />
            {mode === 'add' && (
              <input
                name="password"
                value={userData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                type="password"
                className="w-full px-3 py-2 border rounded"
              />
            )}
          </form>
        ) : (
          <p className="text-center my-4">
            {mode === 'delete' ? 'Are you sure you want to delete this user?' : ''}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserManagementModal;