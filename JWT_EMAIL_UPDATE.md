# Backend Changes Required: Add Email to JWT

## Problem
Currently, the JWT token only contains `username`. The email field needs to be included in the JWT claims so the frontend can extract it.

## Files to Update in bowl-pickem-service

### 1. Update `service/jwt.go`

Change the `GenerateToken` function to accept email and include it in claims:

**Current code:**
```go
type Claims struct {
    Username string `json:"username"`
    jwt.RegisteredClaims
}

func GenerateToken(username string) (string, error) {
    secret := os.Getenv("JWT_SECRET")
    if secret == "" {
        secret = "your-secret-key-change-in-production"
    }

    expirationTime := time.Now().Add(24 * time.Hour)
    claims := &Claims{
        Username: username,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(expirationTime),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    tokenString, err := token.SignedString([]byte(secret))
    if err != nil {
        return "", fmt.Errorf("failed to sign token: %w", err)
    }

    return tokenString, nil
}
```

**Updated code:**
```go
type Claims struct {
    Username string `json:"username"`
    Email    string `json:"email"`
    jwt.RegisteredClaims
}

func GenerateToken(username string, email string) (string, error) {
    secret := os.Getenv("JWT_SECRET")
    if secret == "" {
        secret = "your-secret-key-change-in-production"
    }

    expirationTime := time.Now().Add(24 * time.Hour)
    claims := &Claims{
        Username: username,
        Email:    email,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(expirationTime),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    tokenString, err := token.SignedString([]byte(secret))
    if err != nil {
        return "", fmt.Errorf("failed to sign token: %w", err)
    }

    return tokenString, nil
}
```

### 2. Update `service/auth.go` - Login Handler

Update the Login handler to get the user's email and pass it to GenerateToken:

**Find this code:**
```go
func (s *Service) Login(w http.ResponseWriter, r *http.Request) {
    // ... existing validation code ...
    
    // Generate JWT token
    token, err := GenerateToken(req.Username)
```

**Change to:**
```go
func (s *Service) Login(w http.ResponseWriter, r *http.Request) {
    // ... existing validation code ...
    
    // Get user record to retrieve email
    user, err := s.store.GetUserByUsername(r.Context(), req.Username)
    if err != nil {
        http.Error(w, `{"error":"User not found"}`, http.StatusUnauthorized)
        return
    }
    
    // Generate JWT token with username AND email
    token, err := GenerateToken(req.Username, user.Email)
```

### 3. Update `service/auth.go` - Register Handler

Similarly update the Register handler:

**Find this code:**
```go
func (s *Service) Register(w http.ResponseWriter, r *http.Request) {
    // ... existing validation and creation code ...
    
    token, err := GenerateToken(req.Username)
```

**Change to:**
```go
func (s *Service) Register(w http.ResponseWriter, r *http.Request) {
    // ... existing validation and creation code ...
    
    // Generate JWT token with username AND email
    token, err := GenerateToken(req.Username, req.Email)
```

## Summary of Changes

| File | Change |
|------|--------|
| `service/jwt.go` | Add `Email string` field to Claims struct; Add `email` parameter to GenerateToken() and include in claims |
| `service/auth.go` | Login: Get user email from database before generating token; Register: Pass req.Email to GenerateToken() |

## How to Apply

1. Open `service/jwt.go` and update the Claims struct and GenerateToken function
2. Open `service/auth.go` and update both Login and Register handlers
3. Run `go build` to compile
4. Restart the server

After these changes, tokens will include email and the frontend will be able to extract it from the JWT.
