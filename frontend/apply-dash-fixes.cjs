const fs = require('fs');

let td = fs.readFileSync('src/pages/teacher/TeacherDahboard.jsx', 'utf-8');

// Fix Tooltips
td = td.replace(
  /<Tooltip cursor=\{\{ fill: '#F1F5F9' \}\} contentStyle=\{\{ backgroundColor: 'rgba\\(255, 255, 255, 0\\.95\\)', borderRadius: '16px', fontWeight: 'bold', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba\\(0,0,0,0\\.1\\)' \}\} \/>/g,
  '<Tooltip cursor={{ fill: theme === "dark" ? "#334155" : "#F1F5F9" }} contentStyle={{ backgroundColor: theme === "dark" ? "rgba(30, 41, 59, 0.95)" : "rgba(255, 255, 255, 0.95)", color: theme === "dark" ? "#F8FAFC" : "#1E293B", borderRadius: "16px", fontWeight: "bold", border: theme === "dark" ? "1px solid #334155" : "1px solid #E2E8F0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }} />'
);

td = td.replace(
  /<Tooltip contentStyle=\{\{ backgroundColor: 'rgba\\(255, 255, 255, 0\\.95\\)', borderRadius: '16px', fontWeight: 'bold', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba\\(0,0,0,0\\.1\\)' \}\} \/>/g,
  '<Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "rgba(30, 41, 59, 0.95)" : "rgba(255, 255, 255, 0.95)", color: theme === "dark" ? "#F8FAFC" : "#1E293B", borderRadius: "16px", fontWeight: "bold", border: theme === "dark" ? "1px solid #334155" : "1px solid #E2E8F0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }} />'
);

// Fix bg-indigo-50 instances
td = td.replace(/bg-indigo-50(?! dark:)/g, 'bg-indigo-50 dark:bg-indigo-900/30');
td = td.replace(/text-indigo-600(?! dark:)/g, 'text-indigo-600 dark:text-indigo-400');
td = td.replace(/border-indigo-100(?! dark:)/g, 'border-indigo-100 dark:border-indigo-700/50');
td = td.replace(/bg-teal-50(?! dark:)/g, 'bg-teal-50 dark:bg-teal-900/30');
td = td.replace(/text-teal-600(?! dark:)/g, 'text-teal-600 dark:text-teal-400');
td = td.replace(/border-teal-100(?! dark:)/g, 'border-teal-100 dark:border-teal-700/50');

fs.writeFileSync('src/pages/teacher/TeacherDahboard.jsx', td);

let st = fs.readFileSync('src/pages/teacher/Students.jsx', 'utf-8');
st = st.replace(/bg-slate-100 hover:bg-slate-200 text-slate-600/g, 'bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600/50 text-slate-600');
fs.writeFileSync('src/pages/teacher/Students.jsx', st);

let fb = fs.readFileSync('src/pages/teacher/AddFeedback.jsx', 'utf-8');
fb = fb.replace(/from-slate-50 to-blue-50/g, 'from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900');
fb = fb.replace(/bg-slate-100 hover:bg-slate-200 text-slate-600/g, 'bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600/50 text-slate-600');
fs.writeFileSync('src/pages/teacher/AddFeedback.jsx', fb);
