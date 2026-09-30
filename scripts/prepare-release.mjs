// Metadata/hash validation only. Never loads model weights into an inference runtime.
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, writeFile, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
const source = '/source', repo = '/repo';
const expected = 'c830a1608b31ce0f1ae2ac8bfc063fbae9bbf75bec5cd3216daa876a6ba78dbf';
const files = [
  [source, 'student-q4_k_m.gguf'], [source, 'build-receipt.json'],
  [source, 'training-receipt.json'], [source, 'review-v3.json'],
  [source, 'eval-student-v3.jsonl'], [repo, 'README.md'],
  [repo, 'LICENSE'], [repo, 'ATTRIBUTION.md'],
];
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/,
  /\b(?:gh[pousr]_|github_pat_|hf_)[A-Za-z0-9_]{30,}\b/,
  /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
  /AGE-SECRET-KEY-1[A-Z0-9]{50,}/,
  /["']type["']\s*:\s*["']service_account["']/,
  /(?:client_secret|private_key|password|secret_access_key|api_token)\s*["']?\s*[:=]\s*["']?[A-Za-z0-9_+/=-]{24,}/i,
  /https?:\/\/[^\s/@:]+:[^\s/@]+@/,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /\/(?:Users|home)\/[^\s/]+\//,
];
async function inventory(root, name) {
  const path = `${root}/${name}`;
  const hash = createHash('sha256');
  let size = 0;
  for await (const chunk of createReadStream(path)) { hash.update(chunk); size += chunk.length; }
  if (!name.endsWith('.gguf')) {
    const text = await readFile(path, 'utf8');
    assert.ok(patterns.every(pattern => !pattern.test(text)), `${name}: possible private data or credential; review without logging matched values`);
    if (name.endsWith('.json')) JSON.parse(text);
    if (name.endsWith('.jsonl')) for (const line of text.trim().split('\n')) JSON.parse(line);
  }
  return { name, size_bytes: size, sha256: hash.digest('hex') };
}
const artifacts = [];
for (const [root, name] of files) artifacts.push(await inventory(root, name));
assert.equal(artifacts[0].sha256, expected);
assert.equal(artifacts[0].size_bytes, 1107408640);
const build = JSON.parse(await readFile(`${source}/build-receipt.json`));
const training = JSON.parse(await readFile(`${source}/training-receipt.json`));
const review = JSON.parse(await readFile(`${source}/review-v3.json`));
assert.equal(build.training_receipt_sha256, artifacts.find(x => x.name === 'training-receipt.json').sha256);
assert.equal(training.approval_sha256, artifacts.find(x => x.name === 'review-v3.json').sha256);
assert.equal(training.synthetic_only, true);
assert.equal(training.production_qualified, false);
assert.equal(build.production_qualified, false);
assert.equal(training.accepted_ids.length, 241);
assert.equal(review.accepted_ids.length, 241);
assert.equal(Object.keys(review.rejected).length, 56);
const recorded = build.artifacts.find(x => x.path === artifacts[0].name);
assert.equal(recorded.sha256, expected);
assert.equal(recorded.size_bytes, (await stat(`${source}/${recorded.path}`)).size);
const manifest = {
  schema: 1, release: 'student-v3-experimental', visibility: 'private',
  warning: 'Unqualified—synthetic development testing only.',
  production_qualified: false, signed_manifest: false,
  privacy_review: 'Text attachments pattern-scanned and manually reviewed; synthetic provenance reported by source receipts. No proof of absence of memorized information in weights.',
  artifacts,
};
await writeFile(`${repo}/release-manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
const manifestEntry = await inventory(repo, 'release-manifest.json');
await writeFile(`${repo}/SHA256SUMS`, [...artifacts, manifestEntry].map(x => `${x.sha256}  ${x.name}\n`).join(''));
console.log(JSON.stringify({ files_reviewed: artifacts.length, model_sha256: expected, receipt_chain_verified: true }));
