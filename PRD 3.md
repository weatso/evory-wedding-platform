# PRODUCT REQUIREMENTS DOCUMENT (PRD) & QA/QC CHECKLIST

**Sistem:** Evory OS B2B2C  
**Fase:** 3 (Event Execution, QR Scanner, & Live Attendance)  
**Stack:** Next.js, Prisma, HTML5-QRCode (Browser API), Server-Sent Events (SSE) / Polling  

Fase ini mengubah Evory dari sekadar "pembuat website undangan" menjadi **Sistem Manajemen Acara (Event OS)**. Fokus utamanya adalah kecepatan operasional di hari H (eksekusi milidetik) dan kemudahan bagi staf penerima tamu (*Usher*).

---

## FITUR 1: Pembaruan Skema Database (Validasi Check-in)
**Tujuan:** Menyimpan rekam jejak waktu kedatangan tamu untuk analitik klien.

### Spesifikasi Teknis (Developer)
1. Tambahkan `enum CheckInStatus { PENDING, CHECKED_IN }` pada `schema.prisma`.
2. Injeksi kolom baru pada model `Guest`:
   * `checkInStatus CheckInStatus @default(PENDING)`
   * `checkInTime DateTime?`
3. Eksekusi migrasi *database*.

### Kriteria Penerimaan / QA Checklist
- [ ] **Skema Ter-update:** Tabel `Guest` memiliki dua kolom baru tanpa mengganggu data RSVP dari Fase 2.

---

## FITUR 2: Generator QR Code & e-Ticket Tamu
**Tujuan:** Memberikan identitas unik berupa *barcode* 2D kepada setiap tamu yang telah mengonfirmasi kehadiran.

### Spesifikasi Teknis (Developer)
1. Di halaman publik undangan (`/invitation/[slug]?to=[guest-slug]`), jika tamu sudah melakukan RSVP "Hadir" (`ATTENDING`), tampilkan komponen *E-Ticket* secara visual.
2. *Render* QR Code menggunakan *library* ringan seperti `qrcode.react` di sisi klien.
3. *Payload* data di dalam QR Code cukup berupa teks *ID Tamu* (`Guest.id`), BUKAN seluruh URL, untuk mempercepat pemindaian.

### Kriteria Penerimaan / QA Checklist
- [ ] **Akurasi Data QR:** Hasil *scan* QR menggunakan kamera HP biasa akan memunculkan *string CUID/UUID* tamu yang tepat.
- [ ] **Tampilan Kondisional:** QR Code tidak muncul jika tamu belum mengisi RSVP atau memilih opsi "Tidak Hadir".

---

## FITUR 3: Web-Based QR Scanner (Portal Usher)
**Tujuan:** Menyediakan alat *scan* langsung dari *browser* HP (tanpa instal aplikasi) bagi staf *Usher* di meja registrasi.

### Spesifikasi Teknis (Developer)
1. Buat halaman khusus `/workspace/[slug]/project/[slug]/scanner`. (Diakses *login* oleh staf Agensi).
2. Gunakan *library* pemindai QR berbasis *browser* (misal: `html5-qrcode`).
3. **Alur Validasi Milidetik:**
   * Kamera menangkap *ID Tamu*.
   * *Frontend* mengirimkan POST *request* (API/Server Action) untuk memvalidasi `Guest.id`.
   * Jika ID valid dan status `PENDING`, perbarui menjadi `CHECKED_IN`, catat `checkInTime = Date.now()`, bunyikan suara "Bip" (Audio HTML5), dan munculkan UI "Sukses: [Nama Tamu], [Jumlah Pax]".
   * Jika ID tidak ada, atau sudah `CHECKED_IN`, munculkan UI peringatan merah.

### Kriteria Penerimaan / QA Checklist
- [ ] **Kinerja Scanner:** Pemindaian QR bereaksi di bawah 1 detik (*low latency*).
- [ ] **Proteksi Duplikasi:** Memindai QR yang sama dua kali akan ditolak oleh sistem dengan peringatan "Tamu Sudah Check-in".
- [ ] **Manual Override:** Sediakan fitur kolom pencarian (ketik nama manual) di layar yang sama, jika HP *Usher* rusak/kamera buram.

---

## FITUR 4: Live Attendance Dashboard
**Tujuan:** Klien (Mempelai) dan *Owner* Agensi bisa memantau rasio kedatangan vs katering dari belakang panggung.

### Spesifikasi Teknis (Developer)
1. Buat Dasbor `/workspace/[slug]/project/[slug]/live-attendance`.
2. Tampilkan metrik utama: Total RSVP Hadir, Total Telah Check-in, Persentase Kedatangan.
3. Gunakan *Client-side polling* setiap 5-10 detik (SWR/React Query) ATAU *Server-Sent Events (SSE)* untuk mengambil pembaruan tanpa perlu me-*refresh* *browser* manual.

### Kriteria Penerimaan / QA Checklist
- [ ] **Real-time Sync:** Saat *Usher* berhasil melakukan *scan* QR tamu di depan, dasbor kehadiran otomatis bertambah angkanya tanpa intervensi *refresh* oleh pengguna.