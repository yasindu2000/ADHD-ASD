import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

function Teacher() {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to check if a link is active
  const isActive = (path) => location.pathname.includes(path);

  // Handle Logout Logic
  const handleLogout = () => {
    // 1. Remove the saved token and role from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    // LOGOUT SUCCESS TOAST
    toast.success("Logged out successfully!");

    // 2. Redirect to the login page
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#F0F5FA]"> {/* Match dashboard background color */}

      {/* LEFT SIDEBAR - Fixed */}
      <aside className="w-90 bg-blue-100 p-6 hidden md:flex flex-col shadow-lg fixed h-full border-r border-blue-200">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-white rounded-full border-2 border-blue-500 flex items-center justify-center font-bold text-blue-700">
            {/* Note: Ensure the path to your image is correct */}
            <img src="../../public/portal.png" alt="" className="" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-wider  text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-indigo-500 drop-shadow-sm">
            TEACHER PORTAL
          </h2>
        </div>

        <nav className="space-y-3 font-mono tracking-wide uppercase flex-1">
          <NavItem
            icon={<svg className="w-6 h-6" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"></path></svg>} 
            label="Dashboard"
            active={isActive('/teacher/dashboard')}
            onClick={() => navigate('/teacher/dashboard')}
          />
          <NavItem
            icon={<svg className="w-6 h-6" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zM21 18.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"></path></svg>} 
            label="Add Lessons"
            active={isActive('/teacher/lessons')}
            onClick={() => navigate('/teacher/lessons')}
          />
          <NavItem
            icon={<svg className="w-6 h-6" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path></svg>} 
            label="Students"
            active={isActive('/teacher/students')}
            onClick={() => navigate('/teacher/students')}
          />

          <NavItem
            icon={<svg className="w-6 h-6" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>} 
            label="Add Feedback"
            active={isActive('/teacher/feedback')}
            onClick={() => navigate('/teacher/feedback')}
          />
        </nav>

        {/* Updated Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-left text-2xl cursor-pointer uppercase p-3 text-gray-600 font-bold tracking-wide hover:text-red-500 transition-colors mt-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
          </svg>
          Logout
        </button>
      </aside>

      {/* RIGHT SIDE CONTENT */}
      <main className="flex-1 ml-90 p-8">
        <Outlet />
      </main>
    </div>
  );
}

// Sidebar Button Component (Internal to this file or move to a Shared UI folder)
const NavItem = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${active ? 'bg-blue-500 text-white shadow-md shadow-blue-300' : 'text-slate-700 hover:bg-blue-200 hover:text-blue-900'
      }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="text-lg font-extrabold">{label}</span>
  </div>
);

export default Teacher;