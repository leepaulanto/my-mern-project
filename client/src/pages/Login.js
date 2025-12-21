import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const backendUrl = "https://zany-orbit-695jx597g79qfrjq5-5000.app.github.dev";

const handleSubmit = async (e) => {
  e.preventDefault();
  const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
  try {
    const res = await axios.post(`${backendUrl}${endpoint}`, formData, { withCredentials: true });
    
    // Success: Show the message from the backend
    alert(res.data.message); 
    
    if(!isSignup) {
      // Logic for Login success
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = "/dashboard";
    } else {
      setIsSignup(false); // Move user to Login screen after signup
    }
  } catch (err) {
    // THE FIX: Check for the error message properly
    const errorMsg = err.response?.data?.error || "Something went wrong";
    alert(errorMsg);
  }
};

  return (
    <div className="container login-hero">
      <h1>Secure <span style={{ color: 'var(--primary)' }}>Voting</span></h1>
      
      {/* LOCAL AUTH FORM */}
      <form onSubmit={handleSubmit} className="card" style={{ width: '350px', marginBottom: '20px' }}>
        <h3>{isSignup ? "Create Account" : "Sign In"}</h3>
        {isSignup && (
          <input type="text" placeholder="Name" required 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            style={inputStyle} />
        )}
        <input type="email" placeholder="Email" required 
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
          style={inputStyle} />
        <input type="password" placeholder="Password" required 
          onChange={(e) => setFormData({...formData, password: e.target.value})} 
          style={inputStyle} />
        
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          {isSignup ? "Sign Up" : "Login"}
        </button>
        
        <p onClick={() => setIsSignup(!isSignup)} style={{ cursor: 'pointer', fontSize: '0.8rem', marginTop: '10px' }}>
          {isSignup ? "Already have an account? Login" : "New user? Create account"}
        </p>
        
        {/* MANDATORY: Forgot Password Option */}
        {!isSignup && (
          <a href="#" onClick={() => alert("Reset link sent to your email!")} 
             style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Forgot Password? 
          </a>
        )}
        
        {/* Support & Terms Links */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid #333', paddingTop: '15px', fontSize: '0.8rem' }}>
          <Link to="/home#contact" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Technical Support
          </Link>
          <Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Terms of Service
          </Link>
        </div>

      </form>

      <div style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>OR</div>

      <div className="login-btn-group">
        <button className="btn btn-google" onClick={() => window.open(`${backendUrl}/auth/google`, "_self")}>
          Sign in with Google 
        </button>
        <button className="btn btn-linkedin" onClick={() => window.open(`${backendUrl}/auth/linkedin`, "_self")}>
          Sign in with LinkedIn 
        </button>
      </div>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: 'none', background: '#222', color: 'white' };

export default Login;



