// src/component/Sidebar.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaMapMarkerAlt,
  FaLeaf,
  FaTint,
  FaCalendarAlt,
  FaCog,
  FaSignOutAlt,
  FaTimes,
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Sidebar = ({ isOpen, onClose }) => {
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

  const handleNavClick = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  // Close sidebar on route change (mobile) - but only if it's actually open
  const prevPathRef = useRef(location.pathname);
  useEffect(() => {
    // Only close if path actually changed AND sidebar is open
    const pathChanged = prevPathRef.current !== location.pathname;
    if (pathChanged && isOpen && window.innerWidth < 768) {
      onClose();
    }
    prevPathRef.current = location.pathname;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navItems = [
    { icon: <FaHome />, text: 'Dashboard', path: '/dashboard' },
    { icon: <FaMapMarkerAlt />, text: 'Spaces', path: '/spaces' },
    { icon: <FaLeaf />, text: 'My Plants', path: '/plants' },
    { icon: <FaTint />, text: 'Care Tasks', path: '/care' },
    { icon: <FaCalendarAlt />, text: 'Calendar', path: '/calendar' },
    { icon: <FaCog />, text: 'Settings', path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          style={{ touchAction: 'manipulation', pointerEvents: isOpen ? 'auto' : 'none' }}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-56
          bg-gradient-to-b from-emerald-700 to-emerald-500
          dark:from-slate-900 dark:to-slate-800
          text-white shadow-lg rounded-r-3xl z-50 overflow-y-auto
          transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        style={{ 
          touchAction: 'pan-y',
          zIndex: isOpen ? 90 : 50,
          pointerEvents: 'auto'
        }}
      >
        {/* Mobile Close Button */}
        <div className="md:hidden flex justify-end p-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="p-2 rounded-lg hover:bg-emerald-600/70 dark:hover:bg-slate-700 transition-colors z-50 relative touch-manipulation cursor-pointer"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            aria-label="Close sidebar"
          >
            <FaTimes className="text-lg pointer-events-none" />
          </button>
        </div>

        <div className="px-4 pt-2 md:pt-6 pb-2 text-sm uppercase tracking-wide font-bold opacity-90">
          Navigation
        </div>

        <ul className="flex flex-col items-start pl-4 pr-3 space-y-2 text-sm font-medium pb-4">
          {navItems.map(({ icon, text, path }) => {
            const active = isActive(path);
            return (
              <li
                key={text}
                onClick={() => handleNavClick(path)}
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
    </>
  );
};

export default Sidebar;
