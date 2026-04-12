import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Register from "./pages/Register";
import Login from "./pages/Login";
import StudentDashboard from "./pages/student/StudentDashboard";
import Student from "./pages/Student";
import Lessons from "./pages/student/Lessons";
import Games from "./pages/student/Games";
import Feedback from "./pages/student/Feedback";
import Teacher from "./pages/Teacher";
import TeacherDahboard from "./pages/teacher/TeacherDahboard";
import AddLessons from "./pages/teacher/AddLessons";
import Students from "./pages/teacher/Students";
import SubjectLessons from "./pages/student/SubjectLessons";
import LessonView from "./pages/student/LessonView";
import AddQuiz from "./pages/teacher/AddQuiz";
import TakeQuiz from "./pages/student/TakeQuiz";
import MemoryMatch from "./pages/student/MemoryMatch";
import BalloonPop from "./pages/student/BalloonPop";
import PatternPuzzle from "./pages/student/PatternPuzzle";
import MathCatch from "./pages/student/MathCatch";
import BreakTimer from "./pages/student/BreakTimer";
import AddFeedback from "./pages/teacher/AddFeedback";

// 🌟 1. PROTECTED ROUTE (ලොග් වෙලා නැති අයව එළවන Guard)
const ProtectedRoute = ({ children, allowedRole }) => {
  const currentRole = localStorage.getItem("userRole") || localStorage.getItem("role");

  if (currentRole !== allowedRole) {
    return <Navigate to="/login" replace />; 
  }
  return children;
};

// 🌟 2. PUBLIC ROUTE (දැනටමත් ලොග් වෙලා ඉන්න අයව Login එකෙන් එළවන Guard)
const PublicRoute = ({ children }) => {
  const currentRole = localStorage.getItem("userRole") || localStorage.getItem("role");

  // ලොග් වෙලා ඉන්න කෙනා Teacher කෙනෙක් නම්, කෙලින්ම Dashboard එකට යවනවා
  if (currentRole === "teacher") {
    return <Navigate to="/teacher/dashboard" replace />;
  }
  // ලොග් වෙලා ඉන්න කෙනා Student කෙනෙක් නම්, කෙලින්ම Dashboard එකට යවනවා
  else if (currentRole === "student") {
    return <Navigate to="/dashboard" replace />;
  }

  // ලොග් වෙලා නැත්නම් විතරක් Login/Register එකට යන්න දෙනවා
  return children;
};

function App() {
  return (
    <div className="App">
      
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
          },
        }} 
      />

      <Routes>
        {/* 🌟 PUBLIC ROUTES (PublicRoute Guard එක දාලා තියෙන්නේ) */}
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
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

        {/* 🌟 TEACHER ROUTES */}
        <Route 
          path="/teacher" 
          element={
            <ProtectedRoute allowedRole="teacher">
              <Teacher />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<TeacherDahboard/>} />
          <Route path="add-quiz/:lessonId" element={<AddQuiz />} />
          <Route path="lessons" element={<AddLessons/>} />
          <Route path="students" element={<Students/>} />
          <Route path="feedback" element={<AddFeedback/>} />
        </Route>

        {/* 🌟 STUDENT ROUTES */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute allowedRole="student">
              <Student />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="lessons" element={<Lessons />} />
          <Route path="lessons/:subjectName" element={<SubjectLessons />} />
          <Route path="lesson-view/:lessonId" element={<LessonView />} />
          <Route path="quiz/:quizId" element={<TakeQuiz/>} />
          <Route path="games" element={<Games />} />
          <Route path="feedback" element={<Feedback />} />
        </Route>

        {/* STANDALONE ROUTES */}
        <Route path="/games/memory-match" element={<MemoryMatch />} />
        <Route path="/games/balloon-pop" element={<BalloonPop />} />
        <Route path="/games/pattern-puzzle" element={<PatternPuzzle />} />
        <Route path="/games/math-catch" element={<MathCatch />} />
        <Route path="/break-timer" element={<BreakTimer />} />

      </Routes>
    </div>
  );
}

export default App;