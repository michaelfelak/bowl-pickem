/**
 * BACKEND API ENDPOINTS REQUIRED FOR AUTHENTICATION
 * 
 * Your backend needs to implement these two endpoints for authentication to work:
 */

/**
 * POST /api/auth/login
 * 
 * Request body:
 * {
 *   "username": "string",
 *   "password": "string"
 * }
 * 
 * Response (200 OK):
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * 
 * Response (401 Unauthorized):
 * {
 *   "message": "Invalid username or password"
 * }
 * 
 * Description:
 * - Authenticates a user with their username and password
 * - Returns a JWT token that the frontend will use for subsequent requests
 * - The JWT token should include the username in the payload: { username: "..." }
 * - Token should have an expiration time (recommended: 24 hours or more)
 */

/**
 * POST /api/auth/register
 * 
 * Request body:
 * {
 *   "username": "string",
 *   "password": "string"
 * }
 * 
 * Response (200 OK):
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * 
 * Response (400 Bad Request):
 * {
 *   "message": "Username already exists"
 * }
 * 
 * Description:
 * - Registers a new user with a username and password
 * - Should validate that username doesn't already exist
 * - Should hash the password before storing (use bcrypt or similar)
 * - Returns a JWT token immediately after registration
 * - The JWT token should include the username in the payload: { username: "..." }
 */

/**
 * JWT TOKEN REQUIREMENTS:
 * 
 * 1. The token should be a valid JWT with the following structure:
 *    Header: { "alg": "HS256", "typ": "JWT" }
 *    Payload: { "username": "...", "iat": ..., "exp": ... }
 *    Signature: HMAC256(secret)
 * 
 * 2. The token will be sent in the Authorization header as:
 *    Authorization: Bearer <token>
 * 
 * 3. When the token expires (401 response), the frontend will automatically
 *    log out the user and redirect to the login page
 * 
 * 4. Example Node.js/Express implementation:
 * 
 *    const jwt = require('jsonwebtoken');
 *    const SECRET = 'your-secret-key'; // Change this to a strong secret
 * 
 *    // Login endpoint
 *    app.post('/api/auth/login', (req, res) => {
 *      const { username, password } = req.body;
 *      
 *      // Verify username and password (you'll need a database lookup here)
 *      const user = users.find(u => u.username === username && u.password === password);
 *      
 *      if (!user) {
 *        return res.status(401).json({ message: 'Invalid credentials' });
 *      }
 *      
 *      const token = jwt.sign({ username }, SECRET, { expiresIn: '24h' });
 *      res.json({ token });
 *    });
 * 
 *    // Register endpoint
 *    app.post('/api/auth/register', (req, res) => {
 *      const { username, password } = req.body;
 *      
 *      // Check if user already exists
 *      if (users.find(u => u.username === username)) {
 *        return res.status(400).json({ message: 'Username already exists' });
 *      }
 *      
 *      // Hash password and save user
 *      users.push({ username, password: bcrypt.hashSync(password, 10) });
 *      
 *      const token = jwt.sign({ username }, SECRET, { expiresIn: '24h' });
 *      res.json({ token });
 *    });
 */

/**
 * FRONTEND CONFIGURATION:
 * 
 * In src/app/shared/services/auth.service.ts, update the apiUrl if needed:
 * 
 *   private apiUrl = '/api/auth';  // or 'http://localhost:3000/api/auth'
 * 
 * Make sure this points to your backend API.
 */

export {};
