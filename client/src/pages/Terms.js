// client/src/pages/Terms.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ paddingTop: '50px' }}>
      <div className="card">
        <h1>Terms of <span style={{ color: 'var(--primary)' }}>Service</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Last Updated: December 2025</p>
        
        <h3>1. Voting Eligibility</h3>
        <p>To participate, users must authenticate via Google, LinkedIn, or a verified local account.</p>

        <h3>2. One-Vote Policy</h3>
        <p>Strict "One-person, one-vote" logic is enforced. Duplicate accounts or fraud attempts will result in a ban.</p>

        <h3>3. Data Privacy</h3>
        <p>Your name and LinkedIn profile will be displayed in the public voter registry after you cast your vote.</p>
        
        <button className="btn btn-primary" onClick={() => navigate(-1)} style={{ marginTop: '20px' }}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Terms;