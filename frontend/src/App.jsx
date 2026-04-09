import { Routes, Route, Navigate } from "react-router-dom";
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

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/studentDashboard" element={<StudentDashboard />} />

        {/* TEACHER ROUTES */}
        <Route path="/teacher" element={<Teacher />}>
          {/* These will render inside the <Outlet /> of the Teacher component */}
          <Route
            path="dashboard"
            element={<TeacherDahboard/>}
          />
          <Route path="lessons" element={<AddLessons/>} />
          <Route path="students" element={<Students/>} />
        </Route>

        <Route path="/*" element={<Student />}>
          {/* Default to dashboard if just /student is visited */}
          <Route index element={<Navigate to="dashboard" />} />

          {/* Nested child routes */}
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="lessons" element={<Lessons />} />
          <Route path="games" element={<Games />} />
          <Route path="feedback" element={<Feedback />} />
        </Route>

        {/* Home/Dashboard Route */}
      </Routes>
    </div>
  );
}

export default App;
