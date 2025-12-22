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
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`
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
    callbackURL: `${process.env.BACKEND_URL}/auth/linkedin/callback`,
    scope: ['openid', 'profile', 'email'], 
    state: true // Permissions we need
  },
  
  async (accessToken, refreshToken, profile, done) => {
    try {
      // LinkedIn OIDC profile structure is different:
      // profile.id usually contains the sub (subject) identifier
      let user = await User.findOne({ authProviderId: profile.id });
      
      if (!user) {
        // LinkedIn OIDC returns names in a flatter structure
        const firstName = profile.name?.givenName || "";
        const lastName = profile.name?.familyName || "";
        const fullName = profile.displayName || `${firstName} ${lastName}`.trim();

        user = await new User({
          authProviderId: profile.id,
          name: fullName,
          email: profile.emails[0]?.value || "",
          // OIDC profiles often don't provide the public profile URL directly.
          // For the Registry, we can link to a generic search or their profile if available.
          linkedinProfile: profile._json?.publicProfileUrl || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(fullName)}`,
        }).save();
      }
      done(null, user);
    } catch (err) {
      console.error("LinkedIn Auth Error:", err);
      done(err, null);
    }
  }
));