'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Lib = require('../lib/slslib.js');

const geo = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'Final_SLS_202517301.geojson'), 'utf8'));
const features = geo.features;

// Synthetic sheet shaped like the real DSLS tab: title rows, a header whose
// code/name columns are paired, a "Petugas" sub-header, unpadded SLS codes,
// a totals block and a second header at the bottom. Names are fake.
function dslsRows(dataRows) {
  const blank = Array(26).fill('');
  const header = ['', '', 'NO.', 'Provinsi', '', 'Kabupaten', '', 'Kecamatan', '', 'Desa / Kelurahan / Nagari', '', 'Kode SLS', 'Kode Sub SLS', 'Nama SLS', 'NKS', 'Klasifikasi', 'Strata', 'Muatan', 'Dominan', 'Layer', 'Perkiraan Jumlah Keluarga Wilkerstat 2025', 'Perkiraan Jumlah Bangunan', 'Perkiraan Jumlah Keluarga SE2026'];
  // In the real file this row also carries the headers of the replacement-proposal table.
  const sub = ['', 'Petugas', ...Array(23).fill(''), 'Kode Kec (3 digit)', 'Nama Kecamatan', 'Kode desa (3 digit)', 'Nama desa', 'Kode SLS (4 digit)', 'Kode Sub SLS (2 digit)', 'Nama SLS'];
  const total = ['', '', '', '', 'Total Petugas', '1', ...Array(20).fill('')];
  const header2 = ['', '', 'NO.', 'Provinsi', '', 'Kabupaten', '', 'Kecamatan', '', 'Desa', '', 'Kode SLS', 'Kode Sub SLS', 'Nama SLS'];
  return [
    blank,
    ['', '', 'DAFTAR SAMPEL SATUAN LINGKUNGAN SETEMPAT'],
    blank,
    header,
    sub,
    ...dataRows,
    total,
    header2,
    ['', '', '1', '73', 'X', '01', 'Y', '030', 'Z', '003', 'W', '2', '0', 'DUSUN LAIN']
  ];
}

const APPATANAH = ['FALSE', 'Petugas Contoh', '1', '73', 'SULAWESI SELATAN', '01', 'KEPULAUAN SELAYAR', '030', 'BONTOSIKUYU', '003', 'APPATANAH', '2', '0', 'RT 02 RK 02 DUSUN BUNGING', '100242', '2', '2', '1', 'Biasa/Lainnya', '3', '82', '70', '56'];

test('parseDsls reads the DSLS layout and pads the SLS code', () => {
  const r = Lib.parseDsls(dslsRows([APPATANAH]));
  assert.equal(r.error, '');
  assert.equal(r.entries.length, 1);
  assert.equal(r.entries[0].idsls, '73010300030002');
  assert.equal(r.entries[0].petugas, 'Petugas Contoh');
  assert.equal(r.entries[0].nks, '100242');
  assert.equal(r.entries[0].keluarga, '56');
});

test('parseDsls stops at the totals block and ignores the second header', () => {
  const r = Lib.parseDsls(dslsRows([APPATANAH, APPATANAH.map((v, i) => (i === 11 ? '1' : v))]));
  assert.equal(r.entries.length, 2);
});

test('parseDsls accepts a minimal template with only codes', () => {
  const rows = [
    ['Kode Kec', 'Kode Desa', 'Kode SLS', 'Nama SLS'],
    ['030', '003', '2', 'RT 02 RK 02 DUSUN BUNGING']
  ];
  const r = Lib.parseDsls(rows, { kdprov: '73', kdkab: '01' });
  assert.equal(r.entries[0].idsls, '73010300030002');
});

test('parseDsls reports a clear error when no header exists', () => {
  const r = Lib.parseDsls([['a', 'b'], ['1', '2']]);
  assert.match(r.error, /Header tidak ditemukan/);
  assert.equal(r.entries.length, 0);
});

test('parseDsls keeps only flag_sampel = 1 rows when that column exists', () => {
  const rows = [
    ['NO.', 'Provinsi', '', 'Kabupaten', '', '', 'Kecamatan', '', 'Desa', 'Kode SLS', 'Kode Sub SLS', 'Nama SLS', 'flag_sampel'],
    ['1', '73', 'S', '01', 'K', '030', 'BONTOSIKUYU', '003', 'APPATANAH', '0002', '00', 'RT 02 RK 02 DUSUN BUNGING', '1'],
    ['2', '73', 'S', '01', 'K', '030', 'BONTOSIKUYU', '003', 'APPATANAH', '0001', '00', 'RT 01 RK 01 DUSUN KANAWE', '0']
  ];
  const r = Lib.parseDsls(rows);
  assert.equal(r.entries.length, 1);
  assert.equal(r.entries[0].idsls, '73010300030002');
});

test('matchEntries matches by code and reports unknown codes', () => {
  const bad = APPATANAH.map((v, i) => (i === 11 ? '999' : v));
  const { entries } = Lib.parseDsls(dslsRows([APPATANAH, bad]));
  const { matched, failed } = Lib.matchEntries(entries, features);
  assert.equal(matched.length, 1);
  assert.equal(matched[0].features[0].properties.idsls, '73010300030002');
  assert.equal(failed.length, 1);
  assert.match(failed[0].reason, /tidak ada di peta/);
});

test('matchEntries falls back to names and flags duplicates', () => {
  const rows = [
    ['Kecamatan', 'Desa', 'Kode SLS', 'Nama SLS'],
    ['bontosikuyu', 'Appatanah', '', 'rt 02 rk 02 dusun bunging'],
    ['bontosikuyu', 'Appatanah', '', 'rt 02 rk 02 dusun bunging']
  ];
  const { entries } = Lib.parseDsls(rows);
  const { matched, failed } = Lib.matchEntries(entries, features);
  assert.equal(matched.length, 1);
  assert.equal(matched[0].via, 'nama');
  assert.match(failed[0].reason, /ganda/);
});

test('matchEntries honours sub-SLS and highlights every polygon otherwise', () => {
  const idsls = '73010410010023'; // has sub-SLS 01 and 02 in the GeoJSON
  const all = features.filter((f) => f.properties.idsls === idsls);
  assert.ok(all.length > 1, 'fixture assumption: this SLS has several polygons');

  const row = (subCode) => ['FALSE', '', '1', '73', 'S', '01', 'K', '041', 'BENTENG', '001', 'BENTENG SELATAN', '23', subCode, 'RT 01 RW 01 LINGKUNGAN BONEHALANG'];
  const only = Lib.matchEntries(Lib.parseDsls(dslsRows([row('1')])).entries, features);
  assert.equal(only.matched[0].features.length, 1);
  assert.equal(only.matched[0].features[0].properties.idsubsls, '7301041001002301');

  const whole = Lib.matchEntries(Lib.parseDsls(dslsRows([row('0')])).entries, features);
  assert.equal(whole.matched[0].features.length, all.length);
});

test('canonicalId agrees with idsubsls for every feature, unlike the idsls property', () => {
  let idslsMismatches = 0;
  for (const f of features) {
    const p = f.properties;
    assert.equal(Lib.canonicalId(p), p.idsubsls.slice(0, 14));
    if (p.idsls !== Lib.canonicalId(p)) idslsMismatches++;
  }
  assert.equal(idslsMismatches, 3, 'known data quirk: 3 features have a stale idsls');
});

/* ------------------------------- mitra ------------------------------- */

const MITRA_HEADER = ['Nama Lengkap', 'P3K', 'Posisi', 'Status Seleksi', 'Alamat Detail', 'Alamat Provinsi', 'Alamat Kab/Kota', 'Alamat Kecamatan', 'Alamat Desa/Kel', 'Tempat, Tanggal Lahir', 'No Telp', 'Email', 'SOBAT ID', 'Berpengalaman CAPI', 'Punya HP Android', 'Bisa Mengendarai Motor', 'Pernah SP', 'Pernah ST', 'Pernah SE', 'Pernah Susenas', 'Pernah Sakernas', 'Pernah SBH', 'Status NIK'];
const mitraRow = (nama, status, detail, desa, extra = {}) => [nama, '', 'Mitra Pendataan', status, detail, '(73) SULSEL', '(01) SELAYAR', '(030) BONTOSIKUYU', desa, '-, 1 Januari 1990', '08123', 'a@b.c', '7301', extra.capi || 'Tidak', 'Ya', 'Ya', 'Ya', 'Tidak', 'Tidak', 'Ya', 'Tidak', 'Tidak', 'terverifikasi'];

test('parseMitra keeps only approved partners and drops sensitive columns', () => {
  const rows = [MITRA_HEADER, mitraRow('Mitra A', 'Diterima', 'Dusun Bunging', '(003) APPATANAH', { capi: 'Ya' }), mitraRow('Mitra B', '', 'Dusun X', '(003) APPATANAH'), Array(23).fill('')];
  const r = Lib.parseMitra(rows);
  assert.equal(r.mitra.length, 1);
  const m = r.mitra[0];
  assert.deepEqual(Object.keys(m).sort(), ['alamat', 'android', 'capi', 'idsls', 'kddesa', 'kdkec', 'motor', 'nama', 'pengalaman', 'posisi']);
  assert.equal(m.kdkec, '030');
  assert.equal(m.kddesa, '003');
  assert.equal(m.capi, true);
  assert.deepEqual(m.pengalaman, ['SP', 'Susenas']);
  assert.ok(!JSON.stringify(m).includes('08123'));
  assert.ok(!JSON.stringify(m).includes('a@b.c'));
});

test('mitraForSls ranks exact id, then dusun match, then desa only', () => {
  const sls = features.find((f) => f.properties.idsls === '73010300030002').properties; // DUSUN BUNGING
  const mk = (nama, alamat, idsls = '') => ({ nama, alamat, idsls, kdkec: '030', kddesa: '003', posisi: '', capi: false, android: false, motor: false, pengalaman: [] });
  const list = [
    mk('Desa Saja', 'Dusun Lain'),
    mk('Dusun Cocok', 'Jl. Mawar, Dusun Bunging'),
    mk('Tepat', '', '73010300030002'),
    mk('Tempat Lain', 'Dusun Bunging', '73010300030001')
  ];
  const out = Lib.mitraForSls(list, sls).map((x) => [x.mitra.nama, x.level]);
  assert.deepEqual(out, [['Tepat', 'tepat'], ['Dusun Cocok', 'dusun'], ['Desa Saja', 'desa']]);
});

test('mitraForSls ignores partners from other desa', () => {
  const sls = features.find((f) => f.properties.idsls === '73010300030002').properties;
  const other = { nama: 'Luar', alamat: 'Dusun Bunging', idsls: '', kdkec: '030', kddesa: '004' };
  assert.equal(Lib.mitraForSls([other], sls).length, 0);
});

/* ------------------------------ theme & panel ------------------------------ */

test('resolveTheme uses the saved choice and defaults to light', () => {
  assert.equal(Lib.resolveTheme('light'), 'light');
  assert.equal(Lib.resolveTheme('dark'), 'dark');
  assert.equal(Lib.resolveTheme(null), 'light');
  assert.equal(Lib.resolveTheme(undefined), 'light');
  assert.equal(Lib.resolveTheme('bogus'), 'light');
});

test('clampPanelSize keeps the panel inside its bounds and tolerates bad input', () => {
  assert.equal(Lib.clampPanelSize(100, 300, 700), 300);
  assert.equal(Lib.clampPanelSize(900, 300, 700), 700);
  assert.equal(Lib.clampPanelSize(420.6, 300, 700), 421);
  assert.equal(Lib.clampPanelSize('abc', 300, 700, 380), 380);
  // a tiny container must not push the maximum below the minimum
  assert.equal(Lib.clampPanelSize(500, 300, 200), 300);
});
