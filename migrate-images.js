/**
 * migrate-images.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Migrates base64 image data from Supabase DB columns to Supabase Storage.
 *
 * BEFORE RUNNING:
 *   1. Export your full database from Supabase Dashboard → Settings → Database
 *      → Backups (or use pg_dump). This script adds _backup columns but a
 *      full DB export is your independent safety net.
 *   2. Create two Storage buckets in Supabase Dashboard → Storage:
 *        - event-images   (public, allow anonymous reads)
 *        - legacy-images  (public, allow anonymous reads)
 *   3. Get your SERVICE ROLE key from Supabase Dashboard → Settings → API.
 *      (service role bypasses RLS — never expose this in frontend code)
 *   4. Run:  SUPABASE_SERVICE_ROLE_KEY=<your_key> node migrate-images.js
 *
 * SAFE TO RE-RUN: Uses a _img_migrated / _gallery_migrated flag column.
 * Already-migrated rows are skipped automatically.
 *
 * ROLLBACK: All original base64 values are preserved in *_backup columns.
 * To revert:
 *   UPDATE events SET img = img_backup, gallery = gallery_backup;
 *   UPDATE legacy_events SET img = img_backup;
 *   UPDATE archive_timeline SET img = img_backup;
 *   UPDATE legacy_timeline SET img = img_backup;
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://awgdgyfiouazirwdinni.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BATCH_SIZE = 5;          // max concurrent Storage uploads
const BATCH_DELAY_MS = 500;    // delay between batches (ms)

const COVER_IMAGE_TABLES = [
  { table: 'events',        bucket: 'event-images',  prefix: 'events' },
  { table: 'legacy_events', bucket: 'legacy-images', prefix: 'legacy-events' },
  // archive_timeline and legacy_timeline do NOT have img columns
];

const GALLERY_TABLES = [
  { table: 'events', bucket: 'event-images', prefix: 'gallery' },
];
// ─────────────────────────────────────────────────────────────────────────────

if (!SERVICE_ROLE_KEY) {
  console.error('\n❌ SUPABASE_SERVICE_ROLE_KEY env var is not set.');
  console.error('   Run: SUPABASE_SERVICE_ROLE_KEY=<your_key> node migrate-images.js\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function isBase64DataUri(str) {
  return typeof str === 'string' && str.startsWith('data:image/');
}

function base64ToBuffer(dataUri) {
  const [meta, data] = dataUri.split(',');
  const mimeType = meta.match(/data:([^;]+)/)[1];
  const ext = mimeType.split('/')[1].replace('jpeg', 'jpg');
  const buffer = Buffer.from(data, 'base64');
  return { buffer, mimeType, ext };
}

async function uploadBuffer(bucket, path, buffer, mimeType) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: mimeType,
      cacheControl: '31536000',
      upsert: true,
    });
  if (error) throw new Error('Storage upload failed for ' + path + ': ' + error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function generateFilename(ext) {
  const id = Date.now() + '-' + Math.random().toString(36).slice(2, 10);
  return id + '.' + ext;
}

async function runInBatches(tasks, size, delayMs) {
  const results = [];
  for (let i = 0; i < tasks.length; i += size) {
    const batch = tasks.slice(i, i + size);
    const batchResults = await Promise.allSettled(batch.map(fn => fn()));
    results.push(...batchResults);
    if (i + size < tasks.length) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return results;
}

// ── Cover Image Migration ─────────────────────────────────────────────────────

async function migrateCoverImages({ table, bucket, prefix }) {
  console.log('\n📦 Migrating cover images: ' + table + ' → ' + bucket + '/' + prefix + '/');

  const { data: rows, error } = await supabase
    .from(table)
    .select('id, img, _img_migrated')
    .order('id');

  if (error) {
    // Column may not exist yet if DDL wasn't run
    if (error.message.includes('_img_migrated')) {
      console.error('  ❌ Column _img_migrated not found in ' + table + '.');
      console.error('     Run the DDL statements in Supabase SQL Editor first (shown at startup).');
    } else {
      console.error('  ❌ Could not fetch ' + table + ': ' + error.message);
    }
    return { ok: 0, skipped: 0, failed: 0 };
  }

  const toMigrate = rows.filter(r => !r._img_migrated && isBase64DataUri(r.img));
  const alreadyDone = rows.filter(r => r._img_migrated).length;
  const noImage = rows.length - toMigrate.length - alreadyDone;

  console.log('  Total rows: ' + rows.length + ' | To migrate: ' + toMigrate.length + ' | Already done: ' + alreadyDone + ' | No image: ' + noImage);

  if (toMigrate.length === 0) {
    console.log('  ✅ Nothing to do.');
    return { ok: 0, skipped: rows.length, failed: 0 };
  }

  let ok = 0, failed = 0;

  const tasks = toMigrate.map(row => async () => {
    try {
      const { buffer, mimeType, ext } = base64ToBuffer(row.img);
      const filename = generateFilename(ext);
      const storagePath = prefix + '/' + filename;
      const publicUrl = await uploadBuffer(bucket, storagePath, buffer, mimeType);

      const { error: updateError } = await supabase
        .from(table)
        .update({ img_backup: row.img, img: publicUrl, _img_migrated: true })
        .eq('id', row.id);

      if (updateError) throw new Error(updateError.message);
      console.log('  ✅ Row ' + row.id + ' → ' + publicUrl.slice(0, 80) + '...');
      ok++;
    } catch (err) {
      console.error('  ❌ Row ' + row.id + ' failed: ' + err.message);
      failed++;
    }
  });

  await runInBatches(tasks, BATCH_SIZE, BATCH_DELAY_MS);
  return { ok, skipped: alreadyDone, failed };
}

// ── Gallery Migration ─────────────────────────────────────────────────────────

async function migrateGalleries({ table, bucket, prefix }) {
  console.log('\n🖼️  Migrating gallery arrays: ' + table + ' → ' + bucket + '/' + prefix + '/');

  const { data: rows, error } = await supabase
    .from(table)
    .select('id, gallery, _gallery_migrated')
    .order('id');

  if (error) {
    if (error.message.includes('_gallery_migrated')) {
      console.error('  ❌ Column _gallery_migrated not found. Run DDL first.');
    } else {
      console.error('  ❌ Could not fetch ' + table + ': ' + error.message);
    }
    return { ok: 0, skipped: 0, failed: 0 };
  }

  const toMigrate = rows.filter(r =>
    !r._gallery_migrated &&
    Array.isArray(r.gallery) &&
    r.gallery.some(isBase64DataUri)
  );
  const alreadyDone = rows.filter(r => r._gallery_migrated).length;

  console.log('  Total rows: ' + rows.length + ' | Galleries to migrate: ' + toMigrate.length + ' | Already done: ' + alreadyDone);

  if (toMigrate.length === 0) {
    console.log('  ✅ Nothing to do.');
    return { ok: 0, skipped: rows.length, failed: 0 };
  }

  let ok = 0, failed = 0;

  for (const row of toMigrate) {
    try {
      const gallery = row.gallery || [];
      const newGallery = new Array(gallery.length);

      const uploadTasks = gallery.map((imgStr, idx) => async () => {
        if (!isBase64DataUri(imgStr)) {
          newGallery[idx] = imgStr; // already a URL
          return;
        }
        const { buffer, mimeType, ext } = base64ToBuffer(imgStr);
        const filename = generateFilename(ext);
        const storagePath = prefix + '/row-' + row.id + '/' + filename;
        newGallery[idx] = await uploadBuffer(bucket, storagePath, buffer, mimeType);
      });

      await runInBatches(uploadTasks, BATCH_SIZE, BATCH_DELAY_MS);

      const { error: updateError } = await supabase
        .from(table)
        .update({ gallery_backup: row.gallery, gallery: newGallery, _gallery_migrated: true })
        .eq('id', row.id);

      if (updateError) throw new Error(updateError.message);
      console.log('  ✅ Row ' + row.id + ': migrated ' + gallery.length + ' gallery images');
      ok++;
    } catch (err) {
      console.error('  ❌ Row ' + row.id + ' gallery failed: ' + err.message);
      failed++;
    }
  }

  return { ok, skipped: alreadyDone, failed };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('  ORATORS SOCIETY — Image Storage Migration');
  console.log('  base64 DB columns → Supabase Storage');
  console.log('='.repeat(70));

  const ddl = `
-- Run this FIRST in Supabase SQL Editor before running this script:
ALTER TABLE events ADD COLUMN IF NOT EXISTS img_backup text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS _img_migrated boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS gallery_backup jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS _gallery_migrated boolean DEFAULT false;
ALTER TABLE legacy_events ADD COLUMN IF NOT EXISTS img_backup text;
ALTER TABLE legacy_events ADD COLUMN IF NOT EXISTS _img_migrated boolean DEFAULT false;
ALTER TABLE archive_timeline ADD COLUMN IF NOT EXISTS img_backup text;
ALTER TABLE archive_timeline ADD COLUMN IF NOT EXISTS _img_migrated boolean DEFAULT false;
ALTER TABLE legacy_timeline ADD COLUMN IF NOT EXISTS img_backup text;
ALTER TABLE legacy_timeline ADD COLUMN IF NOT EXISTS _img_migrated boolean DEFAULT false;
  `.trim();

  console.log('\n⚠️  PRE-FLIGHT — confirm these are done before continuing:');
  console.log('  1. Full DB export/backup taken (Dashboard → Settings → Database → Backups)');
  console.log('  2. "event-images" bucket created in Supabase Storage (public access)');
  console.log('  3. "legacy-images" bucket created in Supabase Storage (public access)');
  console.log('\n  DDL to run in SQL Editor:\n');
  console.log(ddl);
  console.log('\n  Starting in 5 seconds... press Ctrl+C to abort.\n');
  await new Promise(r => setTimeout(r, 5000));

  // Verify connection
  console.log('🔗 Verifying Supabase connection...');
  const { error: pingError } = await supabase.from('events').select('id').limit(1);
  if (pingError) {
    console.error('❌ Cannot connect: ' + pingError.message);
    console.error('   Check SUPABASE_SERVICE_ROLE_KEY and that the DDL above was run.');
    process.exit(1);
  }
  console.log('✅ Connected.\n');

  const totals = { ok: 0, skipped: 0, failed: 0 };

  for (const config of COVER_IMAGE_TABLES) {
    const r = await migrateCoverImages(config);
    totals.ok += r.ok; totals.skipped += r.skipped; totals.failed += r.failed;
  }

  for (const config of GALLERY_TABLES) {
    const r = await migrateGalleries(config);
    totals.ok += r.ok; totals.skipped += r.skipped; totals.failed += r.failed;
  }

  console.log('\n' + '='.repeat(70));
  console.log('  COMPLETE — Migrated: ' + totals.ok + '  |  Skipped: ' + totals.skipped + '  |  Failed: ' + totals.failed);
  console.log('='.repeat(70));

  if (totals.failed > 0) {
    console.log('\n⚠️  Re-run the script — it will skip already-migrated rows.');
    console.log('   Originals preserved in *_backup columns.');
    process.exit(1);
  }

  console.log('\n🎉 All done! Next steps:');
  console.log('  1. Open the app — verify all images load from supabase.co/storage URLs.');
  console.log('  2. Set up Cloudflare Worker CDN (see cloudflare-worker.js artifact).');
  console.log('  3. Set VITE_CDN_BASE_URL in .env, then rebuild/redeploy.');
  console.log('  4. After full verification, drop backup columns:\n');
  console.log('     ALTER TABLE events DROP COLUMN img_backup, gallery_backup, _img_migrated, _gallery_migrated;');
  console.log('     ALTER TABLE legacy_events DROP COLUMN img_backup, _img_migrated;');
  console.log('     ALTER TABLE archive_timeline DROP COLUMN img_backup, _img_migrated;');
  console.log('     ALTER TABLE legacy_timeline DROP COLUMN img_backup, _img_migrated;\n');
  process.exit(0);
}

main().catch(err => {
  console.error('\n💥 Unexpected error:', err);
  process.exit(1);
});
