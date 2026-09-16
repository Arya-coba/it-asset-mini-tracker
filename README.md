# IT Asset Mini Tracker

Mini backoffice untuk mencatat dan memantau aset IT rumah sakit. Project ini dibuat sebagai take-home test Fullstack Developer dengan fokus pada CRUD yang jelas, REST API yang konsisten, validasi input, pencarian/filter, dan struktur kode yang mudah ditelusuri.

## Fitur

- Menampilkan daftar aset IT.
- Menambah, mengubah, dan menghapus aset.
- Pencarian berdasarkan `nama_aset`.
- Filter berdasarkan `status` dan `kategori`.
- Ringkasan jumlah aset `aktif`, `rusak`, `perbaikan`, dan total aset.
- Validasi request menggunakan Zod.
- Validasi `kode_aset` unik di aplikasi dan database.
- Konfirmasi sebelum menghapus data.
- Loading, empty, error, dan success feedback pada UI.
- Seeder berisi 10 contoh aset IT rumah sakit.

## Tech Stack

| Bagian | Teknologi |
| --- | --- |
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Backend | Node.js + Express + TypeScript |
| Validation | Zod v4 |
| ORM | Prisma ORM v6 |
| Database | MySQL / MariaDB |

Backend menggunakan Express karena teknologi backend diperbolehkan untuk dipilih bebas. Implementasi sengaja dibuat sederhana: route API menangani kebutuhan CRUD secara langsung tanpa menambahkan service/repository layer yang belum diperlukan oleh ruang lingkup aplikasi ini.

## Struktur Project

```text
it-asset-mini-tracker/
├── prisma/
│   ├── migrations/             # Migration database
│   ├── schema.prisma           # Model database Prisma
│   └── seed.ts                 # 10 data dummy
├── server/
│   └── routes/
│       └── assets.ts           # REST API aset
├── lib/
│   ├── api/assets.ts           # Pemanggilan API dari frontend
│   ├── prisma.ts               # Prisma Client singleton
│   └── validations/asset.ts    # Validasi Zod
├── src/
│   ├── components/assets/      # Komponen fitur aset
│   ├── components/ui/          # Komponen UI kecil/reusable
│   ├── App.tsx
│   └── main.tsx
├── types/
│   └── asset.ts                # TypeScript types bersama
├── server.ts                   # Entry point Express + Vite
├── .env.example
└── package.json
```

## Database

Model utama berada pada `prisma/schema.prisma`.

```prisma
model Asset {
  id                Int         @id @default(autoincrement())
  nama_aset         String      @db.VarChar(150)
  kategori          String      @db.VarChar(100)
  kode_aset         String      @unique @db.VarChar(50)
  status            AssetStatus
  tanggal_pengadaan DateTime    @db.Date
  created_at        DateTime    @default(now())
  updated_at        DateTime    @updatedAt

  @@index([status])
  @@index([kategori])
  @@map("assets")
}
```

`status` dibatasi oleh enum:

```text
aktif | rusak | perbaikan
```

`tanggal_pengadaan` disimpan sebagai tipe `DATE` pada MySQL/MariaDB. Pada REST API tanggal dikirim dalam format `YYYY-MM-DD` agar konsisten dengan `<input type="date">` di frontend.

## REST API

Response sukses menggunakan format:

```json
{
  "success": true,
  "message": "Assets retrieved successfully",
  "data": []
}
```

Response gagal menggunakan format:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "kode_aset": "Kode aset sudah digunakan"
  },
  "data": null
}
```

Endpoint utama:

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/api/assets` | Daftar aset + search/filter |
| POST | `/api/assets` | Tambah aset |
| PUT | `/api/assets/:id` | Ubah aset |
| DELETE | `/api/assets/:id` | Hapus aset |

Endpoint pendukung:

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/api/assets/summary` | Jumlah aset per status |
| GET | `/api/assets/categories` | Daftar kategori unik |
| GET | `/api/assets/:id` | Detail satu aset |
| GET | `/api/health` | Health check sederhana |

### Query parameter `GET /api/assets`

- `search`: pencarian pada `nama_aset`.
- `status`: `aktif`, `rusak`, atau `perbaikan`.
- `kategori`: nama kategori.

Contoh:

```text
/api/assets?search=Dell&status=aktif&kategori=Laptop
```

## Instalasi

### 1. Persyaratan

- Node.js 18+ (Node.js 20/22 direkomendasikan)
- npm
- MySQL atau MariaDB

### 2. Install dependency

```bash
npm install
```

`postinstall` akan menjalankan `prisma generate` secara otomatis.

### 3. Buat database

Contoh:

```sql
CREATE DATABASE it_asset_tracker;
```

### 4. Siapkan environment variable

Salin `.env.example` menjadi `.env` lalu sesuaikan kredensial database.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Linux/macOS:

```bash
cp .env.example .env
```

Contoh:

```env
DATABASE_URL="mysql://root:password@localhost:3306/it_asset_tracker"
PORT=3000
```

### 5. Jalankan migration

Untuk database baru:

```bash
npm run prisma:deploy
```

Jika sedang mengembangkan perubahan schema Prisma secara lokal:

```bash
npm run prisma:migrate
```

### 6. Isi data dummy

```bash
npm run prisma:seed
```

Seeder menggunakan `upsert`, sehingga dapat dijalankan kembali tanpa membuat duplikasi berdasarkan `kode_aset`.

### 7. Jalankan aplikasi

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
```

## Script Penting

```bash
npm run dev              # development server
npm run lint             # TypeScript type-check
npm run build            # build frontend + backend
npm run start            # menjalankan hasil build
npm run prisma:generate  # generate Prisma Client
npm run prisma:deploy    # apply migration yang sudah ada
npm run prisma:migrate   # membuat/apply migration saat development
npm run prisma:seed      # isi data dummy
```

## Validasi

Input divalidasi pada backend menggunakan Zod sebelum diteruskan ke Prisma.

Aturan utama:

- `nama_aset`: wajib, maksimal 150 karakter.
- `kategori`: wajib, maksimal 100 karakter.
- `kode_aset`: wajib, maksimal 50 karakter, hanya huruf/angka/`-`/`_`, dan unik.
- `status`: hanya `aktif`, `rusak`, atau `perbaikan`.
- `tanggal_pengadaan`: tanggal valid dengan format `YYYY-MM-DD`.

Frontend juga memberikan validasi dasar agar pengguna mendapatkan feedback lebih cepat. Backend tetap menjadi sumber validasi utama.

## Keputusan Implementasi

Beberapa keputusan dibuat agar project tetap sesuai ruang lingkup take-home test:

- Tidak menggunakan Redux/Zustand karena state aplikasi masih kecil dan dapat ditangani dengan state React lokal.
- Menggunakan native `fetch`, sehingga tidak menambah dependency HTTP client yang tidak diperlukan.
- Route Express belum dipisah menjadi controller/service/repository karena logika bisnis masih sederhana dan tetap mudah ditelusuri dalam satu file.
- Tidak ada autentikasi karena tidak diminta pada requirement.
- Seeder dijalankan melalui command development, bukan endpoint publik pada aplikasi.
- Index database hanya ditambahkan pada `status` dan `kategori`, dua field yang digunakan untuk filter.