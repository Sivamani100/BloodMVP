import fs from 'fs';
import path from 'path';
import { getSupabaseAdmin } from '../src/server/supabase-admin';

export async function importBanksFromCSV(filePath: string) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    console.error('CSV has no data rows');
    return;
  }

  const headers = lines[0].split(',').map((h) => h.trim());
  const supabase = getSupabaseAdmin();

  let imported = 0;
  let failed = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((c) => c.trim());
    const data: Record<string, string> = {};
    headers.forEach((h, idx) => {
      data[h] = row[idx] || '';
    });

    const lat = parseFloat(data.lat);
    const lng = parseFloat(data.lng);

    if (isNaN(lat) || isNaN(lng) || lat < 6 || lat > 38 || lng < 68 || lng > 98) {
      console.warn(`Row ${i} skipped: Invalid coordinates (${data.lat}, ${data.lng})`);
      failed++;
      continue;
    }

    const phones = data.phones ? data.phones.split(';').map((p) => p.trim()) : [];
    const is24x7 = data.is_24x7 === 'true' || data.is_24x7 === '1';

    const pointWkt = `POINT(${lng} ${lat})`;

    const { error } = await supabase.from('blood_banks').upsert({
      name: data.name,
      address: data.address || null,
      city: data.city || 'Rajahmundry',
      district: data.district || null,
      state: data.state || 'Andhra Pradesh',
      geo: pointWkt,
      phones,
      bank_type: (data.bank_type as any) || 'government',
      is_24x7: is24x7,
      hours: data.hours || null,
      licence_no: data.licence_no || null,
      eraktkosh_id: data.eraktkosh_id || null,
      trust_score: 50,
      active: true,
    });

    if (error) {
      console.error(`Row ${i} error:`, error.message);
      failed++;
    } else {
      imported++;
    }
  }

  console.log(`\nImport complete: ${imported} banks imported/updated, ${failed} failed.`);
}

const args = process.argv.slice(2);
if (args[0]) {
  importBanksFromCSV(args[0]).catch(console.error);
}

