const fs = require('fs');
let c = fs.readFileSync('c:/Users/Arifur Sajid/Downloads/All client/2000client full/creation-cinema-hub/src/routes/events.tsx', 'utf8');

if (!c.includes('const API_URL = import.meta.env.VITE_API_URL')) {
    c = c.replace(
        'import { useState } from "react";\r\n',
        'import { useState } from "react";\r\n\r\nconst API_URL = import.meta.env.VITE_API_URL || "https://movie-backend-drab.vercel.app";\r\n'
    );
}

// Fix broken fetches
c = c.replace(/fetch\(`\$\{API_URL\}\/api(.*?)"\)/g, 'fetch(`${API_URL}/api$1`)');
c = c.replace(/fetch\(`\$\{API_URL\}\/api(.*?)"\,/g, 'fetch(`${API_URL}/api$1`,');

c = c.replace(/fetch\("\$\{API_URL\}\/api(.*?)"\)/g, 'fetch(`${API_URL}/api$1`)');
c = c.replace(/fetch\("\$\{API_URL\}\/api(.*?)"\,/g, 'fetch(`${API_URL}/api$1`,');

c = c.replace(/fetch\('\$\{API_URL\}\/api(.*?)'\)/g, 'fetch(`${API_URL}/api$1`)');
c = c.replace(/fetch\('\$\{API_URL\}\/api(.*?)'\,/g, 'fetch(`${API_URL}/api$1`,');

// Ensure image urls are correct
c = c.replace(/`\$\{API_URL\}\$\{API_URL\}/g, '`${API_URL}');

// Bring back imports that were accidentally removed
if (!c.includes('import { createFileRoute, Link }')) {
    c = 'import { createFileRoute, Link } from "@tanstack/react-router";\nimport { useState } from "react";\nimport { SiteHeader } from "@/components/layout/SiteHeader";\nimport { SiteFooter } from "@/components/layout/SiteFooter";\nimport {\n  Calendar,\n  MapPin,\n' + c;
}

fs.writeFileSync('c:/Users/Arifur Sajid/Downloads/All client/2000client full/creation-cinema-hub/src/routes/events.tsx', c);
console.log('Fixed completely');
