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

const replacements = [
  // Fix text-black
  { regex: /text-black(?! dark:text-)/g, replacement: 'text-black dark:text-slate-100' },
  
  // Fix broken opacity classes
  { regex: /dark:bg-slate-800 \/80/g, replacement: 'dark:bg-slate-800/80' },
  { regex: /dark:bg-slate-800 \/50/g, replacement: 'dark:bg-slate-800/50' },
  { regex: /dark:border-slate-700 \/50/g, replacement: 'dark:border-slate-700/50' },
  { regex: /dark:bg-slate-900 \/50/g, replacement: 'dark:bg-slate-900/50' },

  // Fix hover states
  { regex: /hover:bg-white(?! dark:hover:bg-)/g, replacement: 'hover:bg-white dark:hover:bg-slate-700' },
  { regex: /hover:bg-slate-50(?! dark:hover:bg-)/g, replacement: 'hover:bg-slate-50 dark:hover:bg-slate-700' },
  { regex: /hover:bg-slate-50\/80(?! dark:hover:bg-)/g, replacement: 'hover:bg-slate-50/80 dark:hover:bg-slate-700/80' },
];

filesToProcess.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  replacements.forEach(rule => {
    content = content.replace(rule.regex, rule.replacement);
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
});
