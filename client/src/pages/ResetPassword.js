import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
  const { token } = useParams(); // Grabs the token from the URL
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use the environment variable for the backend URL
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      
      const res = await axios.post(`${backendUrl}/api/auth/reset-password/${token}`, { 
        password 
      });

      setMessage(res.data.message);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setMessage(err.response?.data?.error || "Error resetting password");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Reset Your Password</h2>
      {message && <div className="alert alert-info">{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>New Password</label>
          <input 
            type="password" 
            className="form-control" 
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Update Password</button>
      </form>
    </div>
  );
}

export default ResetPassword;