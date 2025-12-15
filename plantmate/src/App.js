// src/App.js
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

// 🆕 Notifications page
import Notifications from './pages/notifications/Notifications';

seedMock();

function App() {
  return (
    <Routes>
      {/* 🔓 Public routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/registration"
        element={
          <PublicRoute>
            <Registration />
          </PublicRoute>
        }
      />

      {/* 🔒 Private routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/spaces"
        element={
          <PrivateRoute>
            <Layout>
              <Spaces />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/plants"
        element={
          <PrivateRoute>
            <Layout>
              <Plants />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/care"
        element={
          <PrivateRoute>
            <Layout>
              <Care />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <PrivateRoute>
            <Layout>
              <Calendar />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Layout>
              <Settings />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* 🆕 Notifications route */}
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <Layout>
              <Notifications />
            </Layout>
          </PrivateRoute>
        }
      />
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
