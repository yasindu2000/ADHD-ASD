const fs = require('fs');
const path = require('path');

const filesToProcess = [
  'src/pages/teacher/AddLessons.jsx',
  'src/pages/teacher/AddFeedback.jsx',
  'src/pages/teacher/AddQuiz.jsx',
  'src/pages/teacher/Students.jsx',
  'src/pages/principal/PrincipalDashboard.jsx'
];

const replacements = [
  // Backgrounds
  { regex: /bg-white(?!\/)/g, replacement: 'bg-white dark:bg-slate-800' },
  { regex: /bg-slate-50(?!\/)/g, replacement: 'bg-slate-50 dark:bg-slate-900/50' },
  { regex: /bg-\[\#F0F5FA\]/g, replacement: 'bg-[#F0F5FA] dark:bg-slate-900' },
  { regex: /bg-\[\#F8FAFC\]/g, replacement: 'bg-[#F8FAFC] dark:bg-slate-900' },
  
  // Text
  { regex: /text-slate-800/g, replacement: 'text-slate-800 dark:text-slate-100' },
  { regex: /text-slate-700/g, replacement: 'text-slate-700 dark:text-slate-200' },
  { regex: /text-slate-600/g, replacement: 'text-slate-600 dark:text-slate-300' },
  { regex: /text-slate-500/g, replacement: 'text-slate-500 dark:text-slate-400' },
  
  // Borders
  { regex: /border-slate-100/g, replacement: 'border-slate-100 dark:border-slate-700/50' },
  { regex: /border-slate-200/g, replacement: 'border-slate-200 dark:border-slate-700' },
  { regex: /border-slate-300/g, replacement: 'border-slate-300 dark:border-slate-600' },
  
  // Shadows (optional, soften them in dark mode)
  { regex: /shadow-sm/g, replacement: 'shadow-sm dark:shadow-none' },
  { regex: /shadow-md/g, replacement: 'shadow-md dark:shadow-none' },
  { regex: /shadow-lg/g, replacement: 'shadow-lg dark:shadow-none' },
  { regex: /shadow-xl/g, replacement: 'shadow-xl dark:shadow-none' },
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
    // We only replace if the dark: counterpart doesn't already exist immediately after
    // This is tricky with simple regex, so we'll do a simple replace and then clean up duplicates
    content = content.replace(rule.regex, rule.replacement);
  });

  // Cleanup potential duplicates (e.g., bg-white dark:bg-slate-800 dark:bg-slate-800)
  content = content.replace(/(dark:bg-slate-800\s*)+/g, 'dark:bg-slate-800 ');
  content = content.replace(/(dark:bg-slate-900\/50\s*)+/g, 'dark:bg-slate-900/50 ');
  content = content.replace(/(dark:bg-slate-900\s*)+/g, 'dark:bg-slate-900 ');
  
  content = content.replace(/(dark:text-slate-100\s*)+/g, 'dark:text-slate-100 ');
  content = content.replace(/(dark:text-slate-200\s*)+/g, 'dark:text-slate-200 ');
  content = content.replace(/(dark:text-slate-300\s*)+/g, 'dark:text-slate-300 ');
  content = content.replace(/(dark:text-slate-400\s*)+/g, 'dark:text-slate-400 ');
  
  content = content.replace(/(dark:border-slate-700\/50\s*)+/g, 'dark:border-slate-700/50 ');
  content = content.replace(/(dark:border-slate-700\s*)+/g, 'dark:border-slate-700 ');
  content = content.replace(/(dark:border-slate-600\s*)+/g, 'dark:border-slate-600 ');
  
  content = content.replace(/(dark:shadow-none\s*)+/g, 'dark:shadow-none ');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
});
