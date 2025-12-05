# PlantMate Deployment Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Local Deployment

### 1. Clone the Repository
```bash
git clone <repository-url>
cd plantmate_2.1
```

### 2. Backend Setup
```bash
cd server
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the `server` directory:
```env
MONGO_URI=mongodb://127.0.0.1:27017/plantmate
PORT=7777
JWT_SECRET=your-super-secret-jwt-key-here
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
mongod
```

### 5. Start the Backend Server
```bash
npm start
```

The backend will be available at `http://localhost:7777`

### 6. Frontend Setup
In a new terminal window:
```bash
cd ../plantmate
npm install
```

### 7. Start the Frontend
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Production Deployment

### Backend Deployment Options

#### Option 1: Deploy to Render.com
1. Fork the repository to your GitHub account
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set the following environment variables in Render:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
5. Set the build command to: `npm install`
6. Set the start command to: `npm start`

#### Option 2: Deploy to Heroku
1. Install Heroku CLI
2. Login to Heroku: `heroku login`
3. Create a new app: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set MONGO_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   ```
5. Deploy: `git push heroku main`

### Frontend Deployment Options

#### Deploy to Vercel
1. Push your code to GitHub
2. Sign up/in to Vercel
3. Import your GitHub repository
4. Configure the project:
   - Framework: Create React App
   - Build command: `npm run build`
   - Output directory: `build`
5. Deploy

#### Deploy to Netlify
1. Push your code to GitHub
2. Sign up/in to Netlify
3. Select "New site from Git"
4. Connect to your GitHub repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Deploy

## Environment Variables

### Required Variables
- `MONGO_URI`: MongoDB connection string
- `PORT`: Server port (default: 7777)
- `JWT_SECRET`: Secret key for JWT token signing

### Optional Variables
- `NODE_ENV`: Environment (development, production)

## Testing
Run the test suite:
```bash
cd server
npm test
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Spaces
- `GET /api/spaces` - List user spaces
- `POST /api/spaces` - Create new space
- `PUT /api/spaces/:id` - Update space
- `DELETE /api/spaces/:id` - Delete space

### Plants
- `GET /api/plants` - Get plant catalog
- `GET /api/plants/suggestions?spaceId=:id` - Get plant suggestions for space

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check `MONGO_URI` in `.env` file
   - Verify network connectivity to MongoDB server

2. **Port Already in Use**
   - Change `PORT` in `.env` file
   - Kill processes using the port:
     ```bash
     # On Windows
     netstat -ano | findstr :7777
     taskkill /PID <PID> /F
     
     # On macOS/Linux
     lsof -i :7777
     kill -9 <PID>
     ```

3. **Frontend Not Connecting to Backend**
   - Check that backend is running
   - Verify CORS configuration in `server.js`
   - Ensure API base URL is correct in frontend config

### Logs
Check logs for error messages:
```bash
# Backend logs
cd server
npm start
# Look for error messages in terminal output

# Frontend logs
cd plantmate
npm start
# Check browser console for errors
```

## Maintenance

### Database Backup
Regularly backup your MongoDB database:
```bash
mongodump --uri="your-mongodb-uri" --out=/path/to/backup
```

### Updates
To update the application:
1. Pull the latest changes: `git pull`
2. Install updated dependencies: `npm install`
3. Restart the servers

## Scaling Considerations

For production deployments with high traffic:

1. **Database**: Use a managed MongoDB service (MongoDB Atlas)
2. **Load Balancing**: Deploy multiple instances behind a load balancer
3. **Caching**: Implement Redis caching for frequently accessed data
4. **Monitoring**: Set up application monitoring (e.g., New Relic, Datadog)
5. **Logging**: Centralize logs with ELK stack or similar solutions