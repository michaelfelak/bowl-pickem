# Email Integration - Implementation Complete

## Frontend Changes (✅ Completed)

### 1. Updated `auth.service.ts`
- Made `jwtHelper` public so it can be accessed by components
- Added `getCurrentUserEmail()` method to retrieve email from JWT token

### 2. Updated `picks.component.ts`
- Removed email form control from `pickForm`
- Added email retrieval in `ngOnInit()` using `authService.getCurrentUserEmail()`
- Updated validation to use `this.email` instead of form value
- Updated submit request to use `this.email` instead of form value
- Removed form-based email assignment after submission

### 3. Updated `picks.component.html`
- Removed email input field from the form
- Only Entry Name input remains

## Backend Changes (⏳ Still Required)

### Email in JWT Token
The picks page now retrieves email from the JWT token. The backend must include email in the JWT payload.

**File to Update:** `service/jwt.go`

**Changes Needed:**
Update `GenerateToken()` function to include email in the JWT Claims:

```go
// Current implementation likely has:
type Claims struct {
    Username string `json:"username"`
    jwt.RegisteredClaims
}

// Update to:
type Claims struct {
    Username string `json:"username"`
    Email    string `json:"email"`
    jwt.RegisteredClaims
}

// And in GenerateToken(), pass email:
token := jwt.NewWithClaims(jwt.SigningMethodHS256, Claims{
    Username: username,
    Email:    email,  // ← Add this line
    RegisteredClaims: jwt.RegisteredClaims{
        ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
    },
})
```

**Where to get email:**
- In `service/auth.go` Login handler: Query database with username to get email
- In `service/auth.go` Register handler: Use email from request body

**Database Support:**
- Users table already has `email` column
- Can use existing `GetUserByUsername()` or similar method to fetch email

## Testing the Integration

1. **Register** with a new account including email address
2. **Login** with that account
3. **Navigate to Picks** page - email should be auto-populated from JWT
4. **Submit** an entry - should use authenticated email automatically
5. **Verify** in backend logs that email is included in JWT claims

## Files Modified

| File | Changes |
|------|---------|
| `src/app/shared/services/auth.service.ts` | Added `jwtHelper` public, added `getCurrentUserEmail()` method |
| `src/app/picks/picks.component.ts` | Removed email form control, added ngOnInit email retrieval, updated validation and submit |
| `src/app/picks/picks.component.html` | Removed email input field |

## Backend Files to Update

| File | Changes |
|------|---------|
| `service/jwt.go` | Add email to JWT Claims struct and GenerateToken() |
| `service/auth.go` | Pass email to GenerateToken() from Login and Register handlers |
