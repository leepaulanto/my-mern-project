require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
// ❌ DELETED DUPLICATE LINE HERE
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('./config/passport');

// Import Models
const Candidate = require('./models/Candidate');
const User = require('./models/User');
const Vote = require('./models/Vote');


// ---------------------------------------------------------
// 🛡️ THE FIX: Handle Node v24 Import Weirdness
// ---------------------------------------------------------
let MongoStoreRaw = require('connect-mongo');
let MongoStore;

// Case 1: Node v24+ often hides the library in .default
if (MongoStoreRaw.default) {
  MongoStore = MongoStoreRaw.default;
  console.log("✅ Using MongoStore.default (Node v24 fix)");
} else {
  MongoStore = MongoStoreRaw;
}
// ---------------------------------------------------------

const app = express();

app.set('trust proxy', 1); 

const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

// ==========================================
// 🛡️ SMART SESSION STORE SETUP
// ==========================================
let sessionStore;

if (MongoStore.create) {
  // Version 6+ (Standard)
  console.log("✅ Using MongoStore.create (v6 standard)");
  sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  });
} else if (typeof MongoStore === 'function') {
  // Version 3 (Legacy)
  console.log("⚠️ Using Legacy MongoStore (v3)");
  const MongoStoreV3 = MongoStore(session);
  sessionStore = new MongoStoreV3({ 
    url: process.env.MONGO_URI,
    collection: 'sessions'
  });
} else {
  console.error("❌ CRITICAL ERROR: Could not initialize MongoStore. Dumping object:", MongoStore);
}

// --- NEW: SESSION SETUP ---
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    sameSite: 'none', 
    secure: true,     
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Configure Email Sender
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.use(passport.initialize());
app.use(passport.session());

// =======================
// AUTH ROUTES
// =======================

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

app.get('/auth/linkedin', passport.authenticate('linkedin'));

app.get('/auth/linkedin/callback', 
  passport.authenticate('linkedin', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

app.get('/auth/current_user', (req, res) => {
  res.send(req.user);
});

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect(`${process.env.FRONTEND_URL}`);
  });
});

app.get('/', (req, res) => {
  res.send("<h1>Voting App Backend is Running!</h1>");
});

app.get('/api/candidates', async (req, res) => {
  console.log("➡️ Request received at /api/candidates");
  try {
    const candidates = await Candidate.find();
    console.log("✅ Candidates found:", candidates.length);
    res.json(candidates);
  } catch (err) {
    console.error("❌ Error fetching candidates:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/submit', async (req, res) => {
  const { userId, candidateId } = req.body; 

  try {
    const existingVote = await Vote.findOne({ user: userId });
    if (existingVote) {
      return res.status(400).json({ error: "Fraud Alert: You have already voted." });
    }

    const newVote = new Vote({ user: userId, candidate: candidateId });
    await newVote.save();

    await User.findByIdAndUpdate(userId, { hasVoted: true, votedFor: candidateId });
    await Candidate.findByIdAndUpdate(candidateId, { $inc: { voteCount: 1 } });

    res.json({ message: "Vote confirmed successfully!" });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "You have already voted (Duplicate caught)." });
    }
    console.error(err);
    res.status(500).json({ error: "Server error during voting." });
  }
});

app.get('/api/voters', async (req, res) => {
  try {
    const voters = await User.find({ hasVoted: true }).select('name linkedinProfile');
    res.json(voters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/update', async (req, res) => {
  const { userId, linkedinUrl } = req.body;
  try {
    if (!linkedinUrl.includes('linkedin.com')) {
      return res.status(400).json({ error: "Please enter a valid LinkedIn URL" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { linkedinProfile: linkedinUrl },
      { new: true }
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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "This email is already registered." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    return res.status(201).json({ message: "Account created! You can now log in." }); 
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: "Session error" });
      req.session.save((err) => {
        if (err) return res.status(500).json({ error: "Session save failed" });
        return res.json({ message: "Login successful", user });
      });
    });
  } catch (err) {
    res.status(500).json({ error: "Login error" });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If that email is registered, we sent a link." });
    }
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      text: `Reset your password here: ${resetLink}`
    };

    transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        return res.status(500).json({ error: "Error sending email" });
      }
      res.json({ message: "Password reset link sent to email." });
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post('/api/auth/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: "Password reset token is invalid or has expired." });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: "Success! Your password has been changed." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});