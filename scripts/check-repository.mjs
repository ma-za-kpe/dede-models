import { readdir, readFile, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
async function scan(dir) {
  for (const entry of await readdir(dir)) {
    if (entry === '.git') continue;
    const path = `${dir}/${entry}`, info = await lstat(path);
    assert.ok(!info.isSymbolicLink(), 'Symlinks are not permitted');
    assert.ok(!/(?:^\.env|^\.firebase$|\.(?:gguf|safetensors|onnx|pem|key)$)/i.test(entry), 'Credential/model file cannot enter Git');
    if (info.isDirectory()) { await scan(path); continue; }
    assert.ok(info.size < 1024 * 1024, 'Large file must be a reviewed release asset, not Git content');
    const text = await readFile(path, 'utf8');
    assert.ok(!/\b(?:gh[pousr]_|github_pat_|hf_)[A-Za-z0-9_]{30,}\b/.test(text), 'Possible credential detected');
    assert.ok(!/-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/.test(text), 'Private key detected');
  }
}
await scan('.');
const manifest = JSON.parse(await readFile('release-manifest.json'));
assert.equal(manifest.production_qualified, false);
assert.equal(manifest.signed_manifest, false);
assert.equal(manifest.artifacts.find(x => x.name === 'student-q4_k_m.gguf').sha256, 'c830a1608b31ce0f1ae2ac8bfc063fbae9bbf75bec5cd3216daa876a6ba78dbf');
const sums = new Map((await readFile('SHA256SUMS', 'utf8')).trim().split('\n').map(line => [line.slice(66), line.slice(0, 64)]));
for (const name of ['README.md', 'LICENSE', 'ATTRIBUTION.md', 'release-manifest.json']) {
  const hash = createHash('sha256').update(await readFile(name)).digest('hex');
  assert.equal(hash, sums.get(name), `${name}: stale checksum`);
}
console.log('PASS: repository boundary, unqualified status and local attachment checksums');
