import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const Voting = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // Modals
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // NEW: For missing LinkedIn
  
  const [currentUser, setCurrentUser] = useState(null);
  const [linkedinInput, setLinkedinInput] = useState(""); // Input for the missing URL

  const navigate = useNavigate();
  // 👇 PASTE YOUR PUBLIC PORT 5000 URL HERE

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const candRes = await axios.get(`${backendUrl}/api/candidates`);
        setCandidates(candRes.data);

        const userRes = await axios.get(`${backendUrl}/auth/current_user`, { withCredentials: true });
        setCurrentUser(userRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    fetchData();
  }, [navigate]);

  const totalVotes = candidates.reduce((acc, curr) => acc + curr.voteCount, 0);

  // 2. Handle Vote Click (THE INTERCEPT LOGIC)
  const handleVoteClick = (candidate) => {
    if (!currentUser) return alert("Please log in first!");

    setSelectedCandidate(candidate);

    // CHECK: Does user have a LinkedIn Profile?
    if (!currentUser.linkedinProfile) {
      // If NO, force them to add it
      setIsProfileModalOpen(true);
    } else {
      // If YES, proceed to vote
      setIsVoteModalOpen(true);
    }
  };

  // 3. Handle Saving the LinkedIn URL
  const saveLinkedIn = async () => {
    if (!linkedinInput.includes("linkedin.com")) {
      return alert("Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/me)");
    }
    try {
      // Call our new backend route
      const res = await axios.post(`${backendUrl}/api/user/update`, {
        userId: currentUser._id,
        linkedinUrl: linkedinInput
      });
      
      // Update local state so they don't have to do it again
      setCurrentUser(res.data);
      setIsProfileModalOpen(false); // Close profile modal
      setIsVoteModalOpen(true); // Open vote confirmation immediately
      
    } catch (err) {
      alert("Error saving profile: " + err.message);
    }
  };

  // 4. Confirm Vote
  const confirmVote = async () => {
    try {
      await axios.post(`${backendUrl}/api/submit`, 
        { userId: currentUser._id, candidateId: selectedCandidate._id }
      );
      alert("✅ Vote Cast Successfully!");
      navigate('/results'); 
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.error || "Vote failed"));
      setIsVoteModalOpen(false);
    }
  };

  return (
    <>
      <Navbar user={currentUser} />
      
      <div className="container" style={{ paddingTop: '50px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>
          Live <span style={{ color: 'var(--primary)' }}>Poll Stats</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {candidates.map((candidate) => {
            const percentage = totalVotes === 0 ? 0 : Math.round((candidate.voteCount / totalVotes) * 100);
            return (
              <div key={candidate._id} className="card candidate-card">
                <img src={candidate.photoUrl} alt={candidate.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                <h3>{candidate.name}</h3>
                {/* Link to LinkedIn Profile */}
                <a 
                  href={candidate.linkedinUrl} 
                    target="_blank" 
                      rel="noopener noreferrer"
                        className="btn"
                          style={{ 
                              display: 'block', 
                                textAlign: 'center',
                                  marginBottom: '10px', 
                                      background: '#0077b5', // LinkedIn Blue
                                          color: 'white', 
                                              textDecoration: 'none',
                                                  padding: '8px 0',
                                                      fontSize: '0.9rem',
                                                          borderRadius: '4px'
                                                    }}
                                                    >
                                                      View LinkedIn Profile
                                                      </a>
                                                      
                <div style={{ margin: '15px 0', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Votes: {candidate.voteCount}</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>{percentage}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#333', borderRadius: '3px' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--success)', borderRadius: '3px' }}></div>
                  </div>
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', opacity: currentUser?.hasVoted ? 0.5 : 1 }}
                  onClick={() => !currentUser?.hasVoted && handleVoteClick(candidate)}
                  disabled={currentUser?.hasVoted}
                >
                  {currentUser?.hasVoted ? "Vote Cast" : "VOTE"}
                </button>
              </div>
            );
          })}
        </div>

        {/* MODAL 1: MISSING LINKEDIN (Force Update) */}
        {isProfileModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
          }}>
            <div className="card" style={{ maxWidth: '400px', border: '1px solid var(--accent)' }}>
              <h3>⚠️ Action Required</h3>
              <p>To ensure transparency, all voters must provide a <strong>LinkedIn Profile</strong>.</p>
              <input 
                type="text" 
                placeholder="https://linkedin.com/in/your-name" 
                value={linkedinInput}
                onChange={(e) => setLinkedinInput(e.target.value)}
                style={{ width: '100%', padding: '10px', marginTop: '10px', marginBottom: '10px', borderRadius: '4px', border: 'none' }}
              />
              <button className="btn btn-primary" onClick={saveLinkedIn} style={{ width: '100%' }}>
                Save & Continue
              </button>
            </div>
          </div>
        )}

        {/* MODAL 2: CONFIRM VOTE */}
        {isVoteModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
          }}>
            <div className="card" style={{ maxWidth: '400px', border: '1px solid var(--primary)' }}>
              <h3>Confirm Vote?</h3>
              <p>Voting for: <strong>{selectedCandidate?.name}</strong></p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
                <button className="btn" style={{ background: '#333' }} onClick={() => setIsVoteModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={confirmVote}>Confirm</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Voting;


