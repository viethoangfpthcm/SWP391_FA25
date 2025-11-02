/*
  replace-loading.cjs
  - Dry-run by default. Use --apply to replace <FaSpinner .../> with <Loading inline/> across FE/src
  - Adds `import Loading from '@components/ui/Loading.jsx';` if missing.

  Usage (from FE folder):
    node scripts/replace-loading.cjs        # dry-run, list files
    node scripts/replace-loading.cjs --apply   # apply changes

  NOTE: This is regex-based and conservative: it only replaces self-closing FaSpinner tags.
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

function alreadyHasLoadingImport(text) {
  return /import\s+Loading\s+from\s+['"][^'\"]*Loading\.jsx['\"]/m.test(text);
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
  // Replace self-closing FaSpinner occurrences with Loading inline
  // e.g. <FaSpinner className="spinner" />  => <Loading inline />
  const replaced = text.replace(/<FaSpinner[^>]*\/?>/g, '<Loading inline />');
  let res = replaced;
  if (res !== original && !alreadyHasLoadingImport(res)) {
    const importLine = "import Loading from '@components/ui/Loading.jsx';\n";
    const idx = findImportInsertIndex(res);
    res = res.slice(0, idx) + importLine + res.slice(idx);
  }
  return res;
}

const files = walk(SRC);
const report = [];
files.forEach((file) => {
  // skip the shared Loading component itself
  if (file.endsWith(path.join('components', 'ui', 'Loading.jsx'))) return;
  const text = fs.readFileSync(file, 'utf8');
  if (text.indexOf('FaSpinner') === -1) return;
  const transformed = transform(text);
  if (transformed !== text) {
    report.push({ file, original: text, transformed });
    if (APPLY) {
      fs.writeFileSync(file, transformed, 'utf8');
    }
  }
});

if (report.length === 0) {
  console.log('No FaSpinner usages found to replace.');
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
