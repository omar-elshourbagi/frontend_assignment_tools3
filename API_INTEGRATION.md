# API Integration - EventPlanner Frontend

## Backend Configuration

The frontend is configured to connect to your FastAPI backend at:
- **Base URL**: `http://localhost:8000`

## Endpoints Used

### 1. Signup
- **Endpoint**: `POST /signup`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Success Response** (201):
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "message": "User registered successfully"
}
```

### 2. Login
- **Endpoint**: `POST /login`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Success Response** (200):
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "message": "Login successful"
}
```

## CORS Configuration Required

Your FastAPI backend must allow requests from the Angular dev server. Add this to your FastAPI main file:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Angular dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Testing

1. Start your FastAPI backend: `uvicorn main:app --reload --port 8000`
2. Start Angular frontend: `npm start` (runs on http://localhost:4200)
3. Test signup at `/auth/register`
4. Test login at `/auth/login`

## Notes

- The frontend stores `user_id` in localStorage after successful login
- Error messages from the API are displayed using the `detail` field from error responses
- Name field was removed from signup to match your API structure

