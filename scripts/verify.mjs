#!/usr/bin/env node
import { readFile, readdir, lstat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

// Release-resource validation only; no UI logic or third-party dependencies.
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const args = process.argv.slice(2);
const packIndex = args.indexOf('--pack-json');
assert(args.every((arg, i) => arg === '--readme-links' || arg === '--pack-json' || i === packIndex + 1 && packIndex >= 0), 'Unknown argument');
if (packIndex >= 0) assert(args[packIndex + 1], '--pack-json needs a filename');
const rootReal = await realpath(root);
const inside = (base, target) => { const relative = path.relative(base, target); return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`)); };
async function checkedFile(relative) {
  assert(typeof relative === 'string' && relative && !relative.includes('\\') && !path.isAbsolute(relative) && !/^[a-z]+:/i.test(relative), `Invalid package path: ${relative}`);
  const absolute = path.resolve(root, relative);
  assert(inside(root, absolute), `Path escapes package: ${relative}`);
  let cursor = root;
  for (const segment of path.relative(root, absolute).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, segment);
    assert(!(await lstat(cursor)).isSymbolicLink(), `Symlink is not allowed: ${relative}`);
  }
  assert(inside(rootReal, await realpath(absolute)), `Resolved path escapes package: ${relative}`);
  assert((await lstat(absolute)).isFile(), `Not a file: ${relative}`);
  return absolute;
}
async function text(relative) { return readFile(await checkedFile(relative), 'utf8'); }
async function walk(dir = root) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === '.git' && dir === root) continue;
    const absolute = path.join(dir, entry.name);
    assert(!(await lstat(absolute)).isSymbolicLink(), `Symlink is not allowed: ${path.relative(root, absolute)}`);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else { assert(entry.isFile(), `Unsupported file type: ${absolute}`); files.push(path.relative(root, absolute).split(path.sep).join('/')); }
  }
  return files;
}
const all = await walk();
const pkg = JSON.parse(await text('package.json'));
assert.equal(pkg.name, '@local/dsh-composer-drawer');
assert.equal(pkg.author, 'gaoerge');
assert.equal(pkg.license, 'MIT');
assert.equal(pkg.type, 'module');
assert.equal(pkg.engines?.dsh, '0.2.1-rc.5');
assert.equal(pkg.repository?.url, 'git+https://github.com/gaoerge/dsh-composer-drawer.git');
assert.equal(pkg.exports?.['.'], './index.js');
assert.equal(pkg.exports?.['./client'], './client.js');
assert.equal(pkg.exports?.['./icon'], './icon.svg');
assert.equal(pkg.exports?.['./locale/*.json'], './locale/*.json');
assert.equal(pkg.dsh?.bundle?.patch, './cordis.patch.yml');
assert.equal(pkg.dsh?.client?.platform, 'web');
assert.equal(pkg.dsh?.client?.immediately, true);
assert.deepEqual(pkg.dsh?.client?.inject, ['@deepseek-ai/dsh-client-ui-conversation']);
assert(!Object.keys(pkg.dependencies ?? {}).length, 'Unexpected runtime dependency');
for (const name of ['preinstall', 'install', 'postinstall', 'prepare', 'prepack', 'postpack']) assert(!pkg.scripts?.[name], `Unexpected lifecycle script: ${name}`);
const required = ['index.js', 'client.js', 'cordis.patch.yml', 'locale/en.json', 'locale/zh.json', 'icon.svg', 'README.md', 'README.en.md', 'LICENSE', 'CHANGELOG.md', 'scripts/verify.mjs'];
assert.deepEqual(pkg.files, [...required.slice(0, 6), ...required.slice(6), 'docs/images/'], 'Update the explicit packing list and verifier together');
for (const relative of required) await checkedFile(relative);
for (const [key, target] of Object.entries(pkg.exports)) {
  assert(typeof target === 'string' && target.startsWith('./'), `Invalid export: ${key}`);
  if (key.includes('*')) {
    assert.equal(key, './locale/*.json');
    assert.deepEqual(all.filter(file => /^locale\/[^/]+\.json$/.test(file)).sort(), ['locale/en.json', 'locale/zh.json']);
  } else await checkedFile(target);
}
await checkedFile(pkg.icon);
await checkedFile(pkg.dsh.bundle.patch);
for (const lang of ['en', 'zh']) {
  const locale = JSON.parse(await text(`locale/${lang}.json`));
  for (const field of ['title', 'description']) assert(typeof locale.meta?.[field] === 'string' && locale.meta[field].trim(), `Missing ${lang} meta.${field}`);
}
const icon = await text('icon.svg');
assert(icon.trim().startsWith('<svg') && icon.includes('xmlns="http://www.w3.org/2000/svg"') && icon.includes('viewBox='), 'Invalid SVG envelope');
assert(Buffer.byteLength(icon) <= 256 * 1024, 'Icon exceeds 256 KiB');
assert(!/<script\b|<foreignObject\b|\bon\w+\s*=|(?:href|src)\s*=/i.test(icon), 'Unexpected active or external SVG content');
const patch = await text('cordis.patch.yml');
assert(/^\s*- insert:\s*\n\s*- id: local-composer-drawer\s*\n\s*name: ['"]@local\/dsh-composer-drawer['"]\s*$/.test(patch), 'Unexpected bundle row or module name');
assert((await text('client.js')).includes("id: '@local/dsh-composer-drawer'"), 'Client module id drift');
assert((await text('LICENSE')).includes('Copyright (c) 2026 gaoerge'), 'License attribution drift');
const images = all.filter(file => file.startsWith('docs/images/'));
assert(images.every(file => /^docs\/images\/[a-z0-9][a-z0-9._-]*\.(png|jpg|jpeg|webp|svg)$/i.test(file)), 'Unexpected image-directory contents');
if (args.includes('--readme-links')) {
  for (const name of ['README.md', 'README.en.md']) {
    const markdown = (await text(name)).replace(/<!--[\s\S]*?-->/g, '').replace(/```[\s\S]*?```/g, '');
    const links = [...markdown.matchAll(/!?\[[^\]]*\]\(\s*(<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\s*\)/g), ...markdown.matchAll(/\b(?:src|href)="([^"]+)"/g)];
    for (const match of links) {
      const destination = match[1].replace(/^<|>$/g, '');
      if (/^[a-z][a-z0-9+.-]*:/i.test(destination) || destination.startsWith('#')) continue;
      const relative = decodeURIComponent(destination.split(/[?#]/)[0]);
      if (relative) await checkedFile(relative);
    }
  }
}
const allowed = new Set(['package.json', ...required, ...images]);
if (packIndex >= 0) {
  const report = JSON.parse((await readFile(path.resolve(args[packIndex + 1]), 'utf8')).replace(/^\uFEFF/, ''));
  assert(Array.isArray(report) && report.length === 1 && Array.isArray(report[0].files), 'Unexpected npm pack report');
  const packed = report[0].files.map(file => file.path).sort();
  assert.equal(new Set(packed).size, packed.length, 'Duplicate packed path');
  for (const file of packed) { assert(allowed.has(file), `Unexpected packed file: ${file}`); await checkedFile(file); }
  for (const file of allowed) assert(packed.includes(file), `Missing packed file: ${file}`);
  console.log(`Verified npm pack: ${packed.length} explicitly allowed files.`);
}
console.log(`Release resources OK: ${pkg.name}@${pkg.version}; ${required.length} required resources; ${images.length} image(s).${args.includes('--readme-links') ? ' README links OK.' : ''}`);
