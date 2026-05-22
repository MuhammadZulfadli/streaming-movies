# Issue: Integrasi API Real-Time untuk Fitur "New Releases" (Latest Movies/Dramas)

## Deskripsi
Saat ini, bagian **New Releases** (Latest Releases) pada halaman utama (`Home.vue`) masih menggunakan data statis (`dramas.json`) melalui *mock logic* yang dibalik (`reverse()`). 

Untuk menyajikan konten yang dinamis dan selalu terbarui bagi pengguna, kita perlu mengintegrasikan section **New Releases** tersebut menggunakan endpoint API resmi dari Sansekai.

---

## Objektif
1. Menambahkan konfigurasi endpoint API terbaru pada file `.env`.
2. Membuat fungsi asinkron untuk melakukan fetch data dari API *Latest Movies*.
3. Memetakan (mapping) struktur respons API agar kompatibel dengan komponen `<DramaCard>`.
4. Menambahkan state loading khusus untuk section **New Releases** agar memberikan UX yang lebih mulus.
5. Memastikan navigasi ke halaman detail drama (`DramaDetail.vue`) berjalan lancar dengan ID dinamis dari API.

---

## Endpoint API yang Digunakan
* **URL:** `https://api.sansekai.my.id/api/dramabox/latest`
* **Metode:** `GET`
* **Format Respons (JSON Array):**
  Setiap item di dalam array memiliki struktur sebagai berikut:
  ```json
  [
    {
      "bookId": "42000012351",
      "bookName": "Cinta Yang Pernah Dihina",
      "coverWap": "https://hwztchapter.dramaboxdb.com/data/.../42000012351.jpg",
      "chapterCount": 60,
      "introduction": "Mireya, gadis gemuk yang selalu tak terlihat...",
      "tags": ["Ibu Tunggal", "Kabur Saat Hamil", "Romansa"],
      "shelfTime": "2026-05-17 17:00:00"
    }
  ]
  ```

---

## Tahapan Implementasi

### Langkah 1: Update Konfigurasi Lingkungan (`.env`)
Buka file `.env` di root direktori proyek, lalu tambahkan variabel lingkungan baru untuk menyimpan URL endpoint API Latest Movies:

```env
VITE_API_LATEST_URL=https://api.sansekai.my.id/api/dramabox/latest
```

---

### Langkah 2: Update Logika Script di `src/pages/Home.vue`
Buka file `src/pages/Home.vue`. Lakukan perubahan-perubahan berikut pada blok `<script setup>`:

1. **Definisikan State Baru untuk Data & Loading:**
   Tambahkan reactive variables untuk menyimpan data dari API dan status loading-nya.
   ```javascript
   const apiLatestDramas = ref([])
   const isLatestLoading = ref(false)
   ```

2. **Buat Fungsi Fetch Data (`fetchLatestDramas`):**
   Buat fungsi untuk mengambil data dari API, lalu petakan (mapping) properti dari respons API agar sesuai dengan properti yang diharapkan oleh komponen `<DramaCard>`:
   
   | Field API (`latest`) | Field Komponen (`DramaCard`) | Penjelasan / Nilai Default |
   |---|---|---|
   | `bookId` | `id` | Wajib sebagai parameter rute detail |
   | `bookName` | `title` | Nama/Judul drama |
   | `coverWap` | `poster` | URL gambar poster drama |
   | `tags` | `genre` | Array genre (contoh: `["Romansa", "CEO"]`) |
   | - | `rating` | Default fallback: `4.7` (karena API tidak menyediakan rating) |
   | - | `year` | Default fallback: `2024` atau tahun dari `shelfTime` |
   | `introduction` | `description`| Sinopsis singkat drama |

   *Contoh kode implementasi fungsi:*
   ```javascript
   const fetchLatestDramas = async () => {
     isLatestLoading.value = true
     try {
       const response = await fetch(import.meta.env.VITE_API_LATEST_URL)
       if (!response.ok) throw new Error("Gagal memuat data drama terbaru")
       
       const data = await response.json()
       // Ambil 4-8 item teratas atau tampilkan semua
       apiLatestDramas.value = data.slice(0, 8).map(item => ({
         id: item.bookId,
         title: item.bookName,
         poster: item.coverWap,
         genre: item.tags || [],
         rating: 4.7, // Fallback rating default
         year: item.shelfTime ? new Date(item.shelfTime).getFullYear() : 2024,
         description: item.introduction,
         episodes: []
       }))
     } catch (error) {
       console.error('Error fetching latest dramas:', error)
     } finally {
       isLatestLoading.value = false
     }
   }
   ```

3. **Panggil Fungsi di dalam Hook `onMounted`:**
   Daftarkan fungsi `fetchLatestDramas()` di dalam hook `onMounted` agar dijalankan saat halaman di-load bersamaan dengan trending dramas.
   ```javascript
   onMounted(() => {
     fetchTrendingDramas()
     fetchLatestDramas() // Panggil fungsi baru di sini
   })
   ```

---

### Langkah 3: Update Template HTML di `src/pages/Home.vue`
Perbarui section **Latest Releases** di dalam tag `<template>` agar membaca state loading dan data terbaru dari API.

Cari bagian berikut:
```html
<!-- Latest Releases Section -->
<section>
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-2xl font-bold text-white">New Releases</h2>
    <a href="#" class="text-rose-500 hover:text-rose-400 text-sm font-medium">View All</a>
  </div>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
    <DramaCard 
      v-for="drama in latestDramas" 
      :key="drama.id" 
      :drama="drama" 
    />
  </div>
</section>
```

Ubah menjadi seperti di bawah ini agar mendukung penanganan loading state dan data asinkron:
```html
<!-- Latest Releases Section -->
<section>
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-2xl font-bold text-white">New Releases</h2>
    <a href="#" class="text-rose-500 hover:text-rose-400 text-sm font-medium">View All</a>
  </div>
  
  <!-- Tampilkan Loading State jika sedang fetch data -->
  <div v-if="isLatestLoading" class="text-center py-8 text-gray-400">
    Loading new releases...
  </div>
  
  <!-- Tampilkan Grid Card jika data sudah siap -->
  <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-6">
    <DramaCard 
      v-for="drama in apiLatestDramas" 
      :key="drama.id" 
      :drama="drama" 
    />
  </div>
</section>
```

---

## Panduan Pengujian (Testing Guide)
Bagi pelaksana (Junior Programmer atau AI Model):
1. **Verifikasi Jalannya Server:** Pastikan server lokal berjalan dengan perintah `npm run dev`.
2. **Periksa Network Tab:** Buka Developer Tools di Google Chrome (F12) -> masuk ke tab **Network**. Cari request ke endpoint `/latest` dan pastikan statusnya `200 OK`.
3. **Validasi Loading State:** Saat halaman direfresh, pastikan teks "Loading new releases..." muncul sesaat sebelum data terisi penuh.
4. **Uji Navigasi:** Klik salah satu poster drama pada baris "New Releases". Pastikan rute berpindah ke `/drama/<bookId>` dengan benar dan detail drama (judul, deskripsi, episode) terisi secara dinamis.

---

## Kriteria Penerimaan (Acceptance Criteria)
- [ ] Berhasil menambahkan `VITE_API_LATEST_URL` di `.env`.
- [ ] Data drama di baris "New Releases" ditarik langsung dari API `/latest` dan bukan merupakan data statis dari `dramas.json`.
- [ ] Menampilkan state loading saat data sedang di-fetch.
- [ ] Data berhasil di-render di dalam komponen `<DramaCard>` tanpa ada error *undefined property* (seperti `genre.join` error).
- [ ] Setiap card dapat diklik dan mengarahkan ke halaman detail drama yang bersangkutan dengan benar.
