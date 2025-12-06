# Backend Updates Required for Email Integration

## Issue
The picks component retrieves email from:
1. JWT token (if backend includes it)
2. localStorage cache (if set during registration or login)

**Current Problem:** Email is cached during **registration** but NOT during **login** because the backend login endpoint only returns `{token: "..."}` without the email.

## Solution

### Backend Update 1: Include Email in Login Response

**File:** `service/auth.go` - `Login` handler

**Current Code (assumed):**
```go
func (s *Service) Login(w http.ResponseWriter, r *http.Request) {
    // ... validation code ...
    
    token, err := s.store.GenerateToken(user.Username)
    // ...
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(AuthResponse{Token: token})
}
```

**Required Change:** Include email in response

```go
// First, update AuthResponse struct to include Email (optional field)
type AuthResponse struct {
    Token string `json:"token"`
    Email string `json:"email"`  // Add this
}

// In Login handler:
func (s *Service) Login(w http.ResponseWriter, r *http.Request) {
    var req LoginRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }

    user, err := s.store.GetUserByUsername(r.Context(), req.Username)
    if err != nil {
        http.Error(w, "Invalid credentials", http.StatusUnauthorized)
        return
    }

    if !s.store.VerifyPassword(user.Password, req.Password) {
        http.Error(w, "Invalid credentials", http.StatusUnauthorized)
        return
    }

    token, err := s.store.GenerateToken(user.Username)
    if err != nil {
        http.Error(w, "Error generating token", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(AuthResponse{
        Token: token,
        Email: user.Email,  // Add this line
    })
}
```

### Backend Update 2 (Optional): Add Email to JWT Claims

**File:** `service/jwt.go` - `GenerateToken` function

This makes email available without extra calls. Add `email` parameter:

```go
func (s *Service) GenerateToken(username, email string) (string, error) {
    claims := jwt.MapClaims{
        "username": username,
        "email":    email,  // Add this
        "exp":      time.Now().Add(24 * time.Hour).Unix(),
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(s.jwtSecret))
}
```

Then update the Register and Login handlers to pass email:
```go
token, err := s.store.GenerateToken(user.Username, user.Email)  // Pass email
```

### Frontend Update (Already Done)

The frontend now:
1. ✅ Stores email in localStorage after registration
2. ✅ Tries to retrieve email from JWT claims
3. ✅ Falls back to localStorage cache
4. ✅ Can fetch user info from backend if needed

## Testing After Backend Updates

1. **Test Registration:**
   - Create new account with email
   - Email should be in localStorage
   - Picks page should show email automatically

2. **Test Login:**
   - Login with existing account
   - If using JWT approach: email should be in token
   - If using response body: email should be cached from response
   - Picks page should show email automatically

3. **Test Submission:**
   - Submit picks entry
   - Verify email is sent in request body
   - Check database that correct email is stored

## Files to Modify

| File | Change |
|------|--------|
| `service/auth.go` | Update Login handler to return email in response AND/OR update GenerateToken to include email |
| `service/jwt.go` | Update GenerateToken to accept email parameter and include in claims |
| Type Definitions | Update AuthResponse struct to include Email field |

## Notes

- Frontend already handles both scenarios (JWT + localStorage fallback)
- Start with Update 1 (return email in login response) for quickest fix
- Update 2 (JWT claims) is cleaner long-term solution
- Both can be implemented together
