import React, { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import apiService from "./ApiService.js";
import { toast } from 'react-hot-toast';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const TermsAndConditions = ({ onAccept, onDecline }) => {
  const [accepted, setAccepted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (accepted) {
      onAccept();
    } else {
      alert("You must accept the terms and conditions to proceed.");
    }
  };

  return (
    <div className="terms-and-conditions">
      <h3>Parking Terms and Conditions</h3>
      <div className="terms-content" style={{maxHeight: '200px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', marginBottom: '10px'}}>
        <p>
          1. By booking a parking space, you agree to comply with all parking regulations and guidelines set forth by the facility.
          2. The parking fee is non-refundable once the booking is confirmed.
          3. The facility is not responsible for any damage to or theft of vehicles or their contents.
          4. Vehicles must be parked within the designated spaces and not obstruct other vehicles or pedestrian walkways.
          5. The facility reserves the right to tow vehicles that are improperly parked or left beyond the booked duration at the owner's expense.
          6. Users are responsible for remembering their assigned parking space number.
          7. The facility may close for maintenance or special events with advance notice to users.
          8. These terms and conditions may be updated periodically, and continued use of the parking facility constitutes acceptance of any changes.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          I have read and agree to the terms and conditions
        </label>
        <div>
          <button type="submit" className="action-button">Accept and Continue</button>
          <button type="button" className="action-button" onClick={onDecline}>Decline</button>
        </div>
      </form>
    </div>
  );
};

const UserInfoForm = ({ onSubmit }) => {
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    email: ''
  });

  const handleChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(userInfo);
  };

  return (
    <form onSubmit={handleSubmit} className="user-info-form">
      <input name="firstName" value={userInfo.firstName} onChange={handleChange} placeholder="First Name" required />
      <input name="lastName" value={userInfo.lastName} onChange={handleChange} placeholder="Last Name" required />
      <input name="phoneNumber" value={userInfo.phoneNumber} onChange={handleChange} placeholder="Phone Number" required />
      <input name="address" value={userInfo.address} onChange={handleChange} placeholder="Address" required />
      <input name="email" value={userInfo.email} onChange={handleChange} placeholder="Email" required type="email" />
      <button type="submit">Proceed to Payment</button>
    </form>
  );
};

const PaymentForm = ({ spaceNumber, userInfo, onPaymentSuccess, onSpaceBooked }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe.js has not loaded. Please try again.');
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    const {error, paymentMethod} = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.error('Error creating payment method:', error);
      setError(error.message);
      setProcessing(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }

      const response = await fetch(`${API_URL}/api/payment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          paymentMethodId: paymentMethod.id, 
          spaceNumber: spaceNumber,
          userInfo: userInfo,
          amount: 1000 // 1000 cents = $10.00
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      await updateSpaceStatus(spaceNumber, "Booked");
      onPaymentSuccess(result);
      onSpaceBooked(spaceNumber);
    } catch (err) {
      console.error('Payment error:', err);
      setError(`Payment failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const updateSpaceStatus = async (spaceNumber, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }

      const response = await fetch(`${API_URL}/api/parkinglots/spaces/${spaceNumber}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Space status updated:', result);
    } catch (error) {
      console.error('Error updating space status:', error);
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h3>Payment Details</h3>
      <p>This is a test mode. Please use these test card numbers:</p>
      <ul>
        <li>Success: 4242 4242 4242 4242</li>
        <li>Failure: 4000 0000 0000 0002</li>
      </ul>
      <div className="card-element">
        <CardElement />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={!stripe || processing}>
        {processing ? 'Processing...' : 'Pay for Monthly Parking'}
      </button>
    </form>
  );
};

  
const ParkingLotInfo = ({ location, pricing }) => {
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchParkingSpaces();
  }, []);

  const fetchParkingSpaces = async () => {
    try {
      const spaces = await apiService.fetchParkingSpaces();
      setParkingSpaces(spaces);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching parking spaces:', error);
      setError('Failed to load parking spaces. Please try again later.');
      setIsLoading(false);
      toast.error('Error loading parking spaces');
    }
  };

  const handleSpaceClick = (spaceId) => {
    setSelectedSpace(spaceId);
    setShowTerms(false);
    setShowUserForm(false);
    setShowPaymentForm(false);
    setUserInfo(null);
  };

  const handleBookNow = () => {
    setShowTerms(true);
  };

  const handleTermsAccept = () => {
    setShowTerms(false);
    setShowUserForm(true);
  };

  const handleTermsDecline = () => {
    setShowTerms(false);
    alert("You must accept the terms and conditions to book a parking space.");
  };

  const handleUserInfoSubmit = (info) => {
    setUserInfo(info);
    setShowUserForm(false);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedSpace(null);
    setUserInfo(null);
    fetchParkingSpaces(); // Refresh the parking spaces after successful payment
  };

  const renderParkingRow = (start, end) => {
    return (
      <div className="parking-column">
        {parkingSpaces.slice(start, end + 1).map((space) => (
          <div
            key={space.id}
            className={`unit ${space.status === 'Available' ? 'available' : 'booked'} ${selectedSpace === space.id ? 'selected' : ''}`}
            onClick={() => handleSpaceClick(space.id)}
            title={`Space ${space.spaceNumber}`}
          >
            {space.spaceNumber}
          </div>
        ))}
      </div>
    );
  };

  const selectedSpaceDetails = selectedSpace ? parkingSpaces.find(space => space.id === selectedSpace) : null;

  return (
    <div className="parking-lot-info">
      {isLoading ? (
        <div>Loading parking spaces...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <h2>{location} Parking Lot</h2>
          <div className="parking-lot-container">
            <div className="parking-lot">
              {renderParkingRow(0, 19)}
              <div className="road"></div>
              {renderParkingRow(20, 39)}
              <div className="road"></div>
              {renderParkingRow(40, 59)}
              <div className="road"></div>
              {renderParkingRow(60, 79)}
            </div>
          </div>
          
          <div className="parking-info">
            <p><strong>Available Spaces:</strong> {parkingSpaces.filter(space => space.status === 'Available').length}</p>
            <p><strong>Booked Spaces:</strong> {parkingSpaces.filter(space => space.status !== 'Available').length}</p>
            <p><strong>Pricing:</strong> {pricing}</p>
          </div>
          {selectedSpaceDetails && (
            <div className="space-details">
              <h3>Space {selectedSpaceDetails.spaceNumber}</h3>
              <p>Status: {selectedSpaceDetails.status}</p>
              {selectedSpaceDetails.status === 'Available' && !showTerms && !showUserForm && !showPaymentForm && (
                <button className="action-button" onClick={handleBookNow}>
                  Book Now
                </button>
              )}
              {showTerms && (
                <TermsAndConditions 
                  onAccept={handleTermsAccept}
                  onDecline={handleTermsDecline}
                />
              )}
              {showUserForm && (
                <div className="payment-form-container">
                  <h3>User Information</h3>
                  <UserInfoForm onSubmit={handleUserInfoSubmit} />
                </div>
              )}
              {showPaymentForm && userInfo && (
                <div className="payment-form-container">
                  <Elements stripe={stripePromise}>
                    <PaymentForm 
                      spaceNumber={selectedSpaceDetails.spaceNumber}
                      userInfo={userInfo}
                      onPaymentSuccess={handlePaymentSuccess} 
                      onSpaceBooked={fetchParkingSpaces} 
                    />
                  </Elements>
                </div>
              )}
              {selectedSpaceDetails.status !== 'Available' && (
                <button className="action-button">Join Waitlist</button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ParkingLotInfo;