const fs = require('fs');
const path = require('path');

const filesToProcess = [
  'src/pages/teacher/AddLessons.jsx',
  'src/pages/teacher/AddFeedback.jsx',
  'src/pages/teacher/AddQuiz.jsx',
  'src/pages/teacher/Students.jsx',
  'src/pages/teacher/TeacherDahboard.jsx',
  'src/pages/principal/PrincipalDashboard.jsx'
];

filesToProcess.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // Fix the specific blur circle in AddLessons
  content = content.replace(/bg-white dark:bg-slate-800 \/40 blur-2xl/g, 'bg-white/40 dark:bg-slate-100/10 blur-2xl');
  
  // Fix other broken opacities
  content = content.replace(/dark:bg-slate-800 \/95/g, 'dark:bg-slate-800/95');
  content = content.replace(/dark:bg-slate-800 \/20/g, 'dark:bg-slate-800/20');
  content = content.replace(/dark:bg-slate-800 \/(\d+)/g, 'dark:bg-slate-800/$1');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
});
