const fs = require('fs');

let content = fs.readFileSync('src/pages/principal/PrincipalDashboard.jsx', 'utf-8');

// Badges inside table
content = content.replace(/bg-red-50 text-red-600/g, 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400');
content = content.replace(/bg-amber-50 text-amber-600/g, 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400');
content = content.replace(/bg-emerald-50 text-emerald-600/g, 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400');
content = content.replace(/bg-blue-50 text-blue-600/g, 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400');
content = content.replace(/bg-indigo-50 text-indigo-600/g, 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400');

// Header icons
content = content.replace(/w-14 h-14 rounded-2xl bg-blue-50 text-blue-600/g, 'w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400');
content = content.replace(/w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600/g, 'w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400');

// Fix bg-white instances without dark variants
// Reset button
content = content.replace(/bg-white hover:bg-slate-50 text-slate-400/g, 'bg-white hover:bg-slate-50 text-slate-600 dark:bg-slate-700/50 dark:hover:bg-slate-600/50 dark:text-slate-300');
// In case text-slate-400 is not text-slate-600 on light mode:
// Wait, my previous script used text-slate-600. Let's just catch all missing dark backgrounds for white.
content = content.replace(/bg-white(?! dark:)/g, 'bg-white dark:bg-slate-800');

// The teacher initial icon has a white background? 
// The screenshot shows M with a white circle background.
// I'll replace any bg-slate-100 without dark variant as well.
content = content.replace(/bg-slate-100(?! dark:)/g, 'bg-slate-100 dark:bg-slate-700/50');
content = content.replace(/bg-gray-50(?! dark:)/g, 'bg-gray-50 dark:bg-slate-800/50');
content = content.replace(/bg-slate-50(?! dark:)/g, 'bg-slate-50 dark:bg-slate-800/50');


fs.writeFileSync('src/pages/principal/PrincipalDashboard.jsx', content);
