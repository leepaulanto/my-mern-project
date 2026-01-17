import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const Home = () => {
  const [user, setUser] = useState(null);
  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${backendUrl}/auth/current_user`, { withCredentials: true });
        setUser(res.data);
      } catch (err) { console.log(err); }
    };
    fetchUser();
  }, []);

  return (
    <>
      <Navbar user={user} />
      <div className="container" style={{ paddingTop: '50px' }}>
        <section className="card" style={{ marginBottom: '20px' }}>
          <h2>About NeonVote</h2>
          <p>This platform ensures a fair election process where each authenticated user is allowed to vote only once.</p>
        </section>

        <section className="card">
          <h2>Contact Us</h2>
          <p>📧 Email: support@NeonVote.com</p>
          <p>📞 Phone: +91 98765 43210</p>
        </section>
      </div>
    </>
  );
};

export default Home;