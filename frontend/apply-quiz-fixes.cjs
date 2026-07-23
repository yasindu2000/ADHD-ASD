const fs = require('fs');
let content = fs.readFileSync('src/pages/teacher/AddQuiz.jsx', 'utf-8');

// 1. Question input text color
content = content.replace(
  /className="w-full bg-transparent border-b-2 border-gray-100 dark:border-slate-700/g,
  'className="w-full text-slate-800 dark:text-slate-100 bg-transparent border-b-2 border-gray-100 dark:border-slate-700'
);

// 2. Option Wrapper Background
content = content.replace(
  /isCorrect \? 'bg-green-50 border-green-200' : 'bg-transparent border-transparent hover:bg-gray-50 dark:bg-slate-900\/50 '/g,
  'isCorrect ? \'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800/50\' : \'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-slate-800/50\''
);

// 3. Option Letter Color
content = content.replace(
  /text-gray-400 dark:text-slate-500/g,
  'text-gray-400 dark:text-slate-300'
);

// 4. Option Input Text Color
content = content.replace(
  /className=\{`flex-1 border \$\{isCorrect \? 'border-green-300 bg-white dark:bg-slate-800 ' : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900\/50 '}/g,
  'className={`flex-1 text-slate-800 dark:text-slate-100 border ${isCorrect ? \'border-green-300 bg-white dark:bg-slate-800\' : \'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50\'}'
);

fs.writeFileSync('src/pages/teacher/AddQuiz.jsx', content);
console.log('Fixed AddQuiz.jsx');
