const fs = require('fs');
const path = require('path');

function rewriteLcov(inputPath, outputPath, sourceRoot) {
  const content = fs.readFileSync(inputPath, 'utf8');
  const rewritten = content.replace(/^SF:(.+)$/gm, (_, filePath) => {
    const normalized = filePath.replace(/\\/g, '/').replace(/^src\//, '');
    return `SF:${sourceRoot}/src/${normalized}`;
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, rewritten);
}

const repoRoot = path.resolve(__dirname, '../..');

rewriteLcov(
  path.join(repoRoot, 'backend/coverage/lcov.info'),
  path.join(repoRoot, '.sonar/coverage/backend-lcov.info'),
  'backend'
);

rewriteLcov(
  path.join(repoRoot, 'frontend/notes-app/coverage/lcov.info'),
  path.join(repoRoot, '.sonar/coverage/frontend-lcov.info'),
  'frontend/notes-app'
);
