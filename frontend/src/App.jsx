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
// import TakeQuiz from "./pages/student/TakeQuiz"; // (Passe meka uncomment karanna)

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
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* TEACHER ROUTES */}
        <Route path="/teacher" element={<Teacher />}>
          <Route path="dashboard" element={<TeacherDahboard/>} />
          <Route path="add-quiz/:lessonId" element={<AddQuiz />} />
          <Route path="lessons" element={<AddLessons/>} />
          <Route path="students" element={<Students/>} />
        </Route>

        {/* STUDENT ROUTES (Wrapped inside Student Layout) */}
        <Route path="/*" element={<Student />}>
          {/* Default Route */}
          <Route index element={<Navigate to="dashboard" />} />

          {/* Child Routes - Mewa okkoma <Outlet /> eke load wenne */}
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="lessons" element={<Lessons />} />
          <Route path="lessons/:subjectName" element={<SubjectLessons />} />
          <Route path="lesson-view/:lessonId" element={<LessonView />} />
          <Route path="quiz/:quizId" element={<TakeQuiz/>} />
          <Route path="games" element={<Games />} />
          <Route path="feedback" element={<Feedback />} />
          {/* <Route path="quiz/:quizId" element={<TakeQuiz />} /> */}
        </Route>

        
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