/*
  replace-ui.cjs (CommonJS)
  - Dry-run by default. Use --apply to write changes.
  - Replaces <button ...>...</button> with <Button ...>...</Button>
  - Adds `import Button from "@components/ui/Button.jsx";` if missing.

  Usage (from FE folder):
    node scripts/replace-ui.cjs        # dry-run, list files that would change
    node scripts/replace-ui.cjs --apply   # apply changes

  WARNING: This is a conservative regex-based transform. It aims to preserve attributes.
  Please review changes before committing.
*/
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'src');
const APPLY = process.argv.includes('--apply');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const p = path.join(dir, file);
    const stat = fs.statSync(p);
    if (stat && stat.isDirectory()) {
      if (file === 'node_modules' || file === '.git') return;
      results = results.concat(walk(p));
    } else {
      if (/\.jsx?$/.test(file)) results.push(p);
    }
  });
  return results;
}

function alreadyHasButtonImport(text) {
  return /import\s+Button\s+from\s+['"][^'\"]*Button\.jsx['\"]/m.test(text);
}

function findImportInsertIndex(text) {
  const importRegex = /(^import[\s\S]*?;$)/gm;
  let lastIndex = -1;
  let match;
  while ((match = importRegex.exec(text)) !== null) {
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex === -1) {
    return 0;
  }
  return lastIndex + 1;
}

function transform(text) {
  const original = text;
  text = text.replace(/<button(\s|>)/g, '<Button$1');
  text = text.replace(/<\/button>/g, '</Button>');

  if (text !== original && !alreadyHasButtonImport(text)) {
    const importLine = "import Button from '@components/ui/Button.jsx';\n";
    const idx = findImportInsertIndex(text);
    text = text.slice(0, idx) + importLine + text.slice(idx);
  }
  return text;
}

const files = walk(SRC);
const report = [];
files.forEach((file) => {
  if (file.endsWith(path.join('components', 'ui', 'Button.jsx'))) return;
  const text = fs.readFileSync(file, 'utf8');
  if (text.indexOf('<button') === -1 && text.indexOf('</button>') === -1) return;
  const transformed = transform(text);
  if (transformed !== text) {
    report.push({ file, original: text, transformed });
    if (APPLY) {
      fs.writeFileSync(file, transformed, 'utf8');
    }
  }
});

if (report.length === 0) {
  console.log('No <button> usages found to replace.');
  process.exit(0);
}

console.log(`${report.length} file(s) would be ${APPLY ? 'changed' : 'modified (dry-run)'}:`);
report.forEach((r) => {
  console.log(' - ' + path.relative(process.cwd(), r.file));
});

if (!APPLY) {
  console.log('\nDry-run mode. To apply changes run with --apply.');
  process.exit(0);
}

console.log('\nApplied changes. Please run your dev server and review the diffs.');
process.exit(0);
