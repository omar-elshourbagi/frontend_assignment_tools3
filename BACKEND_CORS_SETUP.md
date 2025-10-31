# Backend CORS Configuration - REQUIRED

Your FastAPI backend **must** have CORS configured to allow requests from the Angular frontend.

## Add this to your `main.py` file:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router as auth_router  # Your existing imports

app = FastAPI()

# ⚠️ ADD THIS CORS MIDDLEWARE - CRITICAL FOR FRONTEND CONNECTION ⚠️
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",      # Angular dev server
        "http://127.0.0.1:4200",      # Alternative localhost
    ],
    allow_credentials=True,
    allow_methods=["*"],              # Allow all HTTP methods
    allow_headers=["*"],              # Allow all headers
)

# Include your routes
app.include_router(auth_router)

# ... rest of your code
```

## Complete Example `main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import initialize_database
from routes import router as auth_router

# Initialize database
initialize_database()

app = FastAPI(
    title="EventPlanner API",
    description="Event Planning System API",
    version="1.0.0"
)

# CORS Configuration - MUST BE ADDED BEFORE ROUTES
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)

@app.get("/")
async def root():
    return {"message": "EventPlanner API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## After adding CORS:

1. Save your `main.py` file
2. The server should auto-reload (you'll see it restart in the terminal)
3. Test the Angular app at http://localhost:4200/auth/register
4. Open browser DevTools (F12) → Console tab
5. Try signing up - you should see logs and no CORS errors

## Common Issues:

- **CORS error in browser console**: CORS middleware not added or configured incorrectly
- **404 error**: Routes not included properly
- **Network error**: Backend not running on port 8000

