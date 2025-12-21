const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({


  // We will store the Google or LinkedIn ID here
  authProviderId: { type: String}, 
  name: { type: String, required: true },
  email: { type: String,required: true, unique: true }, 

  // Password only exists for Local Users
  password: { type: String },

  // Mandatory: LinkedIn link for the voter list
  linkedinProfile: { type: String },
   

  // Mandatory: Track if they voted
  hasVoted: { type: Boolean, default: false },
  votedFor: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },

  // Mandatory: Fields for Forgot Password logic
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

module.exports = mongoose.model('User', userSchema);