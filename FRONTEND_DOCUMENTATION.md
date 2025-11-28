# Omar's Event Planner - Frontend Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [How Frontend Connects to Backend](#how-frontend-connects-to-backend)
4. [Core Services](#core-services)
5. [Authentication Flow](#authentication-flow)
6. [Routing Structure](#routing-structure)
7. [Components](#components)
8. [Models (TypeScript Interfaces)](#models)
9. [API Endpoints Used](#api-endpoints-used)

---

## 🎯 Project Overview

**Omar's Event Planner** is an Angular 20 application for managing events. Users can:
- Register and login
- Create events
- View organized and invited events
- Invite other users to events
- Delete events

**Tech Stack:**
- Angular 20 (Standalone Components)
- TypeScript
- SCSS for styling
- RxJS for reactive programming

---

## 📁 Project Structure

```
src/app/
├── auth/                          # Authentication module
│   ├── auth.guard.ts              # Route protection
│   ├── auth.service.ts            # Login/Register API calls
│   └── pages/
│       ├── login/                 # Login page component
│       ├── register/              # Register page component
│       └── shell/                 # Auth shell (contains login/register)
│
├── core/                          # Core services (singleton)
│   ├── interceptors/
│   │   └── auth.interceptor.ts    # Adds auth headers to requests
│   └── services/
│       ├── api-client.service.ts  # Base HTTP client
│       ├── events.service.ts      # Events API calls
│       ├── users.service.ts       # Users API calls
│       └── token-storage.service.ts # LocalStorage management
│
├── features/                      # Feature modules
│   ├── dashboard/
│   │   └── pages/
│   │       ├── all-events/        # All events page
│   │       ├── organized-events/  # Events you created
│   │       └── invited-events/    # Events you're invited to
│   └── events/
│       └── pages/
│           ├── create-event/      # Create event form
│           └── event-details/     # Event details + attendees
│
├── layouts/
│   └── main-layout/               # Main app layout with navbar
│
├── models/                        # TypeScript interfaces
│   ├── api.models.ts              # API response types
│   ├── auth.models.ts             # Auth request/response types
│   └── event.models.ts            # Event-related types
│
├── shared/                        # Reusable components
│   └── components/
│       ├── button/                # Reusable button
│       ├── confirm-modal/         # Confirmation popup
│       ├── empty-state/           # Empty state message
│       ├── event-card/            # Event card display
│       ├── invite-modal/          # Invite users modal
│       ├── navbar/                # Navigation bar
│       ├── search-bar/            # Search input
│       └── tabs/                  # Tab navigation
│
├── app.routes.ts                  # Route definitions
└── main.ts                        # App bootstrap
```

---

## 🔌 How Frontend Connects to Backend

### Connection Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Component (e.g., AllEventsComponent)                          │
│         │                                                        │
│         ▼                                                        │
│   Service (e.g., EventsService)                                 │
│         │                                                        │
│         ▼                                                        │
│   ApiClientService                                              │
│         │                                                        │
│         ▼                                                        │
│   AuthInterceptor (adds headers)                                │
│         │                                                        │
│         ▼                                                        │
│   Angular HttpClient                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Request
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                  http://127.0.0.1:8000                          │
└─────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Flow

1. **Component** calls a method on a **Service**
2. **Service** uses **ApiClientService** to make HTTP request
3. **AuthInterceptor** automatically adds Authorization header
4. **HttpClient** sends request to backend
5. Response flows back through the chain

### Example: Fetching Events

```typescript
// 1. Component calls service
this.eventsService.getOrganizedEvents(userId).subscribe({
  next: (events) => this.events = events
});

// 2. EventsService uses ApiClientService
getOrganizedEvents(userId: number): Observable<Event[]> {
  return this.api.get('/events/organized', { user_id: userId });
}

// 3. ApiClientService builds URL and makes request
get<T>(path: string, params?: Record<string, any>): Observable<T> {
  const url = `${this.baseUrl}${path}`; // http://127.0.0.1:8000/events/organized
  return this.http.get<T>(url, { params });
}
```

---

## 🛠️ Core Services

### 1. ApiClientService (`core/services/api-client.service.ts`)

**Purpose:** Base HTTP client that all other services use.

**Location of Base URL:** `src/environments/environment.ts`
```typescript
export const environment = {
  apiBaseUrl: 'http://127.0.0.1:8000'
};
```

**Methods:**
| Method | Description |
|--------|-------------|
| `get<T>(path, params?)` | GET request |
| `post<T>(path, body, headers?)` | POST request |
| `put<T>(path, body, headers?)` | PUT request |
| `delete<T>(path)` | DELETE request |

---

### 2. AuthService (`auth/auth.service.ts`)

**Purpose:** Handles authentication (login, register, logout)

**Methods:**
| Method | API Endpoint | Description |
|--------|--------------|-------------|
| `login(payload)` | POST `/login` | Login user |
| `register(payload)` | POST `/signup` | Register new user |
| `logout()` | - | Clear local storage |

**How Login Works:**
```typescript
login(payload: LoginRequest): Observable<LoginResponse> {
  return this.api.post<LoginResponse>('/login', payload).pipe(
    tap(res => {
      // Save user_id to localStorage
      this.tokenStorage.saveAccessToken(res.user_id.toString());
    })
  );
}
```

---

### 3. EventsService (`core/services/events.service.ts`)

**Purpose:** All event-related API calls

**Methods:**
| Method | API Endpoint | Description |
|--------|--------------|-------------|
| `createEvent(userId, payload)` | POST `/events?user_id={id}` | Create event |
| `getOrganizedEvents(userId)` | GET `/events/organized?user_id={id}` | Get events I created |
| `getInvitedEvents(userId)` | GET `/events/invited?user_id={id}` | Get events I'm invited to |
| `getEventAttendees(eventId, userId)` | GET `/events/{id}/attendees?user_id={id}` | Get attendees |
| `inviteUser(eventId, inviteeId, inviterId)` | POST `/events/{id}/invite?inviter_id={id}` | Invite user |
| `deleteEvent(eventId, userId)` | DELETE `/events/{id}?user_id={id}` | Delete event |
| `getSentInvitations(userId, eventId)` | GET `/events/invitations/sent?user_id={id}&event_id={id}` | Get sent invites |

---

### 4. UsersService (`core/services/users.service.ts`)

**Purpose:** User-related API calls

**Methods:**
| Method | API Endpoint | Description |
|--------|--------------|-------------|
| `getCurrentUser(userId)` | GET `/me?user_id={id}` | Get logged-in user info |
| `getAllUsers()` | GET `/users` | Get all registered users |

---

### 5. TokenStorageService (`core/services/token-storage.service.ts`)

**Purpose:** Manage user_id in localStorage

**Methods:**
| Method | Description |
|--------|-------------|
| `saveAccessToken(token)` | Save user_id to localStorage |
| `getAccessToken()` | Get user_id from localStorage |
| `clear()` | Remove user_id from localStorage |

**Storage Key:** `access_token`

---

## 🔐 Authentication Flow

```
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│  Login Page  │────▶│ AuthService   │────▶│   Backend    │
│              │     │   .login()    │     │  POST /login │
└──────────────┘     └───────────────┘     └──────────────┘
                            │                      │
                            │                      │
                            ▼                      ▼
                     ┌───────────────┐     ┌──────────────┐
                     │TokenStorage   │◀────│  Response:   │
                     │.saveAccessToken│    │  { user_id } │
                     └───────────────┘     └──────────────┘
                            │
                            ▼
                     ┌───────────────┐
                     │  localStorage │
                     │ access_token  │
                     │    = "1"      │
                     └───────────────┘
```

### Route Protection (AuthGuard)

```typescript
// auth/auth.guard.ts
canActivate(): boolean {
  const token = this.tokenStorage.getAccessToken();
  if (!token) {
    this.router.navigate(['/auth/login']);
    return false;
  }
  return true;
}
```

---

## 🛣️ Routing Structure

| Path | Component | Protected | Description |
|------|-----------|-----------|-------------|
| `/auth/login` | AuthShellComponent | ❌ | Login page |
| `/auth/register` | AuthShellComponent | ❌ | Register page |
| `/dashboard` | AllEventsComponent | ✅ | All events |
| `/dashboard/organized` | OrganizedEventsComponent | ✅ | My organized events |
| `/dashboard/invited` | InvitedEventsComponent | ✅ | Events I'm invited to |
| `/events/create` | CreateEventComponent | ✅ | Create new event |
| `/events/:id` | EventDetailsComponent | ✅ | Event details |

---

## 🧩 Components

### Shared Components (Reusable)

| Component | Location | Purpose |
|-----------|----------|---------|
| NavbarComponent | `shared/components/navbar/` | Top navigation bar |
| TabsComponent | `shared/components/tabs/` | Tab navigation |
| SearchBarComponent | `shared/components/search-bar/` | Search input with debounce |
| EventCardComponent | `shared/components/event-card/` | Display single event |
| EmptyStateComponent | `shared/components/empty-state/` | No data message |
| ButtonComponent | `shared/components/button/` | Styled button |
| InviteModalComponent | `shared/components/invite-modal/` | Invite users popup |
| ConfirmModalComponent | `shared/components/confirm-modal/` | Yes/No confirmation |

### Feature Components

| Component | Location | Purpose |
|-----------|----------|---------|
| AllEventsComponent | `features/dashboard/pages/all-events/` | Show all events |
| OrganizedEventsComponent | `features/dashboard/pages/organized-events/` | Show my events |
| InvitedEventsComponent | `features/dashboard/pages/invited-events/` | Show invited events |
| CreateEventComponent | `features/events/pages/create-event/` | Event creation form |
| EventDetailsComponent | `features/events/pages/event-details/` | Event info + attendees |

---

## 📦 Models

### Auth Models (`models/auth.models.ts`)

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user_id: number;
  name: string;
  email: string;
  message: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}
```

### Event Models (`models/event.models.ts`)

```typescript
interface Event {
  id: number;
  title: string;
  description?: string;
  location?: string;
  date?: string;      // YYYY-MM-DD
  time?: string;      // HH:mm
  organizer_id: number;
}

interface Attendee {
  user_id: number;
  name?: string;
  email?: string;
  status?: 'going' | 'interested' | 'not_going' | 'invited';
}

interface CreateEventRequest {
  title: string;
  description?: string;
  location?: string;
  date?: string;
  time?: string;
}
```

### User Model (`core/services/users.service.ts`)

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}
```

---

## 🔗 API Endpoints Used

### Authentication
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/login` | `{email, password}` | Login |
| POST | `/signup` | `{name, email, password, confirm_password}` | Register |

### Users
| Method | Endpoint | Query Params | Description |
|--------|----------|--------------|-------------|
| GET | `/me` | `user_id` | Get current user |
| GET | `/users` | - | Get all users |

### Events
| Method | Endpoint | Query Params | Body | Description |
|--------|----------|--------------|------|-------------|
| POST | `/events` | `user_id` | Event data | Create event |
| GET | `/events/organized` | `user_id` | - | Get my events |
| GET | `/events/invited` | `user_id` | - | Get invited events |
| DELETE | `/events/{id}` | `user_id` | - | Delete event |

### Invitations
| Method | Endpoint | Query Params | Body | Description |
|--------|----------|--------------|------|-------------|
| POST | `/events/{id}/invite` | `inviter_id` | `{userId}` | Invite user |
| GET | `/events/invitations/sent` | `user_id`, `event_id` | - | Get sent invites |
| GET | `/events/{id}/attendees` | `user_id` | - | Get attendees |

---

## 🎨 Styling

- **Primary Color:** `#ff6b35` (Orange)
- **Background:** Dark with cityscape image
- **Font:** Inter, Roboto
- **Border Radius:** 10-20px for cards/buttons

---

## 🚀 Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm start

# App runs at http://localhost:4200
# Backend should run at http://localhost:8000
```

---

## 📝 Summary

1. **ApiClientService** is the foundation - all HTTP requests go through it
2. **Services** (Auth, Events, Users) wrap API calls with business logic
3. **Components** use Services to fetch/send data
4. **TokenStorageService** manages user authentication state in localStorage
5. **AuthGuard** protects routes that require login
6. **AuthInterceptor** adds auth headers to requests

The frontend is completely decoupled from the backend - just change `environment.apiBaseUrl` to point to a different server!

