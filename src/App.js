import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ParkingLotInfo from './ParkingLotInfo';
import ManageLots from './ManageLots';
import Reports from './Reports';
import Settings from './Settings';
import Garage from './Garage';
import Inventory from './Inventory';
import Login from './Login';
import { AuthProvider, useAuth } from './AuthContext';
import apiService from "./ApiService";

function AppContent() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    apiService.init();
    const token = apiService.getAuthToken();
    if (token) {
      setIsAuthenticated(true);
    }
  }, [setIsAuthenticated]);
  
  
  const [parkingLotData] = React.useState({
    location: "123 Main Street",
    availableSpaces: Array.from({length: 40}, (_, i) => i * 2 + 1),
    bookedSpaces: Array.from({length: 40}, (_, i) => (i * 2 + 2)),
    pricing: "$10/hour"
  });
  
  const [revenueData] = React.useState({
    January: 5000, February: 6000, March: 7500, April: 8000,
    May: 9000, June: 10000, July: 11000, August: 10500,
    September: 9500, October: 8500, November: 7000, December: 8000
  });

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, [setIsAuthenticated]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="App">
      {isAuthenticated && (
        <header className="app-header">
          <h1>ParkEase Management</h1>
          <nav>
            <button onClick={() => handleNavigation('/dashboard')}>Dashboard</button>
            <button onClick={() => handleNavigation('/garage')}>Garage</button>
            <button onClick={() => handleNavigation('/inventory')}>Inventory</button>
            <button onClick={() => handleNavigation('/manage-lots')}>Manage Lots</button>
            <button onClick={() => handleNavigation('/reports')}>Reports</button>
            <button onClick={() => handleNavigation('/settings')}>Settings</button>
            <button onClick={handleLogout}>Logout</button>
          </nav>
        </header>
      )}
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <ParkingLotInfo /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/garage" 
            element={isAuthenticated ? <Garage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/inventory" 
            element={isAuthenticated ? <Inventory /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/manage-lots" 
            element={isAuthenticated ? <ManageLots /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/reports" 
            element={isAuthenticated ? <Reports /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/settings" 
            element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </main>
      <footer>
        <p>&copy; 2023 ParkEase Management. All rights reserved.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;