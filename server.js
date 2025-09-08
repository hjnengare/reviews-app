const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory (industry standard)
app.use(express.static(path.join(__dirname, 'public')));

// Route for the main landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Route for onboarding flow
app.get('/onboarding', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'onboarding.html'));
});

// Route for account creation
app.get('/create-account', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'create-account.html'));
});

// Route for interests selection
app.get('/interests', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'interests.html'));
});

// Route for sub-interests selection
app.get('/sub-interests', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'sub-interests.html'));
});

// Route for dealbreakers selection
app.get('/dealbreakers', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dealbreakers.html'));
});

// Route for completion page
app.get('/complete', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'complete.html'));
});

// Route for user profile
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});

// Route for writing reviews
app.get('/write-review', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'write-review.html'));
});

// Catch-all route for any other requests - redirect to home
app.get('*', (req, res) => {
  res.redirect('/');
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Reviews app running on http://localhost:${PORT}`);
  console.log(`📱 Mobile-first design with Express.js backend`);
  console.log(`📁 Using industry-standard folder structure`);
});

module.exports = app;