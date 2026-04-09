import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';

function Register() {
  // Navigation hook
  const navigate = useNavigate();

  // State for form inputs
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");
  const [phone, setPhone] = useState("");
  const [grade, setGrade] = useState("");
  
  // State for UI behavior
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form Submit Handler
  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent page reload
    setError("");
    setLoading(true);

    try {
      // Send data to your backend
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          role,
          phone: role === "teacher" ? phone : undefined,
          grade: role === "student" ? grade : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // If successful, navigate to login page
        toast.success("Account created successfully! Please log in.");
        navigate("/login");
      } else {
        // If error (e.g., email already exists)
        toast.error(data.message || "Registration failed");
      }
    } catch (err) {
      toast.error("Server error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. Full-Screen Gradient Background
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-6">
      {/* 2. Main Container with full background image and rounded borders */}
      <div
        className="relative flex flex-col md:flex-row rounded-4xl shadow-[0_30px_80px_rgba(0,0,0,0.50)] overflow-hidden max-w-6xl w-full border border-white/40 min-h-[85vh]"
        style={{
          // PAHALA RUPAYA (Source) - public folder eke thiyena picture eka
          backgroundImage: "url('/rejister.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* 3. Dark Overlay to control background image visibility (Opacity) */}
        <div className="absolute inset-0 bg-gray-950/40 z-0"></div>

        {/* Left Side: Empty, but keeps the layout (optional heading) */}
        <div className="md:w-6/12 relative hidden md:block z-10 p-12 self-end">
          <h1 className="text-4xl font-extrabold font-mono text-gray-400 leading-tight drop-shadow-md">
            Empowering Every <br />
            Mind to Shine.
          </h1>
        </div>

        {/* 4. Right Side: Pure Glassmorphism Form Container */}
        <div className="md:w-6/12 p-8 md:p-14 z-20 flex items-center justify-center">
          {/* Glass Card for Form */}
          <div className="max-w-md w-full mx-auto bg-white/40 backdrop-blur-xl rounded-3xl p-10 shadow-xl border border-white/40">
            <h2 className="text-4xl font-bold ml-10 text-gray-950 mb-10 font-mono">
              Create Account
            </h2>

            <form className="space-y-4" onSubmit={handleRegister}>
              
              {/* Show Error Message if it exists */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 relative">
                  <span className="block sm:inline font-bold text-sm">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-white/60 border border-white/40 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all placeholder:text-gray-500 text-gray-950 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full bg-white/60 border border-white/40 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all placeholder:text-gray-500 text-gray-950 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/60 border border-white/40 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all placeholder:text-gray-500 text-gray-950 font-medium"
                  />
                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black "
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
                    Your Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-white/60 border border-white/40 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all appearance-none cursor-pointer text-gray-950 font-medium"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                {/* Conditional Input based on Role */}
                <div className="space-y-1 animate-in fade-in duration-500">
                  {role === "teacher" ? (
                    <>
                      <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required={role === "teacher"}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+94 7X XXX XXXX"
                        className="w-full bg-white/60 border border-white/40 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all placeholder:text-gray-500 text-gray-950 font-medium"
                      />
                    </>
                  ) : (
                    <>
                      <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
                        Current Grade
                      </label>
                      <select 
                        required={role === "student"}
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full bg-white/60 border border-white/40 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all appearance-none cursor-pointer text-gray-950 font-medium"
                      >
                        <option value="">Select Grade</option>
                        {[1, 2, 3, 4, 5].map((g) => (
                          <option key={g} value={g}>
                            Grade {g}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 transition-colors cursor-pointer tracking-wider text-white text-2xl font-bold py-4 rounded-3xl shadow-[0_10px_20px_rgba(22,163,74,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create My Account"}
                </button>
                <p className="mt-6 text-center text-sm font-semibold font-sans text-gray-800">
                  Already have an account?
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-indigo-900 ml-1 font-bold transition-colors"
                  >
                    Log In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;