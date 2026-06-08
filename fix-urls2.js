const fs = require('fs');

function fixEventsFile() {
  const filePath = 'c:/Users/Arifur Sajid/Downloads/All client/2000client full/creation-cinema-hub/src/routes/events.tsx';
  let content = fs.readFileSync(filePath, 'utf-8');

  if (!content.includes('const API_URL')) {
    content = content.replace(
      'import { useEffect } from "react";',
      'import { useEffect } from "react";\n\nconst API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";\n'
    );
  }

  // Find all https://movie-backend-drab.vercel.app in strings/template literals and replace them
  content = content.replace(/"https:\/\/movie-backend-drab\.vercel\.app\/api(.*?)"/g, '`${API_URL}/api$1`');
  content = content.replace(/`https:\/\/movie-backend-drab\.vercel\.app\/api(.*?)`/g, '`${API_URL}/api$1`');
  content = content.replace(/`https:\/\/movie-backend-drab\.vercel\.app\$\{/g, '`${API_URL}${');

  fs.writeFileSync(filePath, content);
  console.log('Fixed public events.tsx');
}

fixEventsFile();
