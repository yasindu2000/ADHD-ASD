import { Outlet, useNavigate, useLocation } from "react-router-dom";
import toast from 'react-hot-toast';

function Student() {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to check if a link is active
  const isActive = (path) => location.pathname.includes(path);

  // Handle Logout Logic
  const handleLogout = () => {
    // 1. Remove the saved token and role from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.clear();
    // LOGOUT SUCCESS TOAST
    toast.success("Logged out successfully!");
    // 2. Redirect to the login page
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#F0F9FF]">
      {/* LEFT SIDEBAR - Fixed */}
      <aside className="w-90 bg-[#CCF2FF] p-6 hidden md:flex flex-col shadow-lg fixed h-full">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-white rounded-full border-2 border-indigo-400 flex items-center justify-center font-bold text-indigo-600">
            <img src="../../public/portal.png" alt="" className="" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-wider  text-transparent bg-clip-text bg-linear-to-r from-gray-800 to-indigo-500 drop-shadow-sm">
            STUDENT PORTAL
          </h2>
        </div>

        <nav className="space-y-3 font-mono tracking-wider uppercase flex-1">
          <NavItem
            icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>}
            label="Dashboard"
            active={isActive("/dashboard")}
            onClick={() => navigate("/dashboard")}
          />
          <NavItem
            icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>}
            label="Lessons"
            active={isActive("/lessons")}
            onClick={() => navigate("/lessons")}
          />
          <NavItem
            icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path></svg>}
            label="Games"
            active={isActive("/games")}
            onClick={() => navigate("/games")}
          />
          <NavItem
            icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>}
            label="FeedBacks"
            active={isActive("/feedback")}
            onClick={() => navigate("/feedback")}
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

      {/* RIGHT SIDE CONTENT - Changes based on Route */}
      <main className="flex-1 ml-90 p-8">
        {/* The <Outlet /> is where the sub-pages (Dashboard, Lessons, etc.) will appear */}
        <Outlet />
      </main>
    </div>
  );
}

// Sidebar Button Component
const NavItem = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
      active
        ? "bg-[#0EA5E9] text-white shadow-md"
        : "text-gray-700 hover:bg-[#B3E5F5]"
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="text-lg font-extrabold">{label}</span>
  </div>
);

export default Student;