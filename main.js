const fs = require('fs');
const path = require('path');

const extractFunctions = dir => {
  const results = [];
  function findFiles(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isFile() && entry.name.endsWith('.js')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const regex = /function\s+(\w+)\s*\(([^)]*)\)\s*\{([\s\S]*?)\}/gm;
        let match;
        while ((match = regex.exec(content)) !== null) {
          results.push({
            name: match[1],
            definition: `function ${match[1]}(${match[2]}) {${match[3]}}`,
            file: fullPath,
          });
        }
      } else if (entry.isDirectory()) {
        findFiles(fullPath);
      }
    }
  }
  findFiles(dir);
  return results;
};

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node main.js <directory>');
    process.exit(1);
  }

  const directory = args[0];
  try {
    const functions = extractFunctions(directory);
    console.log(JSON.stringify(functions, null, 2));
  } catch (error) {
    console.error('An error occurred:', error.message);
    process.exit(1);
  }
}

module.exports = extractFunctions;
