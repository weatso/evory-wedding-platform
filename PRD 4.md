# PRODUCT REQUIREMENTS DOCUMENT (PRD) & QA/QC CHECKLIST

**Sistem:** Evory OS B2B2C  
**Fase:** 4 (Content Creation Vault & High-Performance Media)  
**Stack:** Next.js Image Optimization, Cloudflare Stream (Video), Browser Image Compression  

Fase ini adalah pengunci kualitas produk (Quality Assurance level atas). Fokus utama adalah memastikan halaman undangan tidak "berat/patah-patah" saat klien mengunggah galeri foto ukuran raksasa atau video sinematik besar.

---

## FITUR 1: Client-Side Asset Compression
**Tujuan:** Memotong beban penyimpanan R2 dan mempercepat waktu *upload* dengan mengompres foto di HP/laptop pengguna *sebelum* dikirim ke server.

### Spesifikasi Teknis (Developer)
1. Integrasikan *library* `browser-image-compression` pada proses *upload* Fase 2.
2. Aturan Kompresi: Maksimal dimensi 1920px (Lebar/Tinggi), format konversi ke WebP, maksimal *size* *output* 300KB - 500KB.
3. *Alur baru:* Pilih File -> Kompresi Lokal (Browser) -> Minta URL R2 -> Upload via PUT -> Simpan Metadata.

### Kriteria Penerimaan / QA Checklist
- [ ] **Reduksi Ukuran:** Agensi mencoba mengunggah foto pernikahan asli (misal: 12MB dari kamera DSLR). Sistem memprosesnya dalam hitungan detik dan *file* yang masuk ke *bucket* R2 terbukti berukuran di bawah 500KB dengan ketajaman layar *mobile* yang tetap bagus.

---

## FITUR 2: Masonry Gallery & Blur-up Placeholder (LQIP)
**Tujuan:** Replikasi performa galeri sekelas Pinterest agar pengguna tidak melihat area kosong saat menunggu gambar dimuat.

### Spesifikasi Teknis (Developer)
1. Saat R2 mengembalikan URL gambar sukses, jalankan *micro-service/function* (atau API *route*) untuk menghasilkan representasi *Base64* dari gambar dengan resolusi sangat kecil (misal 10x10 px).
2. Simpan *string Base64* ini berdampingan dengan URL asli di `eventMetadata.gallery` JSON.
3. Di antarmuka pengunjung, gunakan `next/image` dengan properti `placeholder="blur"` dan `blurDataURL={base64String}`.
4. Tata galeri menggunakan CSS *Columns* atau *grid* berbasis *Masonry* agar ukuran vertikal foto tidak terpotong (proporsional).

### Kriteria Penerimaan / QA Checklist
- [ ] **Transisi Mulus:** Pada koneksi 3G/lambat, pengunjung akan melihat versi blur dari foto tersebut secara instan saat layar digulir (sebelum foto asli selesai dimuat).
- [ ] **Tata Letak Dinamis:** Foto *potrait* dan *landscape* tersusun rapi dalam format bata (*masonry*) tanpa ada pemotongan paksa (*cropping*).

---

## FITUR 3: HLS Video Streaming Infrastructure (Cloudflare Stream)
**Tujuan:** Menghentikan praktik buruk menggunakan tautan Google Drive / MP4 mentah yang membuat memori HP tamu habis untuk *buffering* video 100MB+.

### Spesifikasi Teknis (Developer)
*Catatan Tradeoff:* Menggunakan FFmpeg sendiri via VPS terlalu rentan dan mahal secara perawatan. Solusi paling pragmatis dan *scalable* adalah mengintegrasikan API **Cloudflare Stream** (satu ekosistem dengan R2).

1. Buat alur otentikasi Cloudflare Stream menggunakan *Direct Creator Upload* API.
2. Agensi mengunggah video langsung dari dasbor mereka ke Cloudflare Stream.
3. Simpan `uid` video dari Cloudflare Stream ke dalam `themeConfig.videoUrl`.
4. Di *frontend* halaman publik, *render* video menggunakan *player* HLS (didukung native oleh iOS, atau gunakan `video.js` / HLS.js untuk Android/Desktop).

### Kriteria Penerimaan / QA Checklist
- [ ] **Streaming Dinamis:** Video mulai diputar di HP kurang dari 2 detik meskipun ukuran aslinya di atas 100MB.
- [ ] **Adaptive Bitrate:** Jika pengunjung membuka undangan dari wilayah koneksi lambat, resolusi video otomatis turun (misal ke 360p) tanpa *buffering* berhenti total.