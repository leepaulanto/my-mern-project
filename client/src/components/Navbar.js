import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Redirect to backend logout logic
    // Replace with your actual Public Port 5000 URL
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://zany-orbit-695jx597g79qfrjq5-5000.app.github.dev"; 
    window.open(`${backendUrl}/auth/logout`, "_self");
  };

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1rem 2rem', background: 'var(--card-bg)', borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)' }}>NeonVote</h2>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>Vote</Link>
          <Link to="/results" style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>Results</Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {user && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {user.name}
          </span>
        )}
        <button 
          onClick={handleLogout}
          className="btn"
          style={{ padding: '5px 15px', fontSize: '0.8rem', background: '#333', color: 'white' }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: 'flex', gap: '15px' }}>
           <Link to="/home" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
           <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Vote</Link>
           <Link to="/results" style={{ color: 'white', textDecoration: 'none' }}>Results</Link>
      </div>

    </nav>
  );
};

export default Navbar;