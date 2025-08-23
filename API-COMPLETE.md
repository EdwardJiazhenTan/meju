# 🍽️ Meju Complete API Documentation

A comprehensive meal planning application backend with user authentication, recipe management, sharing, and meal planning capabilities.

## 📚 Table of Contents
- [Authentication](#authentication)  
- [User Profile](#user-profile)
- [Ingredients](#ingredients)
- [Dishes](#dishes)
- [Dish-Ingredients](#dish-ingredients)
- [Dish Tags](#dish-tags)
- [Public Discovery](#public-discovery)
- [Dish Sharing](#dish-sharing)
- [Meal Planning](#meal-planning)

---

## 🔐 Authentication

### Register User
```http
POST /api/auth/register
```
**Body:**
```json
{
  "username": "string (optional)",
  "email": "string (required)",
  "password": "string (required, min 8 chars, uppercase, lowercase, number)",
  "displayName": "string (optional)"
}
```

### Login User
```http
POST /api/auth/login
```
**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### OAuth Authentication
- `GET /api/auth/signin` - OAuth sign-in page
- Google: `/api/auth/callback/google`
- GitHub: `/api/auth/callback/github`

---

## 👤 User Profile

### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

### Update Profile  
```http
PUT /api/users/profile
Authorization: Bearer <token>
```
**Body:**
```json
{
  "username": "string (optional)",
  "display_name": "string (optional)",
  "profile_public": "boolean (optional)"
}
```

---

## 🥬 Ingredients

### Get All Ingredients
```http
GET /api/ingredients
Authorization: Bearer <token>

# With search
GET /api/ingredients?q=potato

# By category  
GET /api/ingredients?category=vegetable
```

### Get Categorized Ingredients
```http
GET /api/ingredients/categories
Authorization: Bearer <token>
```

### Create Ingredient
```http
POST /api/ingredients
Authorization: Bearer <token>
```
**Body:**
```json
{
  "name": "string (required)",
  "unit": "string (optional)",
  "category": "vegetable|meat|dairy|grain|spice|fruit|other (optional)"
}
```

---

## 🍽️ Dishes

### Get User Dishes
```http
GET /api/dishes
Authorization: Bearer <token>
```

### Create Dish
```http
POST /api/dishes
Authorization: Bearer <token>
```
**Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "calories": "number (optional)",
  "meal": "breakfast|lunch|dinner|dessert (required)",
  "special": "boolean (optional)",
  "url": "string (optional)",
  "visibility": "private|shared|public (optional, default: private)",
  "prep_time": "number (minutes, optional)",
  "cook_time": "number (minutes, optional)"
}
```

### Get Single Dish
```http
GET /api/dishes/{dishId}
Authorization: Bearer <token>
```

### Update Dish
```http
PUT /api/dishes/{dishId}
Authorization: Bearer <token>
```

### Delete Dish
```http
DELETE /api/dishes/{dishId} 
Authorization: Bearer <token>
```

---

## 🔗 Dish-Ingredients

### Get Dish Ingredients
```http
GET /api/dishes/{dishId}/ingredients
Authorization: Bearer <token>
```

### Add Ingredient to Dish
```http
POST /api/dishes/{dishId}/ingredients
Authorization: Bearer <token>
```
**Body:**
```json
{
  "ingredientId": "number (required)",
  "quantity": "number (required, > 0)"
}
```

### Update Ingredient Quantity
```http
PUT /api/dishes/{dishId}/ingredients/{ingredientId}
Authorization: Bearer <token>
```
**Body:**
```json
{
  "quantity": "number (required, > 0)"
}
```

### Remove Ingredient from Dish
```http
DELETE /api/dishes/{dishId}/ingredients/{ingredientId}
Authorization: Bearer <token>
```

---

## 🏷️ Dish Tags

### Get Dish Tags
```http
GET /api/dishes/{dishId}/tags
Authorization: Bearer <token>
```

### Add Tag to Dish
```http
POST /api/dishes/{dishId}/tags
Authorization: Bearer <token>
```
**Body:**
```json
{
  "tag": "drink|dessert|vegetable|meat|carbohydrate (required)"
}
```

### Remove Tag from Dish
```http
DELETE /api/dishes/{dishId}/tags/{tag}
Authorization: Bearer <token>
```

---

## 🌍 Public Discovery

### Get Public Dishes
```http
GET /api/dishes/public
Authorization: Bearer <token>

# With search
GET /api/dishes/public?q=chicken

# By meal type
GET /api/dishes/public?meal=dinner

# By tag
GET /api/dishes/public?tag=meat

# With pagination
GET /api/dishes/public?limit=10&offset=20
```

---

## 🤝 Dish Sharing

### Share Dish
```http
POST /api/dishes/{dishId}/share
Authorization: Bearer <token>
```
**Body:**
```json
{
  "userEmail": "string (required)",
  "canReshare": "boolean (optional, default: false)"
}
```

### Get Dish Sharing Info
```http
GET /api/dishes/{dishId}/share
Authorization: Bearer <token>
```

### Get Dishes Shared With Me
```http
GET /api/dishes/shared
Authorization: Bearer <token>

# With pagination
GET /api/dishes/shared?limit=10&offset=0
```

---

## 📅 Meal Planning

### Get Weekly Meal Plan
```http
GET /api/meal-plans
Authorization: Bearer <token>
```

### Add Dish to Meal Plan
```http
POST /api/meal-plans/{dayOfWeek}
Authorization: Bearer <token>
```
**Body:**
```json
{
  "dishId": "number (required)",
  "mealType": "breakfast|lunch|dinner|dessert (required)",
  "servingSize": "number (optional, default: 1.0)"
}
```

**Day of Week Values:**
- 1 = Monday
- 2 = Tuesday  
- 3 = Wednesday
- 4 = Thursday
- 5 = Friday
- 6 = Saturday
- 7 = Sunday

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🔒 Authentication

All endpoints (except auth) require authentication:
```http
Authorization: Bearer <jwt-token>
```

Or for NextAuth OAuth sessions, cookies are automatically managed.

---

## 📈 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (login required)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error

---

## 🧪 Testing

Run comprehensive API tests:
```bash
# Start development server
npm run dev

# In another terminal, run tests
node scripts/test-all-apis.js
```

## 🚀 Production Ready Features

- ✅ **Security**: JWT auth, SQL injection protection, input validation
- ✅ **Scalability**: Prepared statements, indexes, pagination
- ✅ **Flexibility**: Multi-auth (email + OAuth), privacy controls
- ✅ **Performance**: Query optimization, efficient relationships
- ✅ **Reliability**: Foreign key constraints, transaction safety
- ✅ **Usability**: Search, filtering, meal planning, sharing

## 📱 Frontend Integration

This API is ready for integration with:
- **React/Next.js** frontend applications
- **Mobile apps** (React Native, Flutter)
- **Desktop applications** (Electron)

All endpoints return consistent JSON with proper HTTP status codes and CORS support.