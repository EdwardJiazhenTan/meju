# Meju API Documentation

## Authentication Endpoints

### 1. User Registration
**Endpoint:** `POST /api/auth/register`

**Purpose:** Create a new user account with email/password

**Request Body:**
```json
{
  "username": "string (optional)",
  "email": "string (required)",
  "password": "string (required, min 8 chars, must include uppercase, lowercase, number)",
  "displayName": "string (optional)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "user_id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "display_name": "Test User",
      "profile_public": false,
      "registration_method": "email"
    }
  },
  "token": "jwt-token-here"
}
```

---

### 2. User Login
**Endpoint:** `POST /api/auth/login`

**Purpose:** Authenticate existing user with email/password

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "display_name": "Test User",
      "profile_public": false,
      "registration_method": "email"
    }
  },
  "token": "jwt-token-here"
}
```

---

### 3. Get Current User
**Endpoint:** `GET /api/auth/me`

**Purpose:** Get authenticated user's details

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User details retrieved",
  "data": {
    "user": {
      "user_id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "display_name": "Test User",
      "profile_public": false,
      "registration_method": "email",
      "created_at": "2025-01-01T12:00:00.000Z"
    }
  }
}
```

---

### 4. OAuth Authentication
**Endpoints:** 
- `GET /api/auth/signin` - Sign in page
- `GET /api/auth/callback/google` - Google OAuth callback
- `GET /api/auth/callback/github` - GitHub OAuth callback

**Purpose:** Authenticate with Google or GitHub

**Usage:**
1. Redirect user to `/api/auth/signin`
2. User selects Google or GitHub
3. OAuth provider handles authentication
4. User is redirected back with session

---

## Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Conflict Error (409):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Authentication Methods

### 1. JWT Token (Custom Auth)
- Used for email/password authentication
- Include in `Authorization: Bearer <token>` header
- Token expires in 7 days

### 2. NextAuth Session (OAuth)
- Used for Google/GitHub authentication  
- Session managed by NextAuth.js
- Automatically handled by Next.js

---

## Setup Instructions

### Environment Variables
Create `.env.local` file:
```env
JWT_SECRET=your-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### OAuth Setup

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

#### GitHub OAuth:
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

---

## Testing

Run the test script:
```bash
node scripts/test-auth.js
```

Or test manually with curl:
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123"}'

# Get user details (replace TOKEN with actual token)
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/auth/me
```

---

## Database Schema

The authentication system uses these tables:
- `users` - User accounts
- `user_oauth` - OAuth provider data
- `weekly_meal_plans` - Auto-created meal plans for new users

## Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT token authentication
- ✅ Email validation
- ✅ Password strength validation
- ✅ OAuth integration (Google/GitHub)
- ✅ SQL injection protection (prepared statements)
- ✅ Automatic meal plan initialization
- ✅ Foreign key constraints
- ✅ Input sanitization