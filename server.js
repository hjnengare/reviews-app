const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Environment validation
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Supabase clients
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const supabasePublic = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware setup
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body ? JSON.stringify(req.body) : '');
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Utility functions
const verifyJWT = (token) => {
  try {
    return jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const setAuthCookies = (res, session) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 60 * 60 * 1000 // 1 hour
  };

  res.cookie('sb-access-token', session.access_token, cookieOptions);
  res.cookie('sb-refresh-token', session.refresh_token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie('sb-access-token');
  res.clearCookie('sb-refresh-token');
  res.clearCookie('redirectTo');
};

// Database helper functions
const ensureProfile = async (userId, email) => {
  try {
    let { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      throw error;
    }

    if (!profile) {
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          onboarding_step: 'interests',
          onboarding_complete: false,
          interests: [],
          sub_interests: [],
          dealbreakers: []
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating profile:', insertError);
        throw insertError;
      }

      profile = newProfile;
    }

    return profile;
  } catch (error) {
    console.error('Error in ensureProfile:', error);
    throw error;
  }
};

const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateProfile:', error);
    throw error;
  }
};

// Middleware
const requireAuth = async (req, res, next) => {
  try {
    // Try to get token from Authorization header or cookies
    let token = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies['sb-access-token']) {
      token = req.cookies['sb-access-token'];
    }

    if (!token) {
      // Store intended URL for redirect after login
      if (req.path !== '/onboarding' && req.path !== '/login' && req.path !== '/create-account') {
        res.cookie('redirectTo', req.originalUrl, { httpOnly: true, maxAge: 15 * 60 * 1000 }); // 15 minutes
      }
      return res.redirect('/onboarding');
    }

    // Verify JWT token
    const payload = verifyJWT(token);
    if (!payload || !payload.sub) {
      clearAuthCookies(res);
      return res.redirect('/onboarding');
    }

    // Get user from Supabase Auth
    const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(payload.sub);
    if (error || !user) {
      clearAuthCookies(res);
      return res.redirect('/onboarding');
    }

    // Ensure profile exists and attach to request
    req.auth = { userId: user.user.id, email: user.user.email };
    req.profile = await ensureProfile(user.user.id, user.user.email);

    next();
  } catch (error) {
    console.error('Error in requireAuth:', error);
    clearAuthCookies(res);
    res.redirect('/onboarding');
  }
};

const requireOnboardingComplete = (req, res, next) => {
  if (!req.profile.onboarding_complete) {
    return res.redirect(`/${req.profile.onboarding_step || 'interests'}`);
  }
  next();
};

const enforceOnboardingStep = (requiredStep) => {
  const stepOrder = ['interests', 'sub-interests', 'dealbreakers', 'complete'];
  
  return (req, res, next) => {
    const currentStepIndex = stepOrder.indexOf(req.profile.onboarding_step);
    const requiredStepIndex = stepOrder.indexOf(requiredStep);
    
    if (currentStepIndex < requiredStepIndex) {
      return res.redirect(`/${req.profile.onboarding_step}`);
    }
    
    next();
  };
};

// Routes - GET
app.get('/', async (req, res) => {
  try {
    // Check if user is authenticated
    let token = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies['sb-access-token']) {
      token = req.cookies['sb-access-token'];
    }

    if (!token) {
      return res.redirect('/onboarding');
    }

    const payload = verifyJWT(token);
    if (!payload || !payload.sub) {
      return res.redirect('/onboarding');
    }

    const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(payload.sub);
    if (error || !user) {
      return res.redirect('/onboarding');
    }

    const profile = await ensureProfile(user.user.id, user.user.email);
    
    if (profile.onboarding_complete) {
      return res.redirect('/explore');
    } else {
      return res.redirect(`/${profile.onboarding_step || 'interests'}`);
    }
  } catch (error) {
    console.error('Error in / route:', error);
    return res.redirect('/onboarding');
  }
});

// Public routes
app.get('/onboarding', (req, res) => {
  // If already authenticated, redirect appropriately
  if (req.cookies['sb-access-token']) {
    const payload = verifyJWT(req.cookies['sb-access-token']);
    if (payload && payload.sub) {
      return res.redirect('/');
    }
  }
  res.sendFile(path.join(__dirname, 'views', 'onboarding.html'));
});

app.get('/create-account', (req, res) => {
  // If already authenticated, redirect appropriately
  if (req.cookies['sb-access-token']) {
    const payload = verifyJWT(req.cookies['sb-access-token']);
    if (payload && payload.sub) {
      return res.redirect('/');
    }
  }
  res.sendFile(path.join(__dirname, 'views', 'create-account.html'));
});

app.get('/login', (req, res) => {
  // If already authenticated, redirect appropriately
  if (req.cookies['sb-access-token']) {
    const payload = verifyJWT(req.cookies['sb-access-token']);
    if (payload && payload.sub) {
      return res.redirect('/');
    }
  }
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Protected onboarding routes
app.get('/interests', requireAuth, enforceOnboardingStep('interests'), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'interests.html'));
});

app.get('/sub-interests', requireAuth, enforceOnboardingStep('sub-interests'), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'sub-interests.html'));
});

app.get('/dealbreakers', requireAuth, enforceOnboardingStep('dealbreakers'), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dealbreakers.html'));
});

app.get('/complete', requireAuth, enforceOnboardingStep('complete'), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'complete.html'));
});

// Protected complete routes
app.get('/explore', requireAuth, requireOnboardingComplete, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/profile', requireAuth, requireOnboardingComplete, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});

app.get('/write-review', requireAuth, requireOnboardingComplete, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'write-review.html'));
});

app.get('/leaderboard', requireAuth, requireOnboardingComplete, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'leaderboard.html'));
});

// API Routes
app.get('/api/user', requireAuth, (req, res) => {
  res.json({
    id: req.auth.userId,
    email: req.auth.email,
    onboarding_complete: req.profile.onboarding_complete,
    onboarding_step: req.profile.onboarding_step,
    interests: req.profile.interests,
    sub_interests: req.profile.sub_interests,
    dealbreakers: req.profile.dealbreakers
  });
});

// POST Routes - Authentication
app.post('/create-account', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Create user with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (error) {
      console.error('Supabase signup error:', error);
      return res.status(400).json({ error: error.message });
    }

    // Create session
    const { data: session, error: sessionError } = await supabasePublic.auth.signInWithPassword({
      email,
      password
    });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return res.status(400).json({ error: sessionError.message });
    }

    // Set cookies
    setAuthCookies(res, session.session);

    // Ensure profile exists
    await ensureProfile(data.user.id, data.user.email);

    res.json({ success: true, redirectTo: '/interests' });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabasePublic.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error);
      return res.status(400).json({ error: error.message });
    }

    // Set cookies
    setAuthCookies(res, data.session);

    // Ensure profile exists
    const profile = await ensureProfile(data.user.id, data.user.email);

    // Check for redirect cookie
    let redirectTo = '/explore';
    if (req.cookies.redirectTo) {
      redirectTo = req.cookies.redirectTo;
      res.clearCookie('redirectTo');
    } else if (!profile.onboarding_complete) {
      redirectTo = `/${profile.onboarding_step || 'interests'}`;
    }

    res.json({ success: true, redirectTo });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/logout', (req, res) => {
  clearAuthCookies(res);
  res.json({ success: true, redirectTo: '/onboarding' });
});

// POST Routes - Onboarding
app.post('/interests', requireAuth, async (req, res) => {
  try {
    const { interests } = req.body;

    if (!Array.isArray(interests) || interests.length < 1 || interests.length > 8) {
      return res.status(400).json({ error: 'Please select 1-8 interests' });
    }

    await updateProfile(req.auth.userId, {
      interests,
      onboarding_step: 'sub-interests'
    });

    res.json({ success: true, redirectTo: '/sub-interests' });
  } catch (error) {
    console.error('Update interests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/sub-interests', requireAuth, async (req, res) => {
  try {
    const { subInterests } = req.body;

    if (!Array.isArray(subInterests)) {
      return res.status(400).json({ error: 'Invalid sub-interests data' });
    }

    await updateProfile(req.auth.userId, {
      sub_interests: subInterests,
      onboarding_step: 'dealbreakers'
    });

    res.json({ success: true, redirectTo: '/dealbreakers' });
  } catch (error) {
    console.error('Update sub-interests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/dealbreakers', requireAuth, async (req, res) => {
  try {
    const { dealbreakers } = req.body;

    if (!Array.isArray(dealbreakers)) {
      return res.status(400).json({ error: 'Invalid dealbreakers data' });
    }

    await updateProfile(req.auth.userId, {
      dealbreakers,
      onboarding_step: 'complete'
    });

    res.json({ success: true, redirectTo: '/complete' });
  } catch (error) {
    console.error('Update dealbreakers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/complete', requireAuth, async (req, res) => {
  try {
    await updateProfile(req.auth.userId, {
      onboarding_complete: true,
      onboarding_step: null
    });

    res.json({ success: true, redirectTo: '/explore' });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Catch-all route
app.get('*', (req, res) => {
  // If authenticated and complete, redirect to explore
  if (req.cookies['sb-access-token']) {
    const payload = verifyJWT(req.cookies['sb-access-token']);
    if (payload && payload.sub) {
      return res.redirect('/');
    }
  }
  // If not authenticated, redirect to onboarding
  res.redirect('/onboarding');
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  if (req.method === 'POST') {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.redirect('/onboarding');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Supabase URL: ${process.env.SUPABASE_URL}`);
});

module.exports = app;