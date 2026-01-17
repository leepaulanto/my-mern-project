import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar'; // Import Navbar

const Results = () => {
  const [voters, setVoters] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // 👇 PASTE YOUR PUBLIC PORT 5000 URL HERE
 const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/voters`, { withCredentials: true });
        setVoters(res.data);
        
        // Also fetch current user for Navbar
        const userRes = await axios.get(`${backendUrl}/auth/current_user`, { withCredentials: true });
        setCurrentUser(userRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchResults();
  }, []);

  return (
    <>
      <Navbar user={currentUser} /> {/* Navbar Added */}

      <div className="container" style={{ paddingTop: '50px', textAlign: 'center' }}>
        <h1>Voting <span style={{ color: 'var(--primary)' }}>Registry</span></h1>
        
        <div className="card" style={{ maxWidth: '600px', margin: '30px auto', textAlign: 'left' }}>
          <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '0' }}>
            Who Voted ({voters.length})
          </h3>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {voters.map((voter, index) => (
              <li key={index} style={{ 
                padding: '15px', 
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                {/* NAME SECTION (Clickable if link exists) */}
                <a 
                  href={voter.linkedinProfile || "#"} 
                  target={voter.linkedinProfile ? "_blank" : "_self"}
                  rel="noreferrer"
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '15px', 
                    textDecoration: 'none', color: 'white', cursor: voter.linkedinProfile ? 'pointer' : 'default' 
                  }}
                >
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', 
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '1.1rem'
                  }}>
                    {voter.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span style={{ display: 'block', fontWeight: '600' }}>{voter.name}</span>
                    {/* Show a tiny label if they have a link */}
                    {voter.linkedinProfile && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>View Profile ↗</span>
                    )}
                  </div>
                </a>
                
                {/* BUTTON SECTION */}
                {voter.linkedinProfile ? (
                  <a 
                    href={voter.linkedinProfile} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn"
                    style={{ fontSize: '0.8rem', padding: '6px 12px', background: '#0077b5', color: 'white', textDecoration: 'none', borderRadius: '4px' }}
                  >
                    LinkedIn
                  </a>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    (No Link)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Results;