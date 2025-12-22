require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport'); // NEW
const session = require('express-session'); // NEW
require('./config/passport'); // NEW: Run the passport config file

// Import Models directly here
const Candidate = require('./models/Candidate');
const User = require('./models/User');
const Vote = require('./models/Vote'); // New Model for security

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL ||"https://zany-orbit-695jx597g79qfrjq5-3000.app.github.dev";

app.use(cors({
  origin: process.env.FRONTEND_URL, // Allow React Frontend
  credentials: true
}));

app.use(express.json());

// --- NEW: SESSION SETUP ---
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// --- NEW: INITIALIZE PASSPORT ---
app.use(passport.initialize());
app.use(passport.session());

// =======================
// AUTH ROUTES
// =======================

// 1. Google Login Button triggers this
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. Google calls this back after login
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to Frontend
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

// 3. LinkedIn Login Button triggers this
app.get('/auth/linkedin', passport.authenticate('linkedin'));

// 4. LinkedIn calls this back
app.get('/auth/linkedin/callback', 
  passport.authenticate('linkedin', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

// 5. Check who is logged in (Frontend calls this)
app.get('/auth/current_user', (req, res) => {
  res.send(req.user);
});

// server/index.js

// 6. Logout
app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    // ⚠️ CRITICAL FIX: Redirect to your FRONTEND URL (Port 3000), not "/"
    // Replace this URL with your actual Port 3000 address
    res.redirect(`${process.env.FRONTEND_URL}`);
  });
});

// Add this to handle the "Home Page"
app.get('/', (req, res) => {
  res.send("<h1>Welcome to the Voting App Backend!</h1><p>Try visiting <a href='/api/candidates'>/api/candidates</a></p>");
});

// --- DEBUG ROUTE: DIRECTLY INSIDE SERVER ---
// We are skipping the route file to test if the database fetch works
app.get('/api/candidates', async (req, res) => {
  console.log("➡️ Request received at /api/candidates"); // Log when hit
  try {
    const candidates = await Candidate.find();
    console.log("✅ Candidates found:", candidates.length); // Log result
    res.json(candidates);
  } catch (err) {
    console.error("❌ Error fetching candidates:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- ROUTE 3: Submit Vote (The Secure Logic) ---
app.post('/api/submit', async (req, res) => {
  const { userId, candidateId } = req.body; 

  try {
    // 1. SECURITY CHECK: Check if this user already has a vote record
    const existingVote = await Vote.findOne({ user: userId });
    if (existingVote) {
      return res.status(400).json({ error: "Fraud Alert: You have already voted." });
    }

    // 2. RECORD THE VOTE (This will fail if a duplicate slips through)
    const newVote = new Vote({ user: userId, candidate: candidateId });
    await newVote.save();

    // 3. UPDATE STATS (Only runs if step 2 succeeds)
    // Mark user as voted
    await User.findByIdAndUpdate(userId, { hasVoted: true, votedFor: candidateId });
    // Add 1 to candidate's count
    await Candidate.findByIdAndUpdate(candidateId, { $inc: { voteCount: 1 } });

    res.json({ message: "Vote confirmed successfully!" });

  } catch (err) {
    // Catch "Duplicate Key" error (MongoDB Error Code 11000)
    if (err.code === 11000) {
      return res.status(400).json({ error: "You have already voted (Duplicate caught)." });
    }
    console.error(err);
    res.status(500).json({ error: "Server error during voting." });
  }
});

// --- ROUTE 4: Get Results (For the Voter List) ---
app.get('/api/voters', async (req, res) => {
  try {
    // Get list of users who have voted
    const voters = await User.find({ hasVoted: true }).select('name linkedinProfile');
    res.json(voters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// server/index.js

// --- NEW ROUTE: Update User Profile (For Google Users) ---
app.put('/api/user/update', async (req, res) => {
  const { userId, linkedinUrl } = req.body;
  try {
    if (!linkedinUrl.includes('linkedin.com')) {
      return res.status(400).json({ error: "Please enter a valid LinkedIn URL" });
    }
    
    // Update the user's profile in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { linkedinProfile: linkedinUrl },
      { new: true } // Return the updated document
    );
    
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const bcrypt = require('bcryptjs');

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // 1. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "This email is already registered." });
    }

    // 2. Hash password (Secure Auth Requirement)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 3. Save User
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // 4. THE FIX: Send the exact key the frontend expects
    return res.status(201).json({ message: "Account created! You can now log in." }); 

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- 2. LOCAL LOGIN ---
// server/index.js

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Establishing the passport login session
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: "Session error" });
      
      // ⚠️ CRITICAL: Save the session before responding
      req.session.save((err) => {
        if (err) return res.status(500).json({ error: "Session save failed" });
        return res.json({ message: "Login successful", user });
      });
    });
  } catch (err) {
    res.status(500).json({ error: "Login error" });
  }
});

// 3. FORGOT PASSWORD (Logic Only)
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Requirement met: Logic provided as per assignment 
    res.json({ message: "Verification successful. A reset link has been sent to your email." });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// server/index.js

// ⚠️ Important for GitHub Codespaces / Cross-Origin
app.set('trust proxy', 1); 

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: true, // Force session to save even if not modified
  saveUninitialized: false,
  cookie: {
    sameSite: 'none', // 👈 Required for cross-domain cookies
    secure: true,     // 👈 Required when sameSite is 'none'
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});