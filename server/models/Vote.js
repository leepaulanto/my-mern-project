const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true // <--- THIS IS THE MAGIC LINE. No user can appear twice here.
  },
  candidate: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Candidate', 
    required: true 
  },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vote', voteSchema);