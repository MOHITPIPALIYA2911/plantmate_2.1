// AppLayout.jsx (parent layout file)
import React from 'react';
import Navbar from './component/navbar/Navbar';
import Sidebar from './component/sidebar/Sidebar';

const AppLayout = ({ children }) => {
  return (
    <div>
      
      <Sidebar />
      <div className="ml-44 mt-16 p-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
        <Navbar />
        <div className='px-14'>
        {children}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
