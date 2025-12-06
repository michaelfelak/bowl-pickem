# Security Best Practices for Authentication

## Critical: Backend Password Hashing

Your backend MUST hash passwords before storing them. Here's the correct implementation:

### **Node.js/Express with bcrypt:**

```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10; // bcrypt rounds (higher = more secure but slower)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    // Find user in database
    const user = await User.findOne({ username });
    
    // Check if user exists and password matches (constant-time comparison)
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        username: user.username,
        id: user.id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    res.json({ 
      token,
      email: user.email 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    // Check password length
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user
    const user = new User({
      username,
      email,
      passwordHash // Store ONLY the hash, never the plaintext
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        username: user.username,
        id: user.id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      token,
      email: user.email 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
```

## Backend Security Headers

Your backend should set these security headers:

```javascript
// Middleware to set security headers
app.use((req, res, next) => {
  // Prevent clicking site into iframes
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  // HTTPS only
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  next();
});
```

## Frontend Security Features Already Implemented

✅ **SecurityInterceptor**: Monitors requests for HTTPS, validates security headers
✅ **HTTPS Only**: All requests use HTTPS
✅ **JWT Token Storage**: Uses localStorage (consider moving to httpOnly cookies for better security)
✅ **Password Validation**: Minimum 6 characters on frontend
✅ **Error Handling**: Generic error messages to prevent username enumeration

## Additional Frontend Improvements to Consider

### 1. **Use httpOnly Cookies for Token Storage** (More Secure)
Instead of localStorage, use httpOnly cookies:

```typescript
// Backend: Set token in httpOnly cookie
res.cookie('authToken', token, {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'Strict',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
});
```

### 2. **Implement CSRF Protection**
```javascript
// Backend: Use csrf-csrf package
const doubleCsrf = require('csrf-csrf').doubleCsrf;

const { generateToken, doubleCsrfMiddleware } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
});

app.post('/api/auth/login', doubleCsrfMiddleware, async (req, res) => {
  // ... login logic
});
```

### 3. **Rate Limiting** (Prevent Brute Force)
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  // ... login logic
});
```

### 4. **Password Requirements** (Better Frontend Validation)
```typescript
// Add to login component
const passwordStrengthValidator = (control: AbstractControl): ValidationErrors | null => {
  const password = control.value;
  if (!password) return null;

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  const isStrong = hasUpperCase && hasLowerCase && hasNumber && hasSpecial;

  return !isStrong ? { weakPassword: true } : null;
};
```

## Checklist for Securing Your App

- [ ] Implement bcrypt or similar on backend for password hashing
- [ ] Set secure HTTP headers on backend
- [ ] Enable HTTPS everywhere (already done)
- [ ] Use httpOnly cookies instead of localStorage for tokens
- [ ] Implement rate limiting on auth endpoints
- [ ] Add CSRF protection
- [ ] Validate passwords on backend (8+ chars, complexity requirements)
- [ ] Log security events (failed logins, etc.)
- [ ] Rotate JWT secret periodically
- [ ] Monitor for suspicious activity

## Environment Variables (Backend)

```bash
# .env
JWT_SECRET=your-super-secret-key-change-this-in-production
CSRF_SECRET=your-csrf-secret-key
NODE_ENV=production
```

The most critical item is **backend password hashing with bcrypt**. Without this, all other security measures provide limited benefit.
