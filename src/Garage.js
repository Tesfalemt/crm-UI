import React, { useState } from 'react';
import './index.css';

function Garage() {
  const [transactions, setTransactions] = useState([
    { id: 1, plateNumber: 'ABC123', serviceDescription: 'Oil Change', parts: 'Oil Filter', cost: 50, total: 75 },
    { id: 2, plateNumber: 'XYZ789', serviceDescription: 'Brake Repair', parts: 'Brake Pads', cost: 100, total: 150 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    plateNumber: '',
    serviceDescription: '',
    parts: '',
    cost: '',
    total: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTransactions(prev => [...prev, { id: Date.now(), ...newTransaction }]);
    setIsModalOpen(false);
    setNewTransaction({ plateNumber: '', serviceDescription: '', parts: '', cost: '', total: '' });
  };

  const totalTransactions = transactions.length;
  const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.total, 0);

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
          <p>${totalRevenue}</p>
        </div>
      </div>

      <h3>Recent Transactions</h3>
      <button className="add-transaction-btn" onClick={() => setIsModalOpen(true)}>Add Transaction</button>
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
              <td>${transaction.cost}</td>
              <td>${transaction.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Transaction</h2>
            <form onSubmit={handleSubmit}>
              <input name="plateNumber" value={newTransaction.plateNumber} onChange={handleInputChange} placeholder="Plate Number" required />
              <input name="serviceDescription" value={newTransaction.serviceDescription} onChange={handleInputChange} placeholder="Service Description" required />
              <input name="parts" value={newTransaction.parts} onChange={handleInputChange} placeholder="Parts" required />
              <input name="cost" type="number" value={newTransaction.cost} onChange={handleInputChange} placeholder="Cost" required />
              <input name="total" type="number" value={newTransaction.total} onChange={handleInputChange} placeholder="Total" required />
              <button type="submit">Add Transaction</button>
              <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Garage;