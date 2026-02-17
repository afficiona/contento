#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 5) {
  console.error('Usage: node create-platform.js <PlatformName> <backendPort> <frontendPort> <primaryColor> <secondaryColor>');
  console.error('Example: node create-platform.js Adda 3100 3102 teal cyan');
  process.exit(1);
}

const [platformName, backendPort, frontendPort, primaryColor, secondaryColor] = args;
const platformLower = platformName.toLowerCase();
const platformUpper = platformName.toUpperCase();

const sourceDir = path.join(__dirname, '../Manch');
const targetDir = path.join(__dirname, `../${platformName}`);

console.log(`Creating platform: ${platformName}`);
console.log(`Source: ${sourceDir}`);
console.log(`Target: ${targetDir}`);
console.log(`Backend Port: ${backendPort}`);
console.log(`Frontend Port: ${frontendPort}`);
console.log(`Colors: ${primaryColor}/${secondaryColor}`);
console.log('');

// Check if source exists
if (!fs.existsSync(sourceDir)) {
  console.error(`Error: Source directory ${sourceDir} does not exist`);
  process.exit(1);
}

// Check if target already exists
if (fs.existsSync(targetDir)) {
  console.error(`Error: Target directory ${targetDir} already exists`);
  process.exit(1);
}

// Files to skip
const skipFiles = new Set([
  'node_modules',
  '.next',
  'dist',
  '.git',
  'manch.db',
  'manch.db-journal',
  '.env'
]);

// Binary file extensions to skip text replacement
const binaryExtensions = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg',
  '.woff', '.woff2', '.ttf', '.eot',
  '.db', '.db-journal'
]);

// Copy directory recursively
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip files
    if (skipFiles.has(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

// Copy and process file
function copyFile(src, dest) {
  const ext = path.extname(src);

  // For binary files, just copy
  if (binaryExtensions.has(ext)) {
    fs.copyFileSync(src, dest);
    return;
  }

  // For text files, read, replace, and write
  try {
    let content = fs.readFileSync(src, 'utf8');

    // Perform replacements
    content = content
      // Platform names
      .replace(/Manch/g, platformName)
      .replace(/manch/g, platformLower)
      .replace(/MANCH/g, platformUpper)
      // Ports
      .replace(/3000/g, backendPort)
      .replace(/3002/g, frontendPort)
      // Database and storage keys
      .replace(/manch\.db/g, `${platformLower}.db`)
      .replace(/manch_token/g, `${platformLower}_token`)
      .replace(/manch_user/g, `${platformLower}_user`)
      // Colors (Tailwind classes)
      .replace(/indigo-/g, `${primaryColor}-`)
      .replace(/purple-/g, `${secondaryColor}-`)
      // Package names
      .replace(/@paypalcorp\/manch/g, `@paypalcorp/${platformLower}`);

    fs.writeFileSync(dest, content, 'utf8');
  } catch (error) {
    // If file is binary or can't be read as text, just copy it
    fs.copyFileSync(src, dest);
  }
}

// Main execution
try {
  console.log('Copying files...');
  copyDirectory(sourceDir, targetDir);

  console.log('Creating .gitignore...');
  const gitignoreContent = `node_modules
.next
dist
.env
*.db
*.db-journal
`;
  fs.writeFileSync(path.join(targetDir, '.gitignore'), gitignoreContent);

  console.log('Creating environment files...');

  // Backend .env.example
  const backendEnvExample = `# Server Configuration
PORT=${backendPort}
NODE_ENV=development

# Database
DATABASE_PATH=./${platformLower}.db

# JWT Secret (change in production)
JWT_SECRET=your-secret-key-here-change-in-production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:${backendPort}/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:${frontendPort}

# OAuth Provider Configuration
OAUTH_ISSUER=http://localhost:${backendPort}
`;
  fs.writeFileSync(path.join(targetDir, 'backend', '.env.example'), backendEnvExample);

  // Frontend .env.example
  const frontendEnvExample = `NEXT_PUBLIC_API_URL=http://localhost:${backendPort}
`;
  fs.writeFileSync(path.join(targetDir, 'frontend', '.env.example'), frontendEnvExample);

  console.log('');
  console.log('✅ Platform created successfully!');
  console.log('');
  console.log('Next steps:');
  console.log(`1. cd ${platformName}/backend && npm install`);
  console.log(`2. cd ${platformName}/frontend && npm install`);
  console.log(`3. cp ${platformName}/backend/.env.example ${platformName}/backend/.env`);
  console.log(`4. cp ${platformName}/frontend/.env.example ${platformName}/frontend/.env`);
  console.log(`5. Add Google OAuth credentials to ${platformName}/backend/.env`);
  console.log(`6. cd ${platformName}/backend && npm run dev`);
  console.log(`7. cd ${platformName}/frontend && npm run dev`);
  console.log('');
  console.log(`Backend will run on: http://localhost:${backendPort}`);
  console.log(`Frontend will run on: http://localhost:${frontendPort}`);

} catch (error) {
  console.error('Error creating platform:', error.message);
  process.exit(1);
}
