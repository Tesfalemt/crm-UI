import React, { useState } from 'react';
import './index.css';

function Inventory() {
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Oil Filter', quantity: 50, cost: 15 },
    { id: 2, name: 'Brake Pads', quantity: 30, cost: 40 },
    { id: 3, name: 'Air Filter', quantity: 40, cost: 20 },
    { id: 4, name: 'Spark Plugs', quantity: 100, cost: 5 },
  ]);

  const [newItem, setNewItem] = useState({ name: '', quantity: '', cost: '' });
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setInventory(inventory.map(item => 
        item.id === editingItem.id ? { ...item, ...newItem } : item
      ));
      setEditingItem(null);
    } else {
      setInventory(prev => [...prev, { id: Date.now(), ...newItem }]);
    }
    setIsModalOpen(false);
    setNewItem({ name: '', quantity: '', cost: '' });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setNewItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const totalItems = inventory.reduce((sum, item) => sum + parseInt(item.quantity), 0);
  const totalValue = inventory.reduce((sum, item) => sum + (parseInt(item.quantity) * parseFloat(item.cost)), 0);

  return (
    <div className="inventory">
      <h2>Inventory Management</h2>
      
      <div className="inventory-summary">
        <div className="summary-item">
          <h3>Total Items</h3>
          <p>{totalItems}</p>
        </div>
        <div className="summary-item">
          <h3>Total Value</h3>
          <p>${totalValue.toFixed(2)}</p>
        </div>
      </div>

      <h3>Current Inventory</h3>
      <button className="add-item-btn" onClick={() => {
        setEditingItem(null);
        setNewItem({ name: '', quantity: '', cost: '' });
        setIsModalOpen(true);
      }}>
        Add New Item
      </button>
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Quantity</th>
            <th>Cost per Unit</th>
            <th>Total Value</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>${parseFloat(item.cost).toFixed(2)}</td>
              <td>${(parseInt(item.quantity) * parseFloat(item.cost)).toFixed(2)}</td>
              <td>
                <button onClick={() => handleEdit(item)} style={{marginRight: '10px'}}>
                  Edit
                </button>
                <button onClick={() => handleDelete(item.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
            <form onSubmit={handleSubmit}>
              <input
                name="name"
                value={newItem.name}
                onChange={handleInputChange}
                placeholder="Item Name"
                required
              />
              <input
                name="quantity"
                type="number"
                value={newItem.quantity}
                onChange={handleInputChange}
                placeholder="Quantity"
                required
              />
              <input
                name="cost"
                type="number"
                step="0.01"
                value={newItem.cost}
                onChange={handleInputChange}
                placeholder="Cost per Unit"
                required
              />
              <button type="submit">
                {editingItem ? 'Update' : 'Add'} Item
              </button>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;