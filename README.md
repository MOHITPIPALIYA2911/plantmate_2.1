# 🌿 PlantMate - Your Personal Plant Care Companion

PlantMate is a comprehensive web application designed to help plant enthusiasts manage their indoor and outdoor gardens efficiently. With AI-powered plant recommendations, smart care task scheduling, and intuitive space management, PlantMate makes plant care simple and enjoyable.

## ✨ Features

### 🏠 Space Management
- **Create & Manage Spaces**: Add and organize your growing spaces (balconies, windowsills, terraces)
- **Space Attributes**: Track sunlight hours, direction, area, and space type
- **Smart Organization**: Organize plants by their growing locations

### 🌱 Plant Catalog & Recommendations
- **AI-Powered Recommendations**: Get intelligent plant suggestions based on your space characteristics
  - Analyzes sunlight hours, space type, and area
  - Matches plants with optimal growing conditions
  - Provides compatibility scores (0-100) for each recommendation
- **Comprehensive Plant Database**: Access a catalog of 12+ common plants with detailed information
  - Sunlight requirements
  - Watering needs
  - Difficulty levels
  - Fertilization schedules
  - Pot size recommendations

### 📊 Dashboard
- **Today's Watering Tasks**: View all plants that need watering today
- **Quick Actions**: Mark tasks as done or snooze for later
- **Statistics**: Track your total plants, spaces, and upcoming tasks

### 💧 Care Task Management
- **Automated Reminders**: Set up recurring care tasks (watering, fertilizing)
- **Task Scheduling**: 
  - Mark tasks as done
  - Snooze tasks for 2 hours
  - Reschedule tasks to specific dates
  - Bring overdue tasks to today
- **Task Types**: Water, fertilize, and other plant care activities

### 📅 Calendar Integration
- **Event Management**: Create and manage calendar events related to plant care
- **Visual Calendar**: Monthly view with all your plant care events

### ⚙️ Settings & Customization
- **Theme Options**: 
  - Light mode
  - Dark mode
  - Auto (follows system preference)
- **Profile Management**: Update your personal information and preferences
- **Timezone & Locale**: Set your timezone and preferred units (metric/imperial)
- **Notification Preferences**: Customize in-app notifications and snooze defaults

### 🔐 User Authentication
- **Secure Login**: JWT-based authentication
- **User Registration**: Easy sign-up process
- **Session Management**: Persistent login sessions

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd plantmate_2.1
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```
   
   Create a `.env` file in the server directory:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/plantmate
   PORT=7777
   JWT_SECRET=your-secret-key-here
   ```

3. **Frontend Setup**
   ```bash
   cd plantmate
   npm install
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Start Backend Server**
   ```bash
   cd server
   npm start
   ```
   Server will run on `http://localhost:7777`

6. **Start Frontend**
   ```bash
   cd plantmate
   npm start
   ```
   Frontend will run on `http://localhost:3000`

## 🏗️ Project Structure

```
plantmate_2.1/
├── plantmate/          # Frontend React Application
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── component/  # Reusable components
│   │   ├── lib/        # API utilities
│   │   └── utils/      # Helper functions
│   └── public/         # Static assets
│
└── server/              # Backend Node.js/Express API
    ├── controllers/     # Route controllers
    ├── models/          # MongoDB models
    ├── routes/          # API routes
    ├── middleware/     # Auth middleware
    └── seed/           # Database seeders
```

## 🛠️ Technology Stack

### Frontend
- **React** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Toastify** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Spaces
- `GET /api/spaces` - List all spaces
- `POST /api/spaces` - Create new space
- `PUT /api/spaces/:id` - Update space
- `DELETE /api/spaces/:id` - Delete space

### Plants
- `GET /api/plants` - Get plant catalog
- `GET /api/plants/suggestions?spaceId=xxx` - AI recommendations

### User Plants
- `GET /api/user-plants` - List user's plants
- `POST /api/user-plants` - Add plant
- `DELETE /api/user-plants/:id` - Remove plant

### Care Tasks
- `GET /api/care-tasks` - List all tasks
- `POST /api/care-tasks` - Create task
- `POST /api/care-tasks/:id/done` - Mark as done
- `POST /api/care-tasks/:id/snooze` - Snooze task
- `POST /api/care-tasks/:id/reschedule` - Reschedule task
- `DELETE /api/care-tasks/:id` - Delete task

### Dashboard
- `GET /api/dashboard/water-tasks` - Today's watering tasks
- `GET /api/dashboard/stats` - Dashboard statistics

### Calendar
- `GET /api/calendar` - List events
- `POST /api/calendar` - Create event
- `DELETE /api/calendar/:id` - Delete event

### Profile
- `GET /api/profiles/me` - Get profile
- `PUT /api/profiles/me` - Update profile

## 🤖 AI Plant Recommendations

PlantMate uses an intelligent recommendation algorithm that analyzes:

1. **Sunlight Matching** (40 points) - Matches plant sunlight needs with space availability
2. **Indoor/Outdoor Compatibility** (20 points) - Checks if plant works for windowsill/balcony
3. **Space Type Matching** (15 points) - Matches herbs for windowsills, fruiting plants for balconies
4. **Difficulty Level** (10 points) - Favors easy-care plants for beginners
5. **Pot Size vs Space** (10 points) - Ensures plant fits your available space
6. **Watering Needs** (5 points) - Aligns water requirements with sunlight conditions

Each recommendation includes:
- Compatibility score (0-100)
- Detailed rationale
- Plant care information
- Quick add functionality

## 🎨 Design Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Support**: Full dark theme with smooth transitions
- **Modern UI**: Clean, intuitive interface with emerald green theme
- **Accessibility**: Keyboard navigation and screen reader support

## 🔒 Security

- JWT token-based authentication
- Password hashing with bcrypt
- User data isolation (users can only access their own data)
- Protected API routes with authentication middleware

## 📝 Default Plant Catalog

The platform comes with 12 pre-loaded plants:
- Basil, Mint, Aloe Vera, Chilli, Tomato
- Coriander, Spinach, Rosemary, Thyme
- Oregano, Lettuce, Bell Pepper

Each plant includes complete care information and growing requirements.

## 👥 Development Team

### **Bhumi Vyas**
- Role: Developer
- Contributions: Core development and feature implementation

### **Mohit Pipaliya**
- Role: Developer
- Contributions: Backend architecture and API development

### **Anirudh Lohiya**
- Role: Developer
- Contributions: Frontend development and UI/UX design

### **Kashish Khubchandani**
- Role: Developer
- Contributions: Database design and system integration

## 🎯 What You Can Do

### For Plant Enthusiasts
- Track all your plants in one place
- Get personalized plant recommendations
- Never miss a watering or fertilizing schedule
- Organize plants by growing spaces
- Monitor plant care history

### For Beginners
- Learn about plant care requirements
- Get AI-powered suggestions for your space
- Follow easy-to-understand care schedules
- Start with easy-care plants

### For Experienced Gardeners
- Manage multiple growing spaces
- Track complex care schedules
- Organize large plant collections
- Customize care preferences

## 📱 Platform Capabilities

- ✅ Multi-space management
- ✅ AI-powered plant recommendations
- ✅ Automated care task scheduling
- ✅ Calendar integration
- ✅ Theme customization
- ✅ Profile management
- ✅ Real-time notifications
- ✅ Responsive design
- ✅ Offline support (local storage fallback)

## 🔮 Future Enhancements

- Plant health tracking
- Photo gallery for plants
- Community features
- Plant disease identification
- Weather integration
- Mobile app version

## 📄 License

This project is developed for educational and personal use.

## 🤝 Contributing

This is a collaborative project developed by the PlantMate team. For contributions or questions, please contact the development team.

---

**Made with 🌿 by the PlantMate Team**

*Helping you grow, one plant at a time.*

