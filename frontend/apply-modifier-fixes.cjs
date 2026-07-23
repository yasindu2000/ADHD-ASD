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
  // Fix focus backgrounds
  { regex: /focus:bg-white(?! dark:focus:bg-)/g, replacement: 'focus:bg-white dark:focus:bg-slate-800' },
  
  // Fix hover backgrounds in subject cards in AddLessons
  { regex: /hover:bg-blue-50(?! dark:hover:bg-)/g, replacement: 'hover:bg-blue-50 dark:hover:bg-blue-900/30' },
  { regex: /hover:bg-indigo-50(?! dark:hover:bg-)/g, replacement: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30' },
  { regex: /hover:bg-orange-50(?! dark:hover:bg-)/g, replacement: 'hover:bg-orange-50 dark:hover:bg-orange-900/30' },
  { regex: /hover:bg-emerald-50(?! dark:hover:bg-)/g, replacement: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30' },

  // Fix borders in subject cards
  { regex: /border-blue-50(?! dark:border-)/g, replacement: 'border-blue-50 dark:border-slate-700' },
  { regex: /border-indigo-50(?! dark:border-)/g, replacement: 'border-indigo-50 dark:border-slate-700' },
  { regex: /border-orange-50(?! dark:border-)/g, replacement: 'border-orange-50 dark:border-slate-700' },
  { regex: /border-emerald-50(?! dark:border-)/g, replacement: 'border-emerald-50 dark:border-slate-700' },
  
  // Fix hover borders in subject cards
  { regex: /hover:border-blue-200(?! dark:hover:border-)/g, replacement: 'hover:border-blue-200 dark:hover:border-blue-500/50' },
  { regex: /hover:border-indigo-200(?! dark:hover:border-)/g, replacement: 'hover:border-indigo-200 dark:hover:border-indigo-500/50' },
  { regex: /hover:border-orange-200(?! dark:hover:border-)/g, replacement: 'hover:border-orange-200 dark:hover:border-orange-500/50' },
  { regex: /hover:border-emerald-200(?! dark:hover:border-)/g, replacement: 'hover:border-emerald-200 dark:hover:border-emerald-500/50' },
  
  // Fix focus rings
  { regex: /focus:ring-blue-500(?! dark:focus:ring-)/g, replacement: 'focus:ring-blue-500 dark:focus:ring-blue-400' },

  // Fix inner container backgrounds that are white
  { regex: /bg-white(?!\s+dark:bg-slate-)(?![a-zA-Z0-9_-])/g, replacement: 'bg-white dark:bg-slate-800' }
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
  
  // Remove accidental trailing dark:bg-slate-800 if they got doubled up during testing
  content = content.replace(/(dark:bg-slate-800\s*)+/g, 'dark:bg-slate-800 ');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
});
