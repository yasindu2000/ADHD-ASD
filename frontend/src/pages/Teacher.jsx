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
    <div className="flex min-h-screen bg-[#FDF2F8]"> {/* Slightly different background color to distinguish from Student */}
      
      {/* LEFT SIDEBAR - Fixed */}
      <aside className="w-90 bg-[#FCE7F3] p-6 hidden md:flex flex-col shadow-lg fixed h-full border-r border-pink-200">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-white rounded-full border-2 border-pink-400 flex items-center justify-center font-bold text-pink-600">
            {/* Note: Ensure the path to your image is correct */}
            <img src="../../public/portal.png" alt="" className="" />
          </div>
           <h2 className="text-2xl font-extrabold tracking-wider  text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-indigo-500 drop-shadow-sm">
             TEACHER PORTAL
          </h2>
        </div>

        <nav className="space-y-3 font-mono tracking-wide uppercase flex-1">
          <NavItem 
            icon="📊" label="Dashboard" 
            active={isActive('/teacher/dashboard')} 
            onClick={() => navigate('/teacher/dashboard')} 
          />
          <NavItem 
            icon="📚" label="Lessons" 
            active={isActive('/teacher/lessons')} 
            onClick={() => navigate('/teacher/lessons')} 
          />
          <NavItem 
            icon="👥" label="Students" 
            active={isActive('/teacher/students')} 
            onClick={() => navigate('/teacher/students')} 
          />
        </nav>
        
        {/* Updated Logout Button */}
        <button 
          onClick={handleLogout}
          className="text-left text-2xl cursor-pointer uppercase p-3 text-gray-600 font-bold tracking-wide hover:text-red-500 transition-colors mt-auto"
        >
          🚪 Logout
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
    className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
      active ? 'bg-[#DB2777] text-white shadow-md' : 'text-gray-700 hover:bg-[#F9A8D4]'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="text-lg font-extrabold">{label}</span>
  </div>
);

export default Teacher;