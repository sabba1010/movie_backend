const fs = require('fs');
let c = fs.readFileSync('c:/Users/Arifur Sajid/Downloads/All client/2000client full/creation-cinema-hub/src/routes/admin/events.tsx', 'utf8');
c = c.replace(/"\$\{API_URL\}(.*?)"/g, '`${API_URL}$1`');
c = c.replace(/'\$\{API_URL\}(.*?)'/g, '`${API_URL}$1`');
fs.writeFileSync('c:/Users/Arifur Sajid/Downloads/All client/2000client full/creation-cinema-hub/src/routes/admin/events.tsx', c);
console.log('done');
