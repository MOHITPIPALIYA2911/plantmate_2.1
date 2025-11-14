// src/component/Sidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaMapMarkerAlt,
  FaLeaf,
  FaTint,
  FaCalendarAlt,
  FaCog,
  FaSignOutAlt,
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out');
    navigate('/login');
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const navItems = [
    { icon: <FaHome />, text: 'Dashboard', path: '/dashboard' },
    { icon: <FaMapMarkerAlt />, text: 'Spaces', path: '/spaces' },
    { icon: <FaLeaf />, text: 'My Plants', path: '/plants' },
    { icon: <FaTint />, text: 'Care Tasks', path: '/care' },
    { icon: <FaCalendarAlt />, text: 'Calendar', path: '/calendar' },
    { icon: <FaCog />, text: 'Settings', path: '/settings' },
  ];

  return (
    <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-56
      bg-gradient-to-b from-emerald-700 to-emerald-500
      dark:from-slate-900 dark:to-slate-800
      text-white shadow-lg rounded-r-3xl z-40 overflow-y-auto">
      <div className="px-4 pt-6 pb-2 text-sm uppercase tracking-wide font-bold opacity-90">
        Navigation
      </div>

      <ul className="flex flex-col items-start pl-4 pr-3 space-y-2 text-sm font-medium">
        {navItems.map(({ icon, text, path }) => {
          const active = isActive(path);
          return (
            <li
              key={text}
              onClick={() => navigate(path)}
              className={[
                'flex items-center gap-3 px-3 py-2 rounded-lg w-full cursor-pointer transition duration-200',
                active
                  ? 'bg-white text-emerald-700 font-semibold dark:bg-slate-700 dark:text-emerald-100'
                  : 'hover:bg-emerald-600/70 dark:hover:bg-slate-700',
              ].join(' ')}
            >
              <span className="text-lg">{icon}</span> {text}
            </li>
          );
        })}

        <div className="w-full border-t border-white/40 dark:border-white/10 my-3" />

        <li
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg w-full cursor-pointer
            hover:bg-red-500/90 dark:hover:bg-red-600/70 transition duration-200"
        >
          <FaSignOutAlt className="text-lg" /> Logout
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
