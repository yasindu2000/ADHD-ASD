import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

function Principal() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.includes(path);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#F0F5FA] dark:bg-slate-900">
      {/* LEFT SIDEBAR - Fixed */}
      <aside className="w-90 bg-indigo-100 dark:bg-slate-800 p-6 hidden md:flex flex-col shadow-lg dark:shadow-none fixed h-full border-r border-indigo-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full border-2 border-indigo-500 dark:border-indigo-400 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>
          </div>
          <h2 className="text-2xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-indigo-600 dark:from-slate-200 dark:to-indigo-300 drop-shadow-sm">
            PRINCIPAL
          </h2>
        </div>

        <nav className="space-y-3 font-mono tracking-wide uppercase flex-1">
          <NavItem
            icon={<svg className="w-6 h-6" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"></path></svg>} 
            label="Dashboard"
            active={isActive('/principal/dashboard')}
            onClick={() => navigate('/principal/dashboard')}
          />
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-left text-2xl cursor-pointer uppercase p-3 text-gray-600 dark:text-slate-400 font-bold tracking-wide hover:text-red-500 dark:hover:text-red-400 transition-colors mt-auto"
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

const NavItem = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-300 dark:shadow-none' : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-200 dark:hover:bg-slate-700/50 hover:text-indigo-900 dark:hover:text-indigo-300'
      }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="text-lg font-extrabold">{label}</span>
  </div>
);

export default Principal;
