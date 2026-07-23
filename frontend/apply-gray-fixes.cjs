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
  // Aggressively match bg-white where not followed by / or dark:
  { regex: /bg-white(?!\/)(?!\s+dark:)/g, replacement: 'bg-white dark:bg-slate-800' },
  
  // Grays
  { regex: /bg-gray-50/g, replacement: 'bg-gray-50 dark:bg-slate-900/50' },
  { regex: /text-gray-900/g, replacement: 'text-gray-900 dark:text-slate-100' },
  { regex: /text-gray-800/g, replacement: 'text-gray-800 dark:text-slate-200' },
  { regex: /text-gray-500/g, replacement: 'text-gray-500 dark:text-slate-400' },
  { regex: /text-gray-400/g, replacement: 'text-gray-400 dark:text-slate-500' },
  { regex: /border-gray-100/g, replacement: 'border-gray-100 dark:border-slate-700/50' },
  { regex: /border-gray-200/g, replacement: 'border-gray-200 dark:border-slate-700' },
  { regex: /border-gray-300/g, replacement: 'border-gray-300 dark:border-slate-600' },
  
  // Lesson specific fixes (e.g., text-slate-800 without dark variant)
  { regex: /text-slate-800(?!\s+dark:)/g, replacement: 'text-slate-800 dark:text-slate-200' },
  { regex: /text-slate-600(?!\s+dark:)/g, replacement: 'text-slate-600 dark:text-slate-300' },
  
  // Math card or subject cards bg-white that might have been in strings like "bg-white "
  { regex: /"bg-white"/g, replacement: '"bg-white dark:bg-slate-800"' },
  { regex: /'bg-white'/g, replacement: "'bg-white dark:bg-slate-800'" },
  { regex: /`bg-white`/g, replacement: "`bg-white dark:bg-slate-800`" },
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

  // Cleanup duplicates
  content = content.replace(/(dark:bg-slate-800\s*)+/g, 'dark:bg-slate-800 ');
  content = content.replace(/(dark:bg-slate-900\/50\s*)+/g, 'dark:bg-slate-900/50 ');
  content = content.replace(/(dark:text-slate-100\s*)+/g, 'dark:text-slate-100 ');
  content = content.replace(/(dark:text-slate-200\s*)+/g, 'dark:text-slate-200 ');
  content = content.replace(/(dark:text-slate-400\s*)+/g, 'dark:text-slate-400 ');
  content = content.replace(/(dark:text-slate-500\s*)+/g, 'dark:text-slate-500 ');
  content = content.replace(/(dark:border-slate-700\s*)+/g, 'dark:border-slate-700 ');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
});
