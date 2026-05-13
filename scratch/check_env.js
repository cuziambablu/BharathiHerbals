const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  console.log("File .env.local found.");
  const lines = content.split('\n');
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const keyTrimmed = key.trim();
      const value = valueParts.join('=').trim();
      console.log(`${keyTrimmed}: ${value ? 'EXISTS (' + value.length + ' chars)' : 'EMPTY'}`);
    }
  });
} else {
  console.log(".env.local NOT found at " + envPath);
}
