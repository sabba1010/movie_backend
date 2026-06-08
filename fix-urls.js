const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Add API_URL if missing
  if (!content.includes('const API_URL = import.meta.env.VITE_API_URL')) {
    content = content.replace(
      'import { toast } from "sonner";',
      'import { toast } from "sonner";\n\nconst API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";\n'
    );
  }

  // Fix the quote mismatch I caused: `${API_URL}/api/upload',
  content = content.replace(/fetch\(`\$\{API_URL\}\/api/g, 'fetch(`${API_URL}/api');
  content = content.replace(/fetch\(`\$\{API_URL\}\/api\/(.*?)',/g, 'fetch(`${API_URL}/api/$1`,');
  content = content.replace(/fetch\(`\$\{API_URL\}\/api\/(.*?)"\)/g, 'fetch(`${API_URL}/api/$1`)');
  content = content.replace(/fetch\(`\$\{API_URL\}\/api\/(.*?)"\,/g, 'fetch(`${API_URL}/api/$1`,');
  
  // Replace remaining Vercel URLs
  content = content.replace(/https:\/\/movie-backend-drab\.vercel\.app/g, '${API_URL}');
  content = content.replace(/`\$\{API_URL\}\$\{API_URL\}\//g, '`${API_URL}/');
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

fixFile('c:/Users/Arifur Sajid/Downloads/All client/2000client full/creation-cinema-hub/src/routes/admin/events.tsx');
fixFile('c:/Users/Arifur Sajid/Downloads/All client/2000client full/creation-cinema-hub/src/routes/events.tsx');
