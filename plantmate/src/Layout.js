// AppLayout.jsx (parent layout file)
import React, { useState, useCallback } from 'react';
import Navbar from './component/navbar/Navbar';
import Sidebar from './component/sidebar/Sidebar';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div>
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="md:ml-56 mt-16 p-4 sm:p-6 bg-gray-50 dark:bg-slate-900 min-h-screen" style={{ position: 'relative', zIndex: 1 }}>
        <Navbar onToggleSidebar={toggleSidebar} />
        <div className='px-2 sm:px-4 md:px-8 lg:px-14'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
