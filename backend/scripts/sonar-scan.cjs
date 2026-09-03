const path = require('path');
const fs = require('fs');

const repoRoot = path.resolve(__dirname, '../..');

process.chdir(repoRoot);

function isLocalHttpUrl(serverUrl) {
  const parsedUrl = new URL(serverUrl);
  const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

  return parsedUrl.protocol === 'http:' && localHosts.has(parsedUrl.hostname);
}

async function main() {
  if (!process.env.SONAR_TOKEN) {
    console.error('SONAR_TOKEN environment variable is required');
    process.exitCode = 1;
    return;
  }

  const backendCoverage = path.join(repoRoot, 'backend/coverage/lcov.info');
  const frontendCoverage = path.join(repoRoot, 'frontend/notes-app/coverage/lcov.info');

  if (!fs.existsSync(backendCoverage) || !fs.existsSync(frontendCoverage)) {
    console.error('Coverage reports are missing. Run backend and frontend test:coverage first.');
    process.exitCode = 1;
    return;
  }

  require('./fix-lcov-paths.cjs');

  const serverUrl = process.env.SONAR_HOST_URL || 'http://localhost:9000';
  const parsedUrl = new URL(serverUrl);

  if (parsedUrl.protocol === 'http:' && !isLocalHttpUrl(serverUrl)) {
    console.error('SONAR_HOST_URL must use HTTPS for non-local servers');
    process.exitCode = 1;
    return;
  }

  const scanOptions = {
    serverUrl,
    token: process.env.SONAR_TOKEN,
  };

  try {
    const { scan } = await import('sonarqube-scanner');
    await scan(scanOptions);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
}

main();
