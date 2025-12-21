import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Voting from './pages/Voting'; // Import the new page
import Results from './pages/Results'; // NEW IMPORT
import Home from './pages/Home';
import Terms from './pages/Terms';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Voting />} /> {/* NEW ROUTE */}
          <Route path="/results" element={<Results />} /> {/* NEW ROUTE */}
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;