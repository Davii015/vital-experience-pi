const { execFileSync } = require('node:child_process');
const { readdirSync, statSync } = require('node:fs');
const { join } = require('node:path');

function javascriptFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? javascriptFiles(path) : path.endsWith('.js') ? [path] : [];
  });
}

const files = ['server.js', ...javascriptFiles('src'), ...javascriptFiles('prisma'), ...javascriptFiles('tests')];
for (const file of files) execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
console.log(`Sintaxe validada em ${files.length} arquivos JavaScript.`);
