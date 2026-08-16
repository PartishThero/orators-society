/**
 * transfer-data.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Copies all table data from your OLD Supabase project to the NEW one.
 *
 * RUN:
 *   OLD_SERVICE_KEY=<old-service-role-key> \
 *   NEW_SERVICE_KEY=<new-service-role-key> \
 *   node transfer-data.js
 *
 * What it transfers:
 *   ✅ events
 *   ✅ legacy_events
 *   ✅ archive_timeline
 *   ✅ legacy_timeline
 *   ✅ global_settings
 *   ✅ allowed_admins
 *   ✅ event_registrations  (set SKIP_SUBMISSIONS=true to skip)
 *   ✅ society_petitions     (set SKIP_SUBMISSIONS=true to skip)
 *
 * What it does NOT transfer:
 *   ❌ Auth users — re-create admin manually in the new Dashboard.
 *      (Authentication → Users → Add User, then log into /admin as normal)
 *
 * Images:
 *   Base64 image data is transferred as-is along with the row data.
 *   After this script finishes, run migrate-images.js to move them to Storage.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';

const OLD_URL = 'https://axcateydvmmhukwvvvvt.supabase.co';
const NEW_URL = 'https://awgdgyfiouazirwdinni.supabase.co';

const OLD_SERVICE_KEY = process.env.OLD_SERVICE_KEY;
const NEW_SERVICE_KEY = process.env.NEW_SERVICE_KEY;
const SKIP_SUBMISSIONS = process.env.SKIP_SUBMISSIONS === 'true';

if (!OLD_SERVICE_KEY || !NEW_SERVICE_KEY) {
  console.error('\n❌ Missing environment variables.');
  console.error('   Run with:');
  console.error('   OLD_SERVICE_KEY=<key> NEW_SERVICE_KEY=<key> node transfer-data.js\n');
  process.exit(1);
}

const oldDb = createClient(OLD_URL, OLD_SERVICE_KEY, { auth: { persistSession: false } });
const newDb = createClient(NEW_URL, NEW_SERVICE_KEY, { auth: { persistSession: false } });

async function transferTable(tableName, transform, chunkSize = 100) {
  console.log('\n📋 Transferring: ' + tableName);

  const { data: rows, error: fetchError } = await oldDb
    .from(tableName)
    .select('*')
    .order('id', { ascending: true });

  if (fetchError) {
    console.error('  ❌ Fetch failed: ' + fetchError.message);
    return { ok: 0, failed: 1 };
  }

  if (!rows || rows.length === 0) {
    console.log('  ⏭️  No rows — skipping.');
    return { ok: 0, failed: 0 };
  }

  console.log('  Found ' + rows.length + ' rows in old project.');
  const payload = transform(rows);

  let ok = 0;
  for (let i = 0; i < payload.length; i += chunkSize) {
    const chunk = payload.slice(i, i + chunkSize);
    const { error } = await newDb.from(tableName).insert(chunk);
    if (error) {
      console.error('  ❌ Insert chunk ' + i + ': ' + error.message);
    } else {
      ok += chunk.length;
    }
  }

  console.log('  ✅ Inserted ' + ok + ' / ' + rows.length + ' rows.');
  return { ok, failed: rows.length - ok };
}

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('  ORATORS SOCIETY — Data Transfer');
  console.log('  OLD: ' + OLD_URL);
  console.log('  NEW: ' + NEW_URL);
  console.log('='.repeat(70));

  console.log('\n🔗 Verifying connections...');
  const { error: oldPing } = await oldDb.from('events').select('id').limit(1);
  if (oldPing) { console.error('❌ Cannot reach OLD project: ' + oldPing.message); process.exit(1); }
  const { error: newPing } = await newDb.from('events').select('id').limit(1);
  if (newPing) { console.error('❌ Cannot reach NEW project: ' + newPing.message); process.exit(1); }
  console.log('✅ Both connected. Starting in 3s... (Ctrl+C to abort)');
  await new Promise(r => setTimeout(r, 3000));

  const totals = { ok: 0, failed: 0 };

  // Strip id + created_at so Postgres generates fresh ones
  const stripId = rows => rows.map(({ id, created_at, ...rest }) => rest);
  const stripIdOnly = rows => rows.map(({ id, ...rest }) => rest);
  // Keep created_at for audit tables (registrations, petitions)
  const stripIdKeepDate = rows => rows.map(({ id, created_at, ...rest }) => ({ ...rest, created_at }));

  const add = r => { totals.ok += r.ok; totals.failed += r.failed; };

  // Set ONLY_FAILED=true to skip tables that already transferred OK
  const onlyFailed = process.env.ONLY_FAILED === 'true';

  if (!onlyFailed) {
    add(await transferTable('events', stripId));
  } else {
    console.log('\n⏭️  Skipping events (already transferred).');
  }
  // Explicitly pick only columns that exist in the new schema
  // (old project may have extra cols like 'attendance' that were never in legacy_events)
  add(await transferTable('legacy_events', rows =>
    rows.map(({ img, title, subtitle, date, synopsis, winner, location,
                height, col_span, status, bio, google_form_link }) => ({
      img, title, subtitle, date, synopsis, winner, location,
      height, col_span, status, bio, google_form_link
    }))
  ));
  // archive_timeline has no created_at in new schema — strip both id and created_at
  add(await transferTable('archive_timeline', rows =>
    rows.map(({ year, title, badge, entries }) => ({ year, title, badge, entries }))
  ));

  // legacy_timeline has no created_at in new schema
  add(await transferTable('legacy_timeline', rows =>
    rows.map(({ year, title, body, active }) => ({ year, title, body, active }))
  ));

  // global_settings — upsert on key to avoid duplicate seed row
  console.log('\n📋 Transferring: global_settings (upsert)');
  const { data: gs } = await oldDb.from('global_settings').select('*');
  if (gs?.length) {
    const payload = gs.map(({ id, ...rest }) => rest);
    const { error } = await newDb.from('global_settings').upsert(payload, { onConflict: 'key' });
    if (error) { console.error('  ❌ ' + error.message); totals.failed++; }
    else { console.log('  ✅ ' + payload.length + ' settings.'); totals.ok += payload.length; }
  } else { console.log('  ⏭️  Empty.'); }

  // allowed_admins — upsert on email so existing whitelist entry isn't duplicated
  console.log('\n📋 Transferring: allowed_admins (upsert)');
  const { data: admins } = await oldDb.from('allowed_admins').select('*');
  if (admins?.length) {
    const payload = admins.map(({ id, created_at, ...rest }) => rest);
    const { error } = await newDb.from('allowed_admins').upsert(payload, { onConflict: 'email' });
    if (error) { console.error('  ❌ ' + error.message); totals.failed++; }
    else { console.log('  ✅ ' + payload.length + ' admin emails.'); totals.ok += payload.length; }
  } else { console.log('  ⏭️  Empty.'); }

  if (SKIP_SUBMISSIONS) {
    console.log('\n⏭️  Skipping registrations + petitions (SKIP_SUBMISSIONS=true)');
  } else if (onlyFailed) {
    console.log('\n⏭️  Skipping event_registrations (already transferred).');
    add(await transferTable('society_petitions', stripIdKeepDate));
    add(await transferTable('event_registrations', stripIdKeepDate));
    add(await transferTable('society_petitions', stripIdKeepDate));
  }

  console.log('\n' + '='.repeat(70));
  console.log('  DONE — Transferred: ' + totals.ok + '  |  Failed: ' + totals.failed);
  console.log('='.repeat(70));

  if (totals.failed > 0) {
    console.log('\n⚠️  Some rows failed. Check errors above and re-run if needed.');
    process.exit(1);
  }

  console.log('\n🎉 All data transferred! Next steps:');
  console.log('  1. Update migrate-images.js line 32 with the NEW project URL.');
  console.log('  2. Run the image migration to move base64 → Storage:');
  console.log('     SUPABASE_SERVICE_ROLE_KEY=<new-service-key> node migrate-images.js');
  console.log('  3. Re-create your admin Auth user in new Dashboard → Authentication → Users.');
  console.log('  4. Open /admin, log in, verify everything looks correct.\n');
  process.exit(0);
}

main().catch(err => {
  console.error('\n💥 Unexpected error:', err);
  process.exit(1);
});
