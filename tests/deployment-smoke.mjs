import assert from 'node:assert/strict';
import { readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { adminCookie, legacyPreviewCookie } from './admin-session.mjs';
assert.notEqual(process.env.EVENTHEME_DATA_MODE, 'supabase', 'These tests are for the local preview only.');
const base = 'http://localhost:3000';
const cookie = await adminCookie(base);
const file = await readFile('public/eventheme.jpg');
const form = new FormData();
form.set('file', new File([file], 'test-logo.jpg', { type: 'image/jpeg' }));
const response = await fetch(base + '/api/admin/media', { method: 'POST', headers: { Origin: base, Cookie: cookie }, body: form });
const result = await response.json();
assert.equal(response.status, 200, JSON.stringify(result));
assert.match(result.url, /^\/uploads\/[0-9a-f-]+\.jpg$/);
const uploadedFile = path.resolve('public', result.url.slice(1));
assert.ok(uploadedFile.startsWith(path.resolve('public/uploads') + path.sep));
try { assert.equal((await fetch(base + result.url)).status, 200); assert.deepEqual(await readFile(uploadedFile), file); }
finally { await unlink(uploadedFile); }
const fake = new FormData(); fake.set('file', new File(['<script>bad</script>'], 'bad.jpg', { type: 'image/jpeg' }));
assert.equal((await fetch(base + '/api/admin/media', { method: 'POST', headers: { Origin: base, Cookie: cookie }, body: fake })).status, 400);
assert.equal((await fetch(base + '/api/admin/media', { method: 'POST', headers: { Origin: base, Cookie: legacyPreviewCookie }, body: fake })).status, 401);
const prod = 'http://127.0.0.1:3001';
const headers = { Origin: process.env.APP_URL || prod, 'Content-Type': 'application/json', Cookie: legacyPreviewCookie };
assert.equal((await fetch(prod + '/api/admin', { headers })).status, 401);
assert.equal((await fetch(prod + '/admin', { headers, redirect: 'manual' })).status, 307);
assert.equal((await fetch(prod + '/api/auth', { method: 'POST', headers, body: '{}' })).status, 401);
assert.equal((await fetch(prod + '/api/inquiries', { method: 'POST', headers, body: '{}' })).status, 503);
console.log('PASS: admin image upload/readback/cleanup, fake image rejection, legacy preview cookie rejection, production admin protection, and disabled unconfigured submissions.');
