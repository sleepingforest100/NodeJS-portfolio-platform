const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Trim whitespaces for better data integrity
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Ensure valid email format
    lowercase: true, // Store email in lowercase for case-insensitive comparisons
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Validate email format using regular expression
  },
  firstName: {
    type: String,
    required: true,
    trim: true, // Remove leading/trailing whitespaces
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    min: 1, // Set minimum age to 1 for validation
    max: 120, // Set maximum age to a reasonable limit
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    required: true,
    trim: true,
    enum: ['Male', 'Female', 'Non-binary', 'Other'], // Allow specific gender options
  },
  password: {
    type: String,
    required: true,
    minLength: 8, // Enforce a minimum password length for security
  },
});

module.exports = mongoose.model('User', UserSchema);