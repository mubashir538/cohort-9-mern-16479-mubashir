const path = require('path');
const scanner = require('sonarqube-scanner').default;

const repoRoot = path.resolve(__dirname, '../..');

process.chdir(repoRoot);

if (!process.env.SONAR_TOKEN) {
  console.error('SONAR_TOKEN environment variable is required');
  process.exit(1);
}

scanner(
  {
    serverUrl: process.env.SONAR_HOST_URL || 'http://localhost:9000',
    token: process.env.SONAR_TOKEN,
  },
  () => process.exit()
);
