import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useSensory } from '../../context/SensoryContext';

function PrincipalDashboard() {
  const { theme, setTheme, playUiSound } = useSensory();
  const [data, setData] = useState({
    stats: { totalStudents: 0, totalTeachers: 0 },
    teachers: [],
    students: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/principal/dashboard-stats', {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const result = await response.json();
      if (result.success) {
        setData({
          stats: result.stats,
          teachers: result.teachers,
          students: result.students
        });
      } else {
        toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-bold text-indigo-500 text-2xl animate-pulse">
        <svg className="animate-spin h-8 w-8 text-indigo-500 mr-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Loading School Data...
      </div>
    );
  }

  const staticGrades = ['1', '2', '3', '4', '5'];

  const filteredStudents = data.students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === '' || String(student.grade) === selectedGrade;
    
    let matchesDate = true;
    if (selectedDate) {
      if (student.activeDates && student.activeDates.includes(selectedDate)) {
        matchesDate = true;
      } else {
        matchesDate = false;
      }
    }

    return matchesSearch && matchesGrade && matchesDate;
  });

  const filteredTeachers = data.teachers.filter(teacher => {
    const matchesSearch = teacher.fullName.toLowerCase().includes(teacherSearchTerm.toLowerCase()) || 
                          teacher.email.toLowerCase().includes(teacherSearchTerm.toLowerCase());
    return matchesSearch;
  });

  const downloadStudentReport = () => {
    if (filteredStudents.length === 0) {
      toast.error("No students to download");
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Student Performance Report", 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["Student Name", "Grade", "Lessons Completed", "Quizzes Taken", "Avg Score (%)"];
    const tableRows = [];

    filteredStudents.forEach(student => {
      const studentData = [
        student.fullName,
        student.grade || 'No Grade',
        student.completedLessons,
        student.quizzesTaken,
        `${student.averageScore}%`
      ];
      tableRows.push(studentData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }, // indigo-600
    });

    doc.save("Student_Performance_Report.pdf");
    toast.success("PDF Downloaded successfully!");
  };

  const resetStudentFilters = () => {
    setSearchTerm('');
    setSelectedGrade('');
    setSelectedDate('');
  };

  return (
    <div className="font-sans">
      
      {/* HEADER SECTION */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            School <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Overview</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 text-lg">
            Monitor overall student performance and teacher details.
          </p>
        </div>
        
        {/* Theme Toggle */}
        <div className="flex bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-full p-1 gap-1">
          <button 
            onClick={() => { setTheme('light'); playUiSound && playUiSound(); }} 
            className={`p-2 rounded-full transition-all flex items-center justify-center ${theme === 'light' ? 'bg-amber-100 text-amber-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            title="Light Theme"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </button>
          <button 
            onClick={() => { setTheme('dark'); playUiSound && playUiSound(); }} 
            className={`p-2 rounded-full transition-all flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            title="Dark Theme"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700/50 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">Total Students</p>
            <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100 ">{data.stats.totalStudents}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700/50 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">Total Teachers</p>
            <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100 ">{data.stats.totalTeachers}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* STUDENTS PERFORMANCE TABLE */}
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700/50 ">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 ">Student Performance (Marks)</h2>
            <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap">
              {filteredStudents.length} Students
            </span>
          </div>

          {/* FILTER & SEARCH */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <input
              type="text"
              placeholder="Search students..."
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent flex-1 min-w-[200px] text-slate-700 dark:text-slate-200 "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 min-w-[120px]"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="">All Grades</option>
              {staticGrades.map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
            <input
              type="date"
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 min-w-[150px]"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button
              onClick={downloadStudentReport}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm dark:shadow-none transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Download PDF
            </button>
            <button
              onClick={resetStudentFilters}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold rounded-xl shadow-sm dark:shadow-none transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Reset
            </button>
          </div>


          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-100 dark:border-slate-700/50 text-slate-400 uppercase text-xs tracking-wider">
                  <th className="pb-4 font-bold">Student Name</th>
                  <th className="pb-4 font-bold text-center">Lessons Completed</th>
                  <th className="pb-4 font-bold text-center">Quizzes Taken</th>
                  <th className="pb-4 font-bold text-right">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900/50 transition-colors group">
                    <td className="py-4">
                      <div className="font-bold text-slate-700 dark:text-slate-200 ">{student.fullName}</div>
                      <div className="text-xs text-slate-400 font-medium">{student.grade || 'No Grade'}</div>
                    </td>
                    <td className="py-4 text-center font-bold text-slate-600 dark:text-slate-300 ">
                      {student.completedLessons}
                    </td>
                    <td className="py-4 text-center font-bold text-slate-600 dark:text-slate-300 ">
                      {student.quizzesTaken}
                    </td>
                    <td className="py-4 text-right">
                      <span className={`inline-block px-3 py-1 rounded-xl text-sm font-bold
                        ${student.averageScore >= 75 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 
                          student.averageScore >= 50 ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 
                          'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}
                      >
                        {student.averageScore}%
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400 font-bold">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TEACHERS LIST TABLE */}
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700/50 ">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 ">Teacher Directory</h2>
            <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap">
              {filteredTeachers.length} Teachers
            </span>
          </div>

          {/* TEACHER SEARCH */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search teachers by name or email..."
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent flex-1 text-slate-700 dark:text-slate-200 "
              value={teacherSearchTerm}
              onChange={(e) => setTeacherSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-100 dark:border-slate-700/50 text-slate-400 uppercase text-xs tracking-wider">
                  <th className="pb-4 font-bold">Teacher Name</th>
                  <th className="pb-4 font-bold">Email Address</th>
                  <th className="pb-4 font-bold text-right">Phone Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900/50 transition-colors group">
                    <td className="py-4 font-bold text-slate-700 dark:text-slate-200 ">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 uppercase">
                          {teacher.fullName.charAt(0)}
                        </div>
                        {teacher.fullName}
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 dark:text-slate-400 font-medium">
                      {teacher.email}
                    </td>
                    <td className="py-4 text-right font-mono text-slate-600 dark:text-slate-300 font-bold">
                      {teacher.phone || 'N/A'}
                    </td>
                  </tr>
                ))}
                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-400 font-bold">
                      No teachers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PrincipalDashboard;
