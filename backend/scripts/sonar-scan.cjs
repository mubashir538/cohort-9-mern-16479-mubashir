const path = require('path');
const fs = require('fs');
const scanner = require('sonarqube-scanner').default;

const repoRoot = path.resolve(__dirname, '../..');

process.chdir(repoRoot);

if (!process.env.SONAR_TOKEN) {
  console.error('SONAR_TOKEN environment variable is required');
  process.exit(1);
}

const backendCoverage = path.join(repoRoot, 'backend/coverage/lcov.info');
const frontendCoverage = path.join(repoRoot, 'frontend/notes-app/coverage/lcov.info');

if (!fs.existsSync(backendCoverage) || !fs.existsSync(frontendCoverage)) {
  console.error('Coverage reports are missing. Run backend and frontend test:coverage first.');
  process.exit(1);
}

require('./fix-lcov-paths.cjs');

scanner(
  {
    serverUrl: process.env.SONAR_HOST_URL || 'http://localhost:9000',
    token: process.env.SONAR_TOKEN,
  },
  () => process.exit()
);
