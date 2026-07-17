#!/usr/bin/env node
// Rigenera i blocchi compilati nei file *-standalone.html.
// Uso: node build-standalone.js app.jsx [menu.jsx extras.jsx ...]
// Ogni blocco <script>/* nome.jsx */ (function(){...})() </script> viene
// ricompilato con Babel (preset react) e riavvolto in IIFE (evita collisioni
// di const globali tra i vari blocchi).
// Richiede @babel/standalone: `npm i @babel/standalone` accanto allo script
// o in una cartella raggiungibile da require.
const fs = require('fs');
const path = require('path');
let Babel;
try { Babel = require('@babel/standalone'); }
catch { Babel = require('/tmp/byupwork/node_modules/@babel/standalone'); }

const APP = __dirname;
const TARGETS = ['home-standalone.html', 'menu-standalone.html'];
const files = process.argv.slice(2);
if (!files.length) { console.error('Uso: node build-standalone.js <file.jsx> ...'); process.exit(1); }

const compiled = {};
for (const f of files) {
  const src = fs.readFileSync(path.join(APP, f), 'utf8');
  const out = Babel.transform(src, { presets: [['react', { runtime: 'classic' }]] }).code;
  if (out.includes('</script>')) throw new Error(f + ': output contiene </script>');
  compiled[f] = out;
  console.log('compilato', f, '->', out.length, 'chars');
}
for (const t of TARGETS) {
  const p = path.join(APP, t);
  if (!fs.existsSync(p)) continue;
  let html = fs.readFileSync(p, 'utf8');
  let touched = false;
  for (const f of files) {
    const re = new RegExp('(<script>/\\* ' + f.replace('.', '\\.') + ' \\*/)[\\s\\S]*?(</script>)');
    if (re.test(html)) {
      html = html.replace(re, (_, a, b) => a + '\n(function(){\n' + compiled[f] + '\n})();\n' + b);
      touched = true;
      console.log(t + ': sostituito blocco ' + f);
    }
  }
  if (touched) fs.writeFileSync(p, html);
}
console.log('done');
