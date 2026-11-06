# SLS Finder - Kabupaten Kepulauan Selayar

WebGIS modern, cepat, dan ringan berbasis static HTML/JS untuk mendeteksi posisi Satuan Lingkungan Setempat (SLS), Desa/Kelurahan, dan Kecamatan di Kabupaten Kepulauan Selayar. Aplikasi ini dirancang khusus untuk dapat di-deploy 100% gratis di **GitHub Pages**.

---

## 🌟 Fitur Utama

1. **Deteksi Lokasi Saya (GPS Real-Time)**:
   - Satu klik tombol **"Lokasi Saya"** untuk mengidentifikasi Anda sedang berdiri di SLS apa, Desa apa, dan Kecamatan apa.
   - Dilengkapi radius akurasi GPS dan penanda visual berdenyut (*pulse marker*).
2. **Pencarian Cepat (Unified Instant Search)**:
   - Ketik nama SLS (misal: `Dusun Bunging`, `RT 02`), nama Desa (misal: `Appatanah`, `Benteng`), nama Kecamatan (misal: `Bontosikuyu`), atau 14 digit ID SLS.
   - Peta langsung otomatis meluncur (*fly-to*) dan menyorot poligon wilayah yang dipilih.
3. **Cek Koordinat Manual & Format Cepat**:
   - Tempel (*paste*) koordinat langsung dari Google Maps atau instrumen survei CAPI (contoh: `-6.49178, 120.48547`).
   - Sistem otomatis memeriksa poligon SLS yang menaungi titik tersebut.
4. **Klik Langsung di Peta (Tap Anywhere)**:
   - Sentuh/klik sembarang posisi di peta untuk mengetahui nama SLS, Desa, dan Kecamatan di titik tersebut.
5. **Tombol Home (Reset Tampilan Peta)**:
   - Mengembalikan sudut pandang (*extent*) peta ke seluruh wilayah Kabupaten Kepulauan Selayar dengan satu klik.
6. **Pemilih Basemap (Peta Dasar)**:
   - **OpenStreetMap**: Peta jalan dan toponimi standar.
   - **Citra Satelit Esri**: Foto udara resolusi tinggi untuk melihat fisik atap rumah dan vegetasi di lapangan.
   - **Satelit Hybrid**: Citra satelit lengkap dengan label jalan dan tempat.
   - **Carto Positron**: Tampilan terang minimalis agar garis batas SLS kontras dan jelas.
7. **Filter Wilayah Bertingkat**:
   - Menu dropdown berjenjang: Pilih Kecamatan (11 pilihan) ➔ Pilih Desa ➔ Pilih SLS.
8. **Upload Koordinat Excel / CSV (Batch Point Verification)**:
   - Unggah daftar koordinat banyak titik dari instrumen survei CAPI/FASIH/Excel (`.xlsx`, `.xls`, `.csv`).
   - Auto-detect kolom Latitude & Longitude serta nama responden/label.
   - Analisis *point-in-polygon* otomatis untuk seluruh titik: klasifikasi instan titik masuk SLS vs titik luar wilayah (outlier).
   - Pratinjau tabel interaktif, sorot titik di peta, dan **unduh hasil verifikasi kembali ke file Excel (.xlsx)** lengkap dengan Nama SLS, ID SLS, Desa, dan Kecamatan.
   - Dilengkapi tombol unduh contoh template Excel langsung dari aplikasi.
9. **Dukungan PWA & Offline-Ready**:
   - Dilengkapi `manifest.json` dan `sw.js` (Service Worker) agar aset peta dan data GeoJSON tersimpan di cache lokal saat berada di area tanpa sinyal seluler (*blank spot*).

10. **Cek Mitra (peta OpenStreetMap)**:
   - Tombol **Cek Mitra** mengganti peta ke OpenStreetMap dan menyorot desa yang punya mitra. Ketuk sebuah SLS untuk melihat daftar mitra beserta tingkat kecocokannya: *Tepat di SLS ini*, *Dusun cocok*, atau *Di desa ini*.
   - Sumber data mitra tidak ada di repositori. Pengguna memuat file Excel daftar mitra lewat tombol **Muat Data Mitra**; file dibaca di peramban dan tidak dikirim ke mana pun. Hanya kolom yang aman dipakai (nama, posisi, alamat detail, pengalaman). Nomor telepon, email, tanggal lahir, SOBAT ID, dan NIK tidak pernah dimuat.
   - Data belum mencatat RT/SLS tiap mitra. Tambahkan kolom **ID SLS** (14 digit) di sheet mitra agar mitra muncul sebagai *Tepat di SLS ini*.
   - Untuk memuat data otomatis dari sheet yang sudah dipublikasikan (CSV, hanya kolom aman), isi konstanta `MITRA_DATA_URL` di `app.js`.
11. **Upload SLS Sampel (Excel DSLS)**:
   - Tombol **Upload Sampel** menerima file daftar sampel SLS (`.xlsx`, `.xls`, `.csv`) dan langsung menyorot semua polygon sampel, lengkap dengan ringkasan "N dari M ditemukan", daftar baris yang gagal dicocokkan (bisa diunduh), dan daftar SLS sampel yang bisa diketuk untuk zoom.
   - Format DSLS asli dibaca apa adanya: judul di atas tabel, kode SLS tanpa nol di depan, baris total, dan header kedua diabaikan. Workbook dengan beberapa tab dipilih otomatis. Template minimal tersedia di dalam aplikasi.
   - Pencocokan memakai kode kecamatan + desa + SLS, bukan properti `idsls` di GeoJSON (3 fitur memiliki `idsls` yang tidak konsisten dengan kode SLS-nya).

12. **Tema Gelap / Terang**:
    - Tombol bulan/matahari di bilah atas. Pilihan tersimpan di perangkat; bila belum memilih, tema default adalah terang.
13. **Panel Kanan Bisa Diubah Ukurannya**:
    - Tarik tepi kiri panel (laptop) atau bilah di atasnya (HP). Keyboard: panah, `Home`, `End`; klik dua kali untuk mengembalikan ukuran awal. Ukuran tersimpan.

---

## 📂 Struktur Proyek

```
SLSelayar/
├── Final_SLS_202517301.geojson    # Dataset resmi 721 batas SLS Kep. Selayar (BPS 2025.1)
├── index.html                     # Antarmuka utama aplikasi
├── app.js                         # Logika peta, spatial engine (PIP), pencarian, & GPS
├── style.css                      # Styling kustom, animasi drawer, & marker
├── manifest.json                  # PWA Manifest (Add to Home Screen)
├── sw.js                          # Service Worker untuk caching offline
├── PRD_SLS_Selayar.md             # Dokumen Product Requirement Document (PRD)
├── README.md                      # Dokumentasi & panduan deployment
└── .github/
    └── workflows/
        └── deploy.yml             # Otomasi deployment GitHub Pages via GitHub Actions
```

---

## 🧪 Menjalankan Tes

Fungsi pembaca DSLS dan pencocok mitra ada di `lib/slslib.js` dan diuji dengan pelari tes bawaan Node:

```bash
node --test test/
```

---

## 🚀 Cara Menjalankan di Lokal (Local Testing)

Anda dapat menguji aplikasi di komputer lokal menggunakan server statis sederhana:

### Menggunakan Python:
```bash
python3 -m http.server 8000
```
Lalu buka browser Anda di: `http://localhost:8000`

### Menggunakan Node.js / npx:
```bash
npx serve .
```

---

## 🌐 Cara Deploy ke GitHub Pages

Aplikasi ini dapat di-deploy ke GitHub Pages dengan 2 cara mudah:

### Cara 1: Menggunakan GitHub Actions (Otomatis & Direkomendasikan)
1. Inisialisasi git dan buat commit:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi aplikasi SLS Finder Selayar"
   ```
2. Buat repository baru di GitHub (misal: `SLSelayar`), lalu hubungkan remote:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<username-anda>/SLSelayar.git
   git push -u origin main
   ```
3. Buka repository Anda di GitHub:
   - Masuk ke tab **Settings** ➔ **Pages**.
   - Pada bagian **Build and deployment** ➔ **Source**, pilih **GitHub Actions**.
4. GitHub Actions yang sudah ada di `.github/workflows/deploy.yml` akan otomatis berjalan dan website Anda akan aktif di:
   `https://<username-anda>.github.io/SLSelayar/`

### Cara 2: Deploy Langsung dari Branch
1. Buka tab **Settings** ➔ **Pages** di repository GitHub Anda.
2. Pada bagian **Build and deployment** ➔ **Source**, pilih **Deploy from a branch**.
3. Pilih branch `main` dan folder `/ (root)`, lalu klik **Save**.
4. Tunggu 1–2 menit, web Anda siap diakses!

---

## 📊 Spesifikasi Dataset
- **Sumber**: Wilayah Kerja Statistik (Wilkerstat) BPS Semester 1 2025
- **Jumlah SLS**: 721 SLS
- **Jumlah Kecamatan**: 11 Kecamatan
- **Jumlah Desa/Kelurahan**: 88 Desa/Kelurahan
- **Sistem Koordinat**: WGS84 (EPSG:4326)

---

## 📄 Lisensi
Dibuat untuk mempermudah operasional kegiatan statistik geospasial di Kabupaten Kepulauan Selayar.
