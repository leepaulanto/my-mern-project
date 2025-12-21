const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');

// 1. Serialize: Decide what data to save in the session (just the ID)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// 2. Deserialize: Use the ID to find the user in the DB
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// --- GOOGLE STRATEGY ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://zany-orbit-695jx597g79qfrjq5-5000.app.github.dev/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await User.findOne({ authProviderId: profile.id });
      
      if (!user) {
        // Create new user
        user = await new User({
          authProviderId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          // Google doesn't always give a LinkedIn URL, so we leave it blank or ask later
          linkedinProfile: "", 
        }).save();
      }
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
));

// --- LINKEDIN STRATEGY ---
passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: "https://zany-orbit-695jx597g79qfrjq5-5000.app.github.dev/auth/linkedin/callback",
    scope: ['r_emailaddress', 'r_liteprofile'], // Permissions we need
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ authProviderId: profile.id });
      if (!user) {
        user = await new User({
          authProviderId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          linkedinProfile: profile._json.publicProfileUrl || "https://linkedin.com", // Try to grab URL
        }).save();
      }
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
));