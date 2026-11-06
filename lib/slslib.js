/**
 * Pure helpers for the sample-SLS upload (DSLS) and partner (mitra) lookup.
 * No DOM access, so everything here can be unit-tested with `node --test`.
 * Loaded in the browser as `window.SlsLib`, and via require() in tests.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SlsLib = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const digits = (v) => String(v == null ? '' : v).trim().replace(/\.0+$/, '');
  const isDigits = (v) => /^\d+$/.test(digits(v));
  const pad = (v, n) => digits(v).padStart(n, '0');

  function normalizeText(s) {
    return String(s == null ? '' : s)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, ' ')
      .trim();
  }

  /** Build the 14-digit idsls used in the GeoJSON from its parts. */
  function buildIdsls(kdprov, kdkab, kdkec, kddesa, kdsls) {
    return pad(kdprov, 2) + pad(kdkab, 2) + pad(kdkec, 3) + pad(kddesa, 3) + pad(kdsls, 4);
  }

  /**
   * Canonical 14-digit SLS id of a GeoJSON feature, built from its code parts.
   * The `idsls` property is not reliable: 3 of the 721 features carry an idsls
   * that disagrees with their own kdsls/idsubsls, so it is never used as a key.
   */
  function canonicalId(props) {
    return buildIdsls(props.kdprov, props.kdkab, props.kdkec, props.kddesa, props.kdsls);
  }

  /** "(030) BONTOSIKUYU" -> { code: '030', name: 'BONTOSIKUYU' } */
  function parseCodedName(s) {
    const m = String(s == null ? '' : s).match(/^\s*\((\d+)\)\s*(.*)$/);
    return m ? { code: m[1], name: m[2].trim() } : { code: '', name: String(s || '').trim() };
  }

  const cellText = (c) => String(c == null ? '' : c).replace(/\s+/g, ' ').trim();

  function findHeaderRow(rows) {
    for (let i = 0; i < rows.length; i++) {
      const cells = (rows[i] || []).map(cellText);
      const hasSls = cells.some((c) => /kode\s*sls/i.test(c) || /^id\s*sls$/i.test(c));
      const hasKec = cells.some((c) => /kecamatan|kode\s*kec/i.test(c)) || cells.some((c) => /^id\s*sls$/i.test(c));
      if (hasSls && hasKec) return i;
    }
    return -1;
  }

  function indexOfHeader(headers, re, from = 0) {
    for (let i = from; i < headers.length; i++) if (re.test(headers[i])) return i;
    return -1;
  }

  /**
   * Resolve (code, name) for an administrative level (kec/desa/kab) from a row.
   * The DSLS layout puts the code under the header and the name in the next,
   * header-less column; other layouts put the name under the header and the
   * code in the previous column. Both are handled here.
   */
  function readLevel(row, headerCol, explicitCodeCol) {
    if (explicitCodeCol >= 0) {
      return { code: digits(row[explicitCodeCol]), name: cellText(row[explicitCodeCol + 1]) };
    }
    if (headerCol < 0) return { code: '', name: '' };
    const v = cellText(row[headerCol]);
    if (isDigits(v)) return { code: digits(v), name: cellText(row[headerCol + 1]) };
    const prev = headerCol > 0 ? row[headerCol - 1] : '';
    return { code: isDigits(prev) ? digits(prev) : '', name: v };
  }

  /**
   * Parse the rows of a sheet into sample-SLS entries.
   * rows: array of arrays (SheetJS `header: 1`). Title rows above the header,
   * zero-less codes, a trailing "Total" block and a second header are tolerated.
   */
  function parseDsls(rows, defaults = {}) {
    const result = { entries: [], skipped: 0, headerRow: -1, error: '' };
    const h = findHeaderRow(rows);
    if (h < 0) {
      result.error = 'Header tidak ditemukan: kolom "Kode SLS" dan "Kecamatan" harus ada.';
      return result;
    }
    result.headerRow = h;
    const headers = rows[h].map(cellText);

    const col = {
      prov: indexOfHeader(headers, /^provinsi$/i),
      kab: indexOfHeader(headers, /^kabupaten|^kab\/kota$/i),
      kecCode: indexOfHeader(headers, /^kode\s*kec/i),
      kec: indexOfHeader(headers, /^kecamatan$/i),
      desaCode: indexOfHeader(headers, /^kode\s*(desa|kel)/i),
      desa: indexOfHeader(headers, /^desa/i),
      sls: indexOfHeader(headers, /^kode\s*sls/i),
      sub: indexOfHeader(headers, /sub\s*sls/i),
      nama: indexOfHeader(headers, /^nama\s*sls$/i),
      nks: indexOfHeader(headers, /^nks$/i),
      idsls: indexOfHeader(headers, /^id\s*sls$|^idsls$/i),
      keluarga: indexOfHeader(headers, /keluarga\s*se2026/i),
      flag: indexOfHeader(headers, /^flag_sampel$/i)
    };
    // "Petugas" sits in a sub-header row just below the main header in DSLS.
    let petugasCol = -1;
    for (let i = h; i < Math.min(rows.length, h + 4) && petugasCol < 0; i++) {
      petugasCol = (rows[i] || []).findIndex((c) => /^petugas$/i.test(cellText(c)));
    }
    if (col.sls < 0 && col.idsls < 0) {
      result.error = 'Kolom "Kode SLS" tidak ditemukan.';
      return result;
    }

    const seen = new Set();
    for (let i = h + 1; i < rows.length; i++) {
      const row = rows[i] || [];
      const joined = row.map(cellText).join(' ');
      if (!joined.trim()) continue;
      if (/total petugas/i.test(joined)) break;
      if (row.some((c) => /^petugas$/i.test(cellText(c)))) continue; // sub-header row under the main header
      if (findHeaderRow([row]) === 0) break; // second header block: stop

      if (col.flag >= 0 && digits(row[col.flag]) !== '1') continue;

      const kec = readLevel(row, col.kec, col.kecCode);
      const desa = readLevel(row, col.desa, col.desaCode);
      const kab = readLevel(row, col.kab, -1);
      const prov = readLevel(row, col.prov, -1);
      const slsRaw = col.sls >= 0 ? digits(row[col.sls]) : '';
      const idDirect = col.idsls >= 0 ? digits(row[col.idsls]) : '';
      const nama = col.nama >= 0 ? cellText(row[col.nama]) : '';

      let idsls = '';
      let via = '';
      if (/^\d{14}$/.test(idDirect)) {
        idsls = idDirect;
        via = 'kode';
      } else if (isDigits(slsRaw) && kec.code && desa.code) {
        idsls = buildIdsls(
          prov.code || defaults.kdprov || '',
          kab.code || defaults.kdkab || '',
          kec.code,
          desa.code,
          slsRaw
        );
        via = 'kode';
      } else if (nama && kec.name && desa.name) {
        via = 'nama';
      } else {
        result.skipped++;
        continue;
      }

      const sub = col.sub >= 0 ? digits(row[col.sub]) : '';
      const dedupKey = (idsls || `${kec.name}|${desa.name}|${nama}`) + '|' + (Number(sub) || 0);
      const entry = {
        rowNumber: i + 1,
        idsls,
        via,
        kdsub: sub ? pad(sub, 2) : '00',
        nmkec: kec.name,
        nmdesa: desa.name,
        nmsls: nama,
        nks: col.nks >= 0 ? cellText(row[col.nks]) : '',
        petugas: petugasCol >= 0 ? cellText(row[petugasCol]) : '',
        keluarga: col.keluarga >= 0 ? cellText(row[col.keluarga]) : '',
        duplicate: seen.has(dedupKey)
      };
      seen.add(dedupKey);
      result.entries.push(entry);
    }
    return result;
  }

  /**
   * Match parsed entries to GeoJSON features. One SLS code can span several
   * polygons (sub-SLS), so each match holds a list of features.
   */
  function matchEntries(entries, features) {
    const byId = new Map();
    const byName = new Map();
    for (const f of features) {
      const p = f.properties;
      const id = canonicalId(p);
      if (!byId.has(id)) byId.set(id, []);
      byId.get(id).push(f);
      const nk = [p.nmkec, p.nmdesa, p.nmsls].map(normalizeText).join('|');
      if (!byName.has(nk)) byName.set(nk, []);
      byName.get(nk).push(f);
    }

    const matched = [];
    const failed = [];
    for (const e of entries) {
      if (e.duplicate) {
        failed.push({ entry: e, reason: 'Baris ganda (SLS yang sama sudah ada di file)' });
        continue;
      }
      let list = null;
      if (e.via === 'kode') {
        list = byId.get(e.idsls);
        if (!list) {
          failed.push({ entry: e, reason: 'Kode SLS tidak ada di peta' });
          continue;
        }
      } else {
        list = byName.get([e.nmkec, e.nmdesa, e.nmsls].map(normalizeText).join('|'));
        if (!list) {
          failed.push({ entry: e, reason: 'Nama kecamatan/desa/SLS tidak ditemukan di peta' });
          continue;
        }
      }
      if (e.kdsub !== '00') {
        const subOnly = list.filter((f) => pad(f.properties.kdsubsls, 2) === e.kdsub);
        if (subOnly.length === 0) {
          failed.push({ entry: e, reason: `Sub-SLS ${e.kdsub} tidak ada di peta` });
          continue;
        }
        list = subOnly;
      }
      matched.push({ entry: e, features: list, via: e.via });
    }
    return { matched, failed };
  }

  /* ---------------------------- Mitra (partners) ---------------------------- */

  /**
   * Fields kept from a partner sheet. Anything else (phone, email, birth date,
   * SOBAT ID, NIK status, ...) is dropped here and never reaches the UI.
   */
  const MITRA_EXPERIENCE = [
    ['Pernah SP', 'SP'],
    ['Pernah ST', 'ST'],
    ['Pernah SE', 'SE'],
    ['Pernah Susenas', 'Susenas'],
    ['Pernah Sakernas', 'Sakernas'],
    ['Pernah SBH', 'SBH']
  ];

  const yes = (v) => /^(ya|y|1|true)$/i.test(cellText(v));

  function parseMitra(rows) {
    const out = { mitra: [], error: '' };
    let h = -1;
    for (let i = 0; i < Math.min(rows.length, 15); i++) {
      const cells = (rows[i] || []).map(cellText);
      if (cells.some((c) => /^nama lengkap$/i.test(c)) && cells.some((c) => /alamat desa/i.test(c))) {
        h = i;
        break;
      }
    }
    if (h < 0) {
      out.error = 'Kolom "Nama Lengkap" dan "Alamat Desa/Kel" tidak ditemukan.';
      return out;
    }
    const headers = rows[h].map(cellText);
    const ix = (re) => indexOfHeader(headers, re);
    const c = {
      nama: ix(/^nama lengkap$/i),
      posisi: ix(/^posisi$/i),
      status: ix(/^status seleksi$/i),
      detail: ix(/^alamat detail$/i),
      kec: ix(/^alamat kecamatan$/i),
      desa: ix(/^alamat desa/i),
      idsls: ix(/^id\s*sls$|^idsls$/i),
      capi: ix(/berpengalaman capi/i),
      android: ix(/punya hp android/i),
      motor: ix(/bisa mengendarai motor/i)
    };
    const exp = MITRA_EXPERIENCE.map(([header, label]) => [ix(new RegExp('^' + header + '$', 'i')), label]);

    for (let i = h + 1; i < rows.length; i++) {
      const row = rows[i] || [];
      const nama = cellText(row[c.nama]);
      if (!nama) continue;
      if (c.status >= 0 && !/^diterima$/i.test(cellText(row[c.status]))) continue;
      const kec = parseCodedName(row[c.kec]);
      const desa = parseCodedName(row[c.desa]);
      if (!kec.code || !desa.code) continue;
      out.mitra.push({
        nama,
        posisi: c.posisi >= 0 ? cellText(row[c.posisi]) : '',
        alamat: c.detail >= 0 ? cellText(row[c.detail]) : '',
        kdkec: pad(kec.code, 3),
        kddesa: pad(desa.code, 3),
        idsls: c.idsls >= 0 && /^\d{14}$/.test(digits(row[c.idsls])) ? digits(row[c.idsls]) : '',
        capi: c.capi >= 0 && yes(row[c.capi]),
        android: c.android >= 0 && yes(row[c.android]),
        motor: c.motor >= 0 && yes(row[c.motor]),
        pengalaman: exp.filter(([col]) => col >= 0 && yes(row[col])).map(([, label]) => label)
      });
    }
    return out;
  }

  /** "RT 02 RK 02 DUSUN BUNGING" -> "BUNGING" (normalized), or '' when none. */
  function dusunOf(nmsls) {
    const m = normalizeText(nmsls).match(/\b(?:DUSUN|LINGKUNGAN|KAMPUNG|PULAU)\s+(.+)$/);
    return m ? m[1] : '';
  }

  /**
   * Partners relevant to one SLS, best match first:
   *  - 'tepat'  the sheet has an ID SLS equal to this SLS
   *  - 'dusun'  same desa and the address mentions this SLS's dusun
   *  - 'desa'   same desa only
   */
  function mitraForSls(mitraList, props) {
    const dusun = dusunOf(props.nmsls);
    const result = [];
    for (const m of mitraList) {
      if (m.idsls) {
        if (m.idsls === canonicalId(props)) result.push({ mitra: m, level: 'tepat' });
        continue;
      }
      if (m.kdkec !== pad(props.kdkec, 3) || m.kddesa !== pad(props.kddesa, 3)) continue;
      const addr = ' ' + normalizeText(m.alamat) + ' ';
      const level = dusun.length >= 3 && addr.includes(' ' + dusun + ' ') ? 'dusun' : 'desa';
      result.push({ mitra: m, level });
    }
    const rank = { tepat: 0, dusun: 1, desa: 2 };
    return result.sort((a, b) => rank[a.level] - rank[b.level] || a.mitra.nama.localeCompare(b.mitra.nama));
  }

  return {
    normalizeText,
    buildIdsls,
    canonicalId,
    parseCodedName,
    parseDsls,
    matchEntries,
    parseMitra,
    dusunOf,
    mitraForSls
  };
});
