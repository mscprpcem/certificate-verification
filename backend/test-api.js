/**
 * Comprehensive Backend API Test Suite
 * Tests all endpoints for the MSC Credential Platform
 */
const BASE = 'http://localhost:5000';
let passed = 0;
let failed = 0;
const failures = [];

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    failed++;
    const msg = err.message || String(err);
    failures.push({ name, error: msg });
    console.log(`  ❌ FAIL: ${name} — ${msg}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json();
  return { res, data };
}

async function run() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  MSC CREDENTIAL PLATFORM — BACKEND AUDIT');
  console.log('═══════════════════════════════════════════\n');

  // ── 1. METRICS API ──
  console.log('📊 [1] METRICS ENDPOINT');
  await test('GET /api/credentials/metrics returns valid counters', async () => {
    const { data } = await fetchJSON(`${BASE}/api/credentials/metrics`);
    assert(typeof data.certificatesIssued === 'number', 'certificatesIssued should be number');
    assert(typeof data.badgesIssued === 'number', 'badgesIssued should be number');
    assert(typeof data.studentsCount === 'number', 'studentsCount should be number');
    assert(data.certificatesIssued > 0, 'Should have certificates issued from seed');
    assert(data.badgesIssued > 0, 'Should have badges issued from seed');
    assert(data.studentsCount > 0, 'Should have students from seed');
  });

  // ── 2. RECENT CREDENTIALS ──
  console.log('\n📋 [2] RECENT CREDENTIALS ENDPOINT');
  await test('GET /api/credentials/recent returns array of 5', async () => {
    const { data } = await fetchJSON(`${BASE}/api/credentials/recent`);
    assert(Array.isArray(data), 'Should return array');
    assert(data.length <= 5, 'Should return max 5 records');
    assert(data.length > 0, 'Should have some records');
    assert(data[0].id, 'Each record should have id');
    assert(data[0].recipient_name, 'Each record should have recipient_name');
    assert(data[0].type, 'Each record should have type');
  });

  // ── 3. CREDENTIAL VERIFICATION ──
  console.log('\n🔍 [3] VERIFICATION ENDPOINTS');

  await test('Verify by Credential ID', async () => {
    const { data } = await fetchJSON(`${BASE}/api/credentials/verify?credentialId=MSC-EVT-2026-00100`);
    assert(data.success === true, 'Should succeed');
    assert(data.record, 'Should have record');
    assert(data.record.recipient_name === 'Amit Kumar Yadav', 'Should match Amit');
  });

  await test('Verify by Email returns multiple records', async () => {
    const { data } = await fetchJSON(`${BASE}/api/credentials/verify?email=student@mscprpcem.tech`);
    assert(data.success === true, 'Should succeed');
    assert(Array.isArray(data.records), 'Should return records array for email search');
    assert(data.records.length > 0, 'Should have at least one record');
  });

  await test('Verify by Name (event type)', async () => {
    const { data } = await fetchJSON(`${BASE}/api/credentials/verify?name=amit+kumar+yadav&type=event`);
    assert(data.success === true, 'Should succeed');
    assert(data.record, 'Should have record');
  });

  await test('Verify by Name (team type)', async () => {
    const { data } = await fetchJSON(`${BASE}/api/credentials/verify?name=amit+kumar+yadav&type=team`);
    assert(data.success === true, 'Should succeed');
    assert(data.record, 'Should have record');
    assert(data.record.type === 'badge', 'Should be a badge for team type');
  });

  await test('Verify by Badge ID', async () => {
    // First get a badge ID
    const { data: emailData } = await fetchJSON(`${BASE}/api/credentials/verify?email=student@mscprpcem.tech`);
    const badge = emailData.records.find(r => r.type === 'badge');
    assert(badge, 'Should have at least one badge');
    
    const { data } = await fetchJSON(`${BASE}/api/credentials/verify?badgeId=${badge.id}`);
    assert(data.success === true, 'Should succeed');
    assert(data.record.id === badge.id, 'Should match badge ID');
  });

  await test('Verify by URL containing credential ID', async () => {
    const url = encodeURIComponent('http://localhost:5173?verifyId=MSC-EVT-2026-00100');
    const { data } = await fetchJSON(`${BASE}/api/credentials/verify?url=${url}`);
    // This may fail due to regex issue - we'll check
    if (!data.success) {
      throw new Error(`URL verification failed - regex doesn't extract ID from query params: ${data.message}`);
    }
  });

  await test('Verify non-existent ID returns failure', async () => {
    const { data } = await fetchJSON(`${BASE}/api/credentials/verify?credentialId=FAKE-ID-999`);
    assert(data.success === false, 'Should fail for non-existent ID');
  });

  // ── 4. SUGGESTIONS/AUTOCOMPLETE ──
  console.log('\n💡 [4] NAME SUGGESTIONS ENDPOINT');
  await test('GET /api/credentials/suggest returns suggestions', async () => {
    const { data } = await fetchJSON(`${BASE}/api/credentials/suggest?query=Amit&type=event`);
    assert(Array.isArray(data), 'Should return array');
    assert(data.length > 0, 'Should have suggestions for "Amit"');
    assert(data.some(n => n.includes('Amit')), 'Should include Amit in results');
  });

  await test('Suggest with empty query returns empty', async () => {
    const { data } = await fetchJSON(`${BASE}/api/credentials/suggest?query=&type=event`);
    assert(Array.isArray(data), 'Should return array');
    assert(data.length === 0, 'Should be empty for blank query');
  });

  // ── 5. AUTHENTICATION ──
  console.log('\n🔐 [5] AUTHENTICATION ENDPOINTS');

  await test('Login with student credentials', async () => {
    const { res, data } = await fetchJSON(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@mscprpcem.tech', password: 'password123' })
    });
    assert(res.ok, 'Login should succeed');
    assert(data.user, 'Should return user object');
    assert(data.user.role === 'student', 'Should be student role');
    assert(data.user.name === 'Amit Kumar Yadav', 'Should be Amit');
  });

  await test('Login with admin credentials', async () => {
    const { res, data } = await fetchJSON(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@mscprpcem.tech', password: 'admin123' })
    });
    assert(res.ok, 'Login should succeed');
    assert(data.user.role === 'admin', 'Should be admin role');
  });

  await test('Login with wrong password fails', async () => {
    const { res, data } = await fetchJSON(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@mscprpcem.tech', password: 'wrongpassword' })
    });
    assert(!res.ok, 'Should fail with wrong password');
    assert(data.error, 'Should return error');
  });

  await test('Login with non-existent email fails', async () => {
    const { res, data } = await fetchJSON(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nobody@example.com', password: 'test' })
    });
    assert(!res.ok, 'Should fail');
  });

  await test('Login with missing fields returns 400', async () => {
    const { res, data } = await fetchJSON(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '' })
    });
    assert(!res.ok, 'Should fail');
    assert(data.error, 'Should have error');
  });

  await test('Register with missing fields returns 400', async () => {
    const { res, data } = await fetchJSON(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: '' })
    });
    assert(!res.ok, 'Should fail');
    assert(data.error, 'Should have error');
  });

  await test('Register with duplicate email returns 400', async () => {
    const { res, data } = await fetchJSON(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'student@mscprpcem.tech', password: 'test123' })
    });
    assert(!res.ok, 'Should fail for existing email');
    assert(data.error.includes('already registered'), 'Should mention already registered');
  });

  // ── 6. LAZY LOGIN ──
  console.log('\n🔓 [6] LAZY LOGIN');
  await test('Lazy login creates/links user profile', async () => {
    const { res, data } = await fetchJSON(`${BASE}/api/auth/lazy-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'lazytest@mscprpcem.tech' })
    });
    assert(res.ok, 'Should succeed');
    assert(data.user, 'Should return user');
    assert(data.user.email === 'lazytest@mscprpcem.tech', 'Email should match');
  });

  await test('Lazy login with missing email returns 400', async () => {
    const { res, data } = await fetchJSON(`${BASE}/api/auth/lazy-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert(!res.ok, 'Should fail');
  });

  // ── 7. SESSION CHECK ──
  console.log('\n🍪 [7] SESSION CHECK');
  await test('GET /api/auth/me without session returns null user', async () => {
    const { data } = await fetchJSON(`${BASE}/api/auth/me`);
    // Without session cookie, should return null user
    assert(data.user === null || data.user === undefined || !data.user, 'Should be null without session');
  });

  // ── 8. PUBLIC PROFILE ──
  console.log('\n👤 [8] PUBLIC PROFILE ENDPOINT');
  await test('GET /api/u/amit returns Amit profile', async () => {
    const { res, data } = await fetchJSON(`${BASE}/api/u/amit`);
    assert(res.ok, 'Should succeed');
    assert(data.user, 'Should return user');
    assert(data.user.name === 'Amit Kumar Yadav', 'Should be Amit');
    assert(data.credentials, 'Should include credentials');
    assert(Array.isArray(data.credentials), 'Credentials should be array');
  });

  await test('GET /api/u/amityadav - profile search with full name (no spaces)', async () => {
    const { res, data } = await fetchJSON(`${BASE}/api/u/amityadav`);
    // This is expected to potentially fail since REPLACE only removes spaces
    // 'amitkumaryadav' !== 'amityadav'
    if (!res.ok) {
      throw new Error('Profile search with "amityadav" fails — SQL REPLACE(name, " ", "") produces "amitkumaryadav" not "amityadav". Frontend default search is "amityadav" which won\'t match.');
    }
  });

  await test('GET /api/u/nonexistent returns 404', async () => {
    const { res, data } = await fetchJSON(`${BASE}/api/u/zzzznonexistent`);
    assert(!res.ok, 'Should fail for non-existent user');
    assert(data.error, 'Should return error');
  });

  // ── 9. SIMULATED EMAILS ──
  console.log('\n📧 [9] SIMULATED MAILBOX');
  await test('GET /api/emails/recent returns emails', async () => {
    const { data } = await fetchJSON(`${BASE}/api/emails/recent`);
    assert(Array.isArray(data), 'Should return array');
    // May or may not have emails depending on if quiz publish was triggered
  });

  // ── 10. QUIZ INTEGRATION ──
  console.log('\n🧩 [10] QUIZ INTEGRATION');
  await test('POST /api/integration/publish-results processes quiz', async () => {
    const payload = {
      quizId: "test-quiz-001",
      quizTitle: "Test Quiz Master",
      participants: [
        { name: "Test Student A", email: "testa@mscprpcem.tech", score: 95 },
        { name: "Test Student B", email: "testb@mscprpcem.tech", score: 60 },
        { name: "Test Student C", email: "testc@mscprpcem.tech", score: 30 }
      ],
      publishDate: "21 July 2026",
      rules: { passingScore: 50, goldScore: 90 }
    };
    const { res, data } = await fetchJSON(`${BASE}/api/integration/publish-results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert(res.ok, 'Should succeed');
    assert(data.success === true, 'Should return success');
    assert(data.records, 'Should have records');
    assert(data.records.length === 3, 'Should process all 3 participants');
    
    // Student A (score 95 >= 90) should get badge
    const studentA = data.records.find(r => r.name === 'Test Student A');
    assert(studentA.issued === true, 'Student A (95%) should be issued a badge');
    assert(studentA.id, 'Should have credential ID');
    
    // Student B (score 60 >= 50) should get certificate
    const studentB = data.records.find(r => r.name === 'Test Student B');
    assert(studentB.issued === true, 'Student B (60%) should be issued a certificate');
    
    // Student C (score 30 < 50) should NOT be issued
    const studentC = data.records.find(r => r.name === 'Test Student C');
    assert(studentC.issued === false, 'Student C (30%) should NOT be issued');
  });

  await test('Quiz publish with missing data returns 400', async () => {
    const { res, data } = await fetchJSON(`${BASE}/api/integration/publish-results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizTitle: '', participants: null })
    });
    assert(!res.ok, 'Should fail');
  });

  await test('After quiz, emails are created in mailbox', async () => {
    const { data } = await fetchJSON(`${BASE}/api/emails/recent`);
    assert(Array.isArray(data), 'Should return array');
    assert(data.length > 0, 'Should have emails after quiz publish');
    assert(data[0].subject, 'Email should have subject');
    assert(data[0].body, 'Email should have body');
    assert(data[0].recipient_email, 'Email should have recipient');
  });

  // ── 11. INCREMENT COUNTERS ──
  console.log('\n📈 [11] COUNTER INCREMENT ENDPOINTS');
  await test('POST /api/credentials/increment-download increments', async () => {
    const before = await fetchJSON(`${BASE}/api/credentials/metrics`);
    const { data } = await fetchJSON(`${BASE}/api/credentials/increment-download`, { method: 'POST' });
    assert(typeof data.downloadsToday === 'number', 'Should return download count');
    assert(data.downloadsToday > before.data.downloadsToday, 'Count should increase');
  });

  await test('POST /api/credentials/increment-share increments', async () => {
    const before = await fetchJSON(`${BASE}/api/credentials/metrics`);
    const { data } = await fetchJSON(`${BASE}/api/credentials/increment-share`, { method: 'POST' });
    assert(typeof data.linkedinShares === 'number', 'Should return share count');
    assert(data.linkedinShares > before.data.linkedinShares, 'Count should increase');
  });

  // ── 12. CHECK BULK ISSUE ENDPOINT EXISTS ──
  console.log('\n📦 [12] BULK ISSUE ENDPOINT');
  await test('POST /api/admin/bulk-issue endpoint exists', async () => {
    const { res, data } = await fetchJSON(`${BASE}/api/admin/bulk-issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvContent: 'test' })
    });
    // Should either return 401/403 (auth required) or 404 (endpoint missing)
    if (res.status === 404) {
      throw new Error('Bulk issue endpoint /api/admin/bulk-issue is NOT IMPLEMENTED in server.js. Frontend BulkIssueForm.jsx references it but the backend route does not exist.');
    }
    // 401/403 is acceptable - it means the route exists but needs auth
  });

  // ── 13. DATABASE INTEGRITY ──
  console.log('\n🗄️  [13] DATABASE INTEGRITY CHECKS');
  await test('Credentials have valid types (certificate/badge)', async () => {
    const { data } = await fetchJSON(`${BASE}/api/credentials/recent`);
    for (const c of data) {
      assert(c.type === 'certificate' || c.type === 'badge', `Invalid type: ${c.type} for ${c.id}`);
    }
  });

  await test('XP and Level are set correctly for student', async () => {
    const { data } = await fetchJSON(`${BASE}/api/u/amit`);
    assert(data.user.xp > 0, 'XP should be > 0');
    assert(data.user.level, 'Level should be set');
    const validLevels = ['Explorer', 'Contributor', 'Innovator', 'Expert', 'Ambassador'];
    assert(validLevels.includes(data.user.level), `Level ${data.user.level} should be valid`);
  });

  // ── FINAL REPORT ──
  console.log('\n═══════════════════════════════════════════');
  console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════\n');

  if (failures.length > 0) {
    console.log('🔴 FAILURES SUMMARY:');
    failures.forEach((f, i) => {
      console.log(`  ${i + 1}. ${f.name}`);
      console.log(`     → ${f.error}`);
    });
    console.log('');
  }

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED!\n');
  }
}

run().catch(err => console.error('Test runner error:', err));
