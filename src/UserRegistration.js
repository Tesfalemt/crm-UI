import React, { useState } from 'react';
import apiService from './ApiService';
import { toast } from 'react-hot-toast';

const UserRegistration = () => {
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.registerUser(userInfo);
      toast.success('User registered successfully');
      setUserInfo({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        email: '',
        password: ''
      });
    } catch (error) {
      toast.error(`Failed to register user: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-registration-form">
      <h3>Register New User</h3>
      <input name="firstName" value={userInfo.firstName} onChange={handleChange} placeholder="First Name" required />
      <input name="lastName" value={userInfo.lastName} onChange={handleChange} placeholder="Last Name" required />
      <input name="phoneNumber" value={userInfo.phoneNumber} onChange={handleChange} placeholder="Phone Number" required />
      <input name="address" value={userInfo.address} onChange={handleChange} placeholder="Address" required />
      <input name="email" value={userInfo.email} onChange={handleChange} placeholder="Email" required type="email" />
      <input name="password" value={userInfo.password} onChange={handleChange} placeholder="Password" required type="password" />
      <button type="submit">Register User</button>
    </form>
  );
};

export default UserRegistration;