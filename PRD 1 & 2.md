# MASTER PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Sistem:** Evory OS (B2B2C SaaS untuk Agensi Pernikahan)  
**Cakupan Eksekusi:** Fase 1 (Core & Billing) & Fase 2 (Editor & RSVP)  
**Stack Utama:** Next.js, Prisma (PostgreSQL), TypeScript, Tailwind CSS, Cloudflare R2  

## 1. STRATEGI ARSITEKTUR & TRADEOFF
Untuk mencapai keseimbangan antara *speed to market*, biaya operasional (*cost-efficiency*), dan kemudahan pemeliharaan (*maintainability*), berikut adalah keputusan arsitektur utama:
*   **Billing via WhatsApp (Manual) vs Payment Gateway:** Memilih WA untuk MVP. **Tradeoff:** Menambah pekerjaan manual admin di awal, namun memotong *development time* hingga 2 minggu, tidak ada potongan biaya transaksi (0% fee), dan cashflow masuk seketika.
*   **JSON Content (`eventMetadata`, `themeConfig`) vs Relational Tables:** Memilih JSON. **Tradeoff:** Agak sulit untuk *query* spesifik, namun memberikan fleksibilitas luar biasa. Anda bisa menambah modul template baru kapan saja tanpa perlu migrasi *database* terus-menerus.
*   **Cloudflare R2 vs Vercel Blob/AWS S3:** Memilih R2. **Tradeoff:** Setup *presigned URL* sedikit lebih kompleks, namun membebaskan sistem dari biaya *bandwidth egress* yang mahal di Vercel/AWS. Sangat krusial untuk aset gambar resolusi tinggi.

---

## 2. SPESIFIKASI FASE 1: CORE ENGINE & PAYWALL

### Fitur 1.1: Pembaruan Skema Multi-Tenant (Database)
*   **Penjelasan/Leverage:** Fondasi wajib agar sistem mengetahui proyek mana yang sudah bayar dan kapan proyek tersebut kedaluwarsa.
*   **Spesifikasi Teknis:**
    1. Tambah `enum PaymentStatus { UNPAID, PENDING_PAYMENT, PAID }` di `schema.prisma`.
    2. Tambah kolom di model `Project`: `paymentStatus` (default: UNPAID), `basePrice` (default: 0), `publishedAt` (DateTime).
    3. Pastikan relasi `Project` ke `Workspace` menggunakan `onDelete: Cascade`.
*   **Kriteria QA:** Penghapusan *Workspace* otomatis menyapu bersih seluruh *Project* di dalamnya. Proyek baru wajib berstatus `UNPAID`.

### Fitur 1.2: Mesin Penunjukan Agensi (Direct Assignment)
*   **Penjelasan/Leverage:** Memotong birokrasi *onboarding*. Superadmin bisa langsung mencetak akun *Workspace* untuk agensi tanpa mengharuskan mereka mengisi form registrasi yang panjang. *High conversion strategy*.
*   **Spesifikasi Teknis:**
    1. Buat Server Action khusus `SUPERADMIN`: `assignWorkspaceToUser(email, agencyName)`.
    2. Gunakan Prisma `$transaction` untuk memastikan pembuatan `Workspace` dan relasi `WorkspaceMember` (Role: OWNER) dieksekusi bersamaan.
*   **Kriteria QA:** Eksekusi oleh user non-Superadmin wajib *error 403*. Superadmin sukses mencetak ruang kerja dan user langsung mendapat akses *Owner*.

### Fitur 1.3: Paywall & Aktivasi WhatsApp
*   **Penjelasan/Leverage:** Mengunci produk klien sampai agensi membayar. Integrasi WA langsung memicu interaksi *sales* dan mengamankan *cashflow* hari itu juga.
*   **Spesifikasi Teknis:**
    1. **Agensi:** Tombol "Aktivasi" merubah status `UNPAID` ke `PENDING_PAYMENT` lalu memicu *redirect* ke `wa.me` dengan teks *pre-filled* berisi ID/Nama Proyek.
    2. **Superadmin:** Halaman `/admin/billings` untuk me-review proyek `PENDING_PAYMENT` dan tombol "Setujui Lunas" yang merubah status ke `PAID` + isi tanggal `publishedAt`.
*   **Kriteria QA:** Tab WA sukses terbuka dengan teks dinamis yang benar. Proyek `PENDING_PAYMENT` terisolasi di antrean admin.

### Fitur 1.4: Dummy Data Injector
*   **Penjelasan/Leverage:** Mencegah tampilan layar *error* atau putih (*blank*) saat agensi baru saja membuat proyek. Tampilan awal langsung terlihat rapi, menaikkan *perceived value* (nilai jual) aplikasi.
*   **Spesifikasi Teknis:**
    1. Buat `lib/template-presets.ts` dengan fungsi `getDefaultPayload()`.
    2. Saat *create project*, injeksikan *dummy JSON* ke `eventMetadata` (nama "Romeo & Juliet", dummy maps) dan `themeConfig`.
*   **Kriteria QA:** Proyek baru yang belum diedit sama sekali bisa langsung di-*preview* tanpa merusak antarmuka/UI *rendering*.

### Fitur 1.5: Template Engine & Paywall Guard
*   **Penjelasan/Leverage:** Melindungi hak milik Anda. Klien agensi tidak bisa menyebarkan undangan jika tagihan belum diselesaikan oleh pihak agensi.
*   **Spesifikasi Teknis:**
    1. **Middleware:** *Route* `/invitation/[slug]` memblokir status `UNPAID` dari akses publik anonim, *kecuali* diakses oleh akun `OWNER` agensi terkait (untuk kebutuhan *preview*).
    2. **Renderer:** Komponen Next.js melakukan *conditional rendering* murni dari `themeConfig` JSON (`if true -> show module`).
*   **Kriteria QA:** Akses mode *incognito* ke URL proyek `UNPAID` wajib menampilkan layar "Terkunci", sedangkan akses dari dasbor agensi memunculkan undangan utuh.

---

## 3. SPESIFIKASI FASE 2: VISUAL EDITOR & MANAJEMEN OPERASIONAL

### Fitur 2.1: Skema Database Tamu & RSVP
*   **Penjelasan/Leverage:** Ini adalah fitur *sticky* (membuat agensi/klien bergantung pada sistem Anda). Sistem pencatatan tamu digital adalah *selling point* utama sebuah undangan *website*.
*   **Spesifikasi Teknis:**
    1. Buat tabel `Guest` berelasi dengan `Project`.
    2. Kolom: `name`, `slug` (unik dalam 1 proyek), `status` (enum: PENDING, ATTENDING, REJECTED), `pax` (Int), `message` (Text).
*   **Kriteria QA:** Tidak boleh ada 2 URL (slug) tamu yang sama persis di dalam 1 acara/proyek yang sama.

### Fitur 2.2: Serverless Asset Management (Cloudflare R2)
*   **Penjelasan/Leverage:** Mengamankan *server* Vercel Anda dari kelebihan beban (OOM/Timeout). Proses ini mendesentralisasi beban unggahan foto 100% ke *browser* pengguna (*client-side*).
*   **Spesifikasi Teknis:**
    1. API `getPresignedUrl` melempar *token/URL* izin *upload* ke *frontend*.
    2. *Frontend* melakukan `HTTP PUT` langsung ke *bucket* R2.
    3. Simpan URL publik hasil unggahan ke *database* (`eventMetadata.gallery`).
    4. Limitasi ukuran diatur maksimal 2MB di level *frontend*.
*   **Kriteria QA:** Unggahan > 2MB ditolak sebelum API dipanggil. Log *server* Vercel bersih dari *buffer* file gambar.

### Fitur 2.3: Visual Editor (Dashboard Agensi)
*   **Penjelasan/Leverage:** Memberikan otonomi bagi agensi. Jika mereka bisa mengedit data, foto, dan modul (*on/off* galeri/cerita) sendiri, maka beban kerja/tiket *support* Anda turun drastis.
*   **Spesifikasi Teknis:**
    1. UI terbagi dua: Form Kiri (Input Teks & Toggle) & Layar Kanan (*Iframe/Live Preview*).
    2. Gunakan *standard form submit* (satu tombol "Simpan") untuk mengirim data JSON baru ke Prisma. Hindari *auto-save* per detik untuk menghemat biaya *read/write database*.
*   **Kriteria QA:** Mematikan *toggle* "Tampilkan Galeri", lalu klik simpan, akan secara otomatis menyembunyikan bagian galeri di layar *preview*.

### Fitur 2.4: Bulk Guest Management & Link Generator
*   **Penjelasan/Leverage:** *Pain point* terbesar klien adalah membuat ratusan tautan tamu satu-per-satu. *Textarea input* massal menyelesaikan ini dalam 3 detik.
*   **Spesifikasi Teknis:**
    1. Dasbor dengan input *textarea*. Tiap baris baru (`\n`) = 1 tamu.
    2. Server *looping* untuk konversi baris teks menjadi format tabel `Guest` (berikut *auto-slugify* untuk URL).
    3. UI Tabel berisi tombol "Copy Link" (`https://evory.id/invitation/[proyek]?to=[slug]`).
*   **Kriteria QA:** *Paste* 100 baris nama menghasilkan 100 tautan terpisah di tabel dengan karakter khusus otomatis dibersihkan.

### Fitur 2.5: Modul RSVP Publik & Dashboard Rekapitulasi
*   **Penjelasan/Leverage:** Menutup siklus (*loop*) produk. Tamu mengonfirmasi kehadiran -> Klien mendapat *data realtime* jumlah pax makanan -> Nilai guna sistem terbukti.
*   **Spesifikasi Teknis:**
    1. *Frontend* publik menangkap *query* `?to=` dan menampilkan "Kepada Yth. [Nama Tamu]".
    2. Form RSVP mengizinkan tamu mengubah status kehadiran (Hadir/Tidak), jumlah *pax*, dan mengirimkan ucapan.
    3. Ucapan masuk ke area UI *Guestbook* halaman undangan. Data kehadiran masuk ke dasbor agensi.
*   **Kriteria QA:** Perubahan konfirmasi dari tamu instan ter- *update* saat dasbor agensi di-*refresh*.