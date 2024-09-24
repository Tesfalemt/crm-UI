import React, { useState, useEffect } from 'react';
import './index.css';
import apiService from './ApiService';
import { toast } from 'react-hot-toast';

function Garage() {
  const [transactions, setTransactions] = useState([]);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isCarSearchModalOpen, setIsCarSearchModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vinError, setVinError] = useState('');
  const [newTransaction, setNewTransaction] = useState({
    plateNumber: '',
    serviceDescription: '',
    parts: '',
    cost: '',
    total: ''
  });
  const [newVehicle, setNewVehicle] = useState({
    vin: '',
    plateNumber: '',
    mileage: '',
    ownerEmail: ''
  });
  const [searchVin, setSearchVin] = useState('');
  const [searchedCar, setSearchedCar] = useState(null);
  const [newMileage, setNewMileage] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTransactions = await apiService.getAllTransactions();
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transactions. Please try again later.');
      toast.error('Failed to fetch transactions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({ ...prev, [name]: value }));
  };

  const handleVehicleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle(prev => ({ ...prev, [name]: value }));
  };

  // VIN validation function
  const validateVIN = (vin) => {
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    return vinRegex.test(vin);
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateVIN(newVehicle.vin)) {
      setVinError('Invalid VIN number. Please ensure it is a 17-character alphanumeric code without I, O, or Q.');
      return;
    }
  
    setVinError('');
    setIsLoading(true);
    setError(null);
    try {
      const savedVehicle = await apiService.addVehicle(newVehicle);
      setIsVehicleModalOpen(false);
      setNewVehicle({ vin: '', plateNumber: '', mileage: '', ownerEmail: '' });
      toast.success('Vehicle added successfully!');
    } catch (error) {
      console.error('Error adding vehicle:', error);
      if (error.response && error.response.status === 403) {
        setError('You do not have permission to add a vehicle. Please check your login status.');
        toast.error('Permission denied. Please log in again.');
      } else {
        setError('Failed to add vehicle. Please try again.');
        toast.error('Failed to add vehicle. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const savedTransaction = await apiService.addTransaction(newTransaction);
      setTransactions(prev => [...prev, savedTransaction]);
      setIsTransactionModalOpen(false);
      setNewTransaction({ plateNumber: '', serviceDescription: '', parts: '', cost: '', total: '' });
      toast.success('Transaction added successfully!');
    } catch (error) {
      console.error('Error adding transaction:', error);
      setError('Failed to add transaction. Please try again.');
      toast.error('Failed to add transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCarSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const car = await apiService.getVehicleByVin(searchVin);
      setSearchedCar(car);
      setNewMileage(car.mileage.toString());
    } catch (error) {
      console.error('Error searching for car:', error);
      setError('Failed to find car. Please check the VIN and try again.');
      toast.error('Failed to find car. Please check the VIN and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMileageUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const currentMileage = parseInt(searchedCar.mileage);
    const newMileageValue = parseInt(newMileage);

    if (newMileageValue <= currentMileage) {
      setError(`New mileage (${newMileageValue}) must be greater than the current mileage (${currentMileage}).`);
      toast.error(`New mileage must be greater than ${currentMileage}.`);
      setIsLoading(false);
      return;
    }

    try {
      await apiService.updateVehicleMileage(searchedCar.plateNumber, newMileageValue);
      toast.success('Vehicle mileage updated successfully!');
      setIsCarSearchModalOpen(false);
      setSearchVin('');
      setSearchedCar(null);
      setNewMileage('');
    } catch (error) {
      console.error('Error updating mileage:', error);
      if (error.response && error.response.status === 400) {
        setError(error.response.data || 'Failed to update mileage. Please check the mileage value.');
        toast.error(error.response.data || 'Failed to update mileage. Please check the mileage value.');
      } else {
        setError('An unexpected error occurred. Please try again.');
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const totalTransactions = transactions.length;
  const totalRevenue = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.total), 0);

  if (isLoading && transactions.length === 0) {
    return <div className="loading">Loading transactions...</div>;
  }

  if (error && transactions.length === 0) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={fetchTransactions}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="garage">
      <h2>Garage Overview</h2>
      <div className="garage-summary">
        <div className="summary-item">
          <h3>Total Transactions</h3>
          <p>{totalTransactions}</p>
        </div>
        <div className="summary-item">
          <h3>Total Revenue</h3>
          <p>${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="add-transaction-btn" 
          onClick={() => setIsTransactionModalOpen(true)}
          disabled={isLoading}
        >
          Add Transaction
        </button>
        <button 
          className="action-button" 
          onClick={() => setIsVehicleModalOpen(true)}
          disabled={isLoading}
        >
          Add Vehicle
        </button>
        <button 
          className="action-button" 
          onClick={() => setIsCarSearchModalOpen(true)}
          disabled={isLoading}
        >
          Search Car & Update Mileage
        </button>
      </div>

      <h3>Recent Transactions</h3>
      {transactions.length > 0 ? (
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Plate Number</th>
              <th>Service Description</th>
              <th>Parts</th>
              <th>Cost</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction.id}>
                <td>{transaction.plateNumber}</td>
                <td>{transaction.serviceDescription}</td>
                <td>{transaction.parts}</td>
                <td>${parseFloat(transaction.cost).toFixed(2)}</td>
                <td>${parseFloat(transaction.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No transactions found. Add a new transaction to get started.</p>
      )}

      {isTransactionModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Transaction</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleTransactionSubmit}>
              <input name="plateNumber" value={newTransaction.plateNumber} onChange={handleTransactionInputChange} placeholder="Plate Number" required />
              <input name="serviceDescription" value={newTransaction.serviceDescription} onChange={handleTransactionInputChange} placeholder="Service Description" required />
              <input name="parts" value={newTransaction.parts} onChange={handleTransactionInputChange} placeholder="Parts" required />
              <input name="cost" type="number" value={newTransaction.cost} onChange={handleTransactionInputChange} placeholder="Cost" required />
              <input name="total" type="number" value={newTransaction.total} onChange={handleTransactionInputChange} placeholder="Total" required />
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Transaction'}
              </button>
              <button type="button" onClick={() => setIsTransactionModalOpen(false)} disabled={isLoading}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {isVehicleModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Vehicle</h2>
            {vinError && <p className="error-message">{vinError}</p>}
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleVehicleSubmit}>
              <input name="vin" value={newVehicle.vin} onChange={handleVehicleInputChange} placeholder="VIN" required />
              <input name="plateNumber" value={newVehicle.plateNumber} onChange={handleVehicleInputChange} placeholder="Plate Number" required />
              <input name="mileage" type="number" value={newVehicle.mileage} onChange={handleVehicleInputChange} placeholder="Mileage" required />
              <input name="ownerEmail" type="email" value={newVehicle.ownerEmail} onChange={handleVehicleInputChange} placeholder="Owner Email" required />
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Vehicle'}
              </button>
              <button type="button" onClick={() => setIsVehicleModalOpen(false)} disabled={isLoading}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {isCarSearchModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Search Car & Update Mileage</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleCarSearch}>
              <input 
                type="text" 
                value={searchVin} 
                onChange={(e) => setSearchVin(e.target.value)} 
                placeholder="Enter VIN" 
                required 
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </form>
            {searchedCar && (
              <div className="car-details">
                <h3>Car Details</h3>
                <p>VIN: {searchedCar.vin}</p>
                <p>Plate Number: {searchedCar.plateNumber}</p>
                <p>Current Mileage: {searchedCar.mileage}</p>
                <form onSubmit={handleMileageUpdate}>
                  <input 
                    type="number" 
                    value={newMileage} 
                    onChange={(e) => setNewMileage(e.target.value)} 
                    placeholder="Enter new mileage" 
                    required 
                  />
                  <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update Mileage'}
                  </button>
                </form>
              </div>
            )}
            <button type="button" onClick={() => setIsCarSearchModalOpen(false)} disabled={isLoading}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Garage;