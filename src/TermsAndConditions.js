import React, { useState } from 'react';

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
      <div className="terms-content" style={{ maxHeight: '200px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
        <p>Terms and conditions content...</p>
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

export default TermsAndConditions;
