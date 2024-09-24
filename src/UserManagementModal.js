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
    cardNumber: '',
    expirationDate: '',
    cvv: '',
    billingAddress: '',
    driverLicense: '',
    driverLicenseExpiration: '',
    insurance: '',
    numberOfVehicles: 0,
    vehicles: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (user && (mode === 'edit' || mode === 'delete')) {
      setUserData(user);
    }
  }, [user, mode]);

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'numberOfVehicles') {
      const vehicles = Array(parseInt(value)).fill().map(() => ({ registration: '', plateNumber: '' }));
      setUserData(prevData => ({ ...prevData, [name]: value, vehicles }));
    } else {
      setUserData(prevData => ({ ...prevData, [name]: value }));
    }
  };

  const handleVehicleChange = (index, field, value) => {
    const updatedVehicles = [...userData.vehicles];
    updatedVehicles[index][field] = value;
    setUserData(prevData => ({ ...prevData, vehicles: updatedVehicles }));
  };

  const validateCardNumber = (cardNumber) => {
    // Remove any non-digit characters
    const cleanedNumber = cardNumber.replace(/\D/g, '');
    
    // Check if the number is between 13 and 19 digits
    if (cleanedNumber.length < 13 || cleanedNumber.length > 19) {
      return false;
    }
  
    // Implement Luhn algorithm
    let sum = 0;
    let isEven = false;
    for (let i = cleanedNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanedNumber.charAt(i), 10);
  
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
  
      sum += digit;
      isEven = !isEven;
    }
  
    return (sum % 10) === 0;
  };

  const validateExpirationDate = (expirationDate) => {
    const regex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    if (!regex.test(expirationDate)) return false;

    const [month, year] = expirationDate.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    return (
      parseInt(year, 10) > currentYear ||
      (parseInt(year, 10) === currentYear && parseInt(month, 10) >= currentMonth)
    );
  };

  const validateCVV = (cvv) => {
    const regex = /^[0-9]{3,4}$/;
    return regex.test(cvv);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsSuccess(false);

    if (!validateCardNumber(userData.cardNumber)) {
      setMessage('Invalid card number');
      setIsSuccess(false);
      setIsLoading(false);
      toast.error('Invalid card number');
      return;
    }

    if (!validateExpirationDate(userData.expirationDate)) {
      setMessage('Invalid expiration date');
      setIsSuccess(false);
      setIsLoading(false);
      toast.error('Invalid expiration date');
      return;
    }

    if (!validateCVV(userData.cvv)) {
      setMessage('Invalid CVV');
      setIsSuccess(false);
      setIsLoading(false);
      toast.error('Invalid CVV');
      return;
    }
    try {
      let result;
      switch (mode) {
        case 'add':
          result = await apiService.registerUserWithPayment(userData);
          setMessage(`User ${userData.username} has been successfully added with payment information!`);
          setIsSuccess(true);
          toast.success(`User ${userData.username} has been successfully added with payment information!`);
          break;
        case 'edit':
          result = await apiService.updateUserWithPayment(userData.id, userData);
          setMessage(`User ${userData.username} has been successfully updated with payment information!`);
          setIsSuccess(true);
          toast.success(`User ${userData.username} has been successfully updated with payment information!`);
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
      setTimeout(() => onClose(), 3000);
    } catch (error) {
      console.error('Error in user management:', error);
      setMessage(`Failed to ${mode} user: ${error.message}`);
      setIsSuccess(false);
      toast.error(`Failed to ${mode} user: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <>
            <input className="user-management-input" name="firstName" value={userData.firstName} onChange={handleChange} placeholder="First Name" required />
            <input className="user-management-input" name="lastName" value={userData.lastName} onChange={handleChange} placeholder="Last Name" required />
            <input className="user-management-input" name="email" type="email" value={userData.email} onChange={handleChange} placeholder="Email" required />
            <input className="user-management-input" name="phoneNumber" value={userData.phoneNumber} onChange={handleChange} placeholder="Phone Number" required />
            <input className="user-management-input" name="address" value={userData.address} onChange={handleChange} placeholder="Address" required />
            <input className="user-management-input" name="username" value={userData.username} onChange={handleChange} placeholder="Username" required />
            {mode === 'add' && <input className="user-management-input" name="password" type="password" value={userData.password} onChange={handleChange} placeholder="Password" required />}
          </>
        );
      case 'payment':
        return (
          <>
            <input className="user-management-input" name="cardNumber" value={userData.cardNumber} onChange={handleChange} placeholder="Card Number" required />
            <input className="user-management-input" name="expirationDate" value={userData.expirationDate} onChange={handleChange} placeholder="Expiration Date (MM/YY)" required />
            <input className="user-management-input" name="cvv" type="password" value={userData.cvv} onChange={handleChange} placeholder="CVV" required />
            <input className="user-management-input" name="billingAddress" value={userData.billingAddress} onChange={handleChange} placeholder="Billing Address" required />
          </>
        );
      case 'license':
        return (
          <>
            <input className="user-management-input" name="driverLicense" value={userData.driverLicense} onChange={handleChange} placeholder="Driver's License Number" required />
            <input className="user-management-input" name="driverLicenseExpiration" type="date" value={userData.driverLicenseExpiration} onChange={handleChange} placeholder="Driver's License Expiration" required />
            <input className="user-management-input" name="insurance" value={userData.insurance} onChange={handleChange} placeholder="Insurance Information" required />
          </>
        );
      case 'vehicles':
        return (
          <>
            <input className="user-management-input" name="numberOfVehicles" type="number" min="0" value={userData.numberOfVehicles} onChange={handleChange} placeholder="Number of Vehicles" />
            {userData.vehicles.map((vehicle, index) => (
              <div key={index} className="user-management-vehicle-inputs">
                <input className="user-management-input" value={vehicle.registration} onChange={(e) => handleVehicleChange(index, 'registration', e.target.value)} placeholder={`Vehicle ${index + 1} Registration`} required />
                <input className="user-management-input" value={vehicle.plateNumber} onChange={(e) => handleVehicleChange(index, 'plateNumber', e.target.value)} placeholder={`Vehicle ${index + 1} Plate Number`} required />
              </div>
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="user-management-modal" onClick={onClose}>
      <div className="user-management-content" onClick={e => e.stopPropagation()}>
        <div className="user-management-header">
          <h3>{mode === 'add' ? 'Add New User' : mode === 'edit' ? 'Edit User' : 'Delete User'}</h3>
        </div>
        {mode !== 'delete' && !isSuccess && (
          <form onSubmit={handleSubmit} className="user-management-form">
            <div className="user-management-tabs">
              <button type="button" className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>Personal</button>
              <button type="button" className={`tab-button ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => setActiveTab('payment')}>Payment</button>
              <button type="button" className={`tab-button ${activeTab === 'license' ? 'active' : ''}`} onClick={() => setActiveTab('license')}>License</button>
              <button type="button" className={`tab-button ${activeTab === 'vehicles' ? 'active' : ''}`} onClick={() => setActiveTab('vehicles')}>Vehicles</button>
            </div>
            <div className="user-management-tab-content">
              {renderTabContent()}
            </div>
            <button type="submit" className="user-management-button" disabled={isLoading}>
              {isLoading ? 'Processing...' : mode === 'add' ? 'Add User' : 'Update User'}
            </button>
          </form>
        )}
        {mode === 'delete' && (
          <p className="user-management-message">Are you sure you want to delete this user?</p>
        )}
        {message && (
          <div className={`user-management-message ${isSuccess ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementModal;