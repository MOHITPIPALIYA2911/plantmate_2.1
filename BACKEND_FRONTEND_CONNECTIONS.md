# PlantMate - Backend & Frontend Connection Guide

## ✅ All Backend Endpoints Connected

### 🔐 Authentication (`/api/auth`)
- **POST** `/api/auth/login` - User login ✅
- **POST** `/api/auth/register` - User registration ✅

### 👤 Profile (`/api/profiles`)
- **GET** `/api/profiles/me` - Get user profile ✅
- **PUT** `/api/profiles/me` - Update user profile ✅

### 🏠 Spaces (`/api/spaces`)
- **GET** `/api/spaces` - List all spaces ✅
- **POST** `/api/spaces` - Create new space ✅
- **PUT** `/api/spaces/:id` - Update space ✅
- **DELETE** `/api/spaces/:id` - Delete space ✅

### 🌿 Plants Catalog (`/api/plants` or `/api/catalog`)
- **GET** `/api/plants` - Get plant catalog (no auth required) ✅
- **GET** `/api/catalog/plants` - Alternative catalog endpoint ✅
- **GET** `/api/plants/suggestions?spaceId=xxx` - AI plant recommendations ✅

### 🌱 User Plants (`/api/user-plants`)
- **GET** `/api/user-plants` - List user's plants ✅
- **POST** `/api/user-plants` - Add plant to user's collection ✅
- **DELETE** `/api/user-plants/:id` - Remove plant ✅

### 💧 Care Tasks (`/api/care-tasks`)
- **GET** `/api/care-tasks` - List all care tasks ✅
- **POST** `/api/care-tasks` - Create new care task ✅
- **POST** `/api/care-tasks/done` - Mark task as done (with body.id) ✅
- **POST** `/api/care-tasks/:id/done` - Mark task as done (with URL param) ✅
- **POST** `/api/care-tasks/:id/snooze` - Snooze task ✅
- **POST** `/api/care-tasks/:id/reschedule` - Reschedule task ✅
- **POST** `/api/care-tasks/:id/bring-today` - Bring task to today ✅
- **DELETE** `/api/care-tasks/:id` - Delete task ✅

### 📅 Calendar (`/api/calendar`)
- **GET** `/api/calendar` - List calendar events ✅
- **POST** `/api/calendar` - Create calendar event ✅
- **DELETE** `/api/calendar/:id` - Delete calendar event ✅

### 📊 Dashboard (`/api/dashboard`)
- **GET** `/api/dashboard/water-tasks` - Get today's watering tasks ✅
- **GET** `/api/dashboard/stats` - Get dashboard statistics ✅

## 🗄️ Database Models

All models are properly connected:
- ✅ User
- ✅ Profile
- ✅ Space
- ✅ Plant (catalog)
- ✅ UserPlant
- ✅ CareTask
- ✅ CalendarEvent

## 🌱 Default Plant Catalog

The backend automatically seeds 12 default plants on startup:
- Basil, Mint, Aloe Vera, Chilli, Tomato, Coriander
- Spinach, Rosemary, Thyme, Oregano, Lettuce, Bell Pepper

## 🔧 Configuration

### Backend Server
- Port: `7777` (default)
- MongoDB: `mongodb://127.0.0.1:27017/plantmate`
- CORS: Enabled for `http://localhost:3000`

### Frontend API Base
- Default: `http://localhost:7777`
- Configurable via `REACT_APP_API_BASE` environment variable

## 🚀 Getting Started

1. **Start MongoDB** (if not running)
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd server
   npm install
   npm start
   ```

3. **Start Frontend**
   ```bash
   cd plantmate
   npm install
   npm start
   ```

## ✅ All Features Connected

- ✅ User Authentication & Registration
- ✅ Spaces Management (CRUD)
- ✅ Plant Catalog with AI Recommendations
- ✅ User Plants Management
- ✅ Care Tasks (Water, Fertilize, etc.)
- ✅ Calendar Events
- ✅ Dashboard with Water Tasks & Stats
- ✅ User Profile & Settings

## 🔒 Security

- All protected routes use JWT authentication
- Token validation via `authRequired` middleware
- User data isolation (users can only access their own data)

