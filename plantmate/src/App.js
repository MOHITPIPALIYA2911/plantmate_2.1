import logo from './logo.svg';
import './App.css';
import Login from './pages/auth/Login';
import PublicRoute from './component/PublicRoute';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import Registration from './pages/auth/Registration';
import Dashboard from './pages/dashboard/Dashboard';
import Layout from './Layout';
import PrivateRoute from './component/PrivateRoute';
import Care from './pages/care/Care';
import { seedMock } from './lib/mockApi/mockApi';  
import Spaces from './pages/spaces/Spaces';
import Plants from './pages/plants/Plants';
import Calendar from './pages/calendar/Calendar';
import Settings from './pages/settings/Settings';
seedMock(); 

function App() {
  return (
     <Routes>
      {/* 🔓 Public routes */}
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/registration" element={<PublicRoute><Registration /></PublicRoute>} />


      {/* 🔒 Private routes */}
       <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
       <Route path="/spaces" element={<PrivateRoute><Layout><Spaces /></Layout></PrivateRoute>}/>
       <Route path="/plants" element={<PrivateRoute><Layout><Plants /></Layout></PrivateRoute>}/>
       <Route path="/care" element={<PrivateRoute><Layout><Care /></Layout></PrivateRoute>}/>
       <Route path="/calendar" element={<PrivateRoute><Layout><Calendar /></Layout></PrivateRoute>}/>
       <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>}/>


     {/* <Route path="/about" element={<PrivateRoute><Layout><About /></Layout></PrivateRoute>} />
      <Route path="/contact" element={<PrivateRoute><Layout><Contact /></Layout></PrivateRoute>} />
      <Route path="/classdetails" element={<PrivateRoute><Layout><ClassDetails /></Layout></PrivateRoute>} />
      <Route
        path="/assignments"
        element={<PrivateRoute><Layout><AssignmentList /></Layout></PrivateRoute>}
      />
      <Route
        path="/assignments/:id"
        element={<PrivateRoute><Layout><AssignmentPage /></Layout></PrivateRoute>}
      />
      <Route
        path="/courses"
        element={<PrivateRoute><Layout><Courses /></Layout></PrivateRoute>}
      />
      <Route
        path="/courses/:id"
        element={<PrivateRoute><Layout><CoursePage /></Layout></PrivateRoute>}
      />
      <Route path="/studentd" element={<PrivateRoute><Layout><StudentDirectory /></Layout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
      <Route path="/setting" element={<PrivateRoute><Layout><SettingsPage /></Layout></PrivateRoute>} />
      <Route path="/calender" element={<PrivateRoute><Layout><ReminderCalendar /></Layout></PrivateRoute>} />
      <Route path="/rough" element={<Rough />} /> */}
    </Routes>
  );
}

export default function RootApp() {
  return (
    <Router>
      <App />
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss={false}
        theme="light"
      />
    </Router>
  );
}
