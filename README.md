# Bot WhatsApp Pencatat Pengeluaran

Sebuah bot WhatsApp sederhana yang dibuat menggunakan **Node.js** dan **Baileys** untuk mencatat pengeluaran harian langsung dari grup WhatsApp. Data disimpan secara lokal menggunakan database **SQLite**, memastikan privasi dan tidak memerlukan biaya server.

---

## ✨ Fitur

* **Pencatatan Mudah**: Catat pengeluaran dengan format pesan yang simpel dan intuitif.
* **Database Lokal**: Semua data pengeluaran disimpan secara persisten di dalam file `database.sqlite`, sepenuhnya offline dan aman.
* **Pengingat Pintar**: Mendapatkan pengingat otomatis setiap malam pukul **20:30 WIB**, namun bot cukup pintar untuk **tidak mengirim pengingat** jika Anda sudah mencatat pengeluaran pada hari itu.
* **Aman & Privat**: Konfigurasi rahasia seperti ID Grup disimpan dengan aman di laptop Anda menggunakan file `.env` dan tidak akan terunggah ke GitHub.
* **Berjalan di Latar Belakang**: Dioptimalkan untuk berjalan secara terus-menerus di latar belakang menggunakan **PM2**, lengkap dengan fitur auto-start saat laptop menyala.

---

## 📋 Prasyarat

Sebelum memulai, pastikan Anda sudah menginstall:
* [Node.js](https://nodejs.org/) (versi 16 atau lebih baru)
* NPM (biasanya sudah terinstall bersama Node.js)
* Nomor WhatsApp cadangan yang akan digunakan khusus untuk akun bot.

---

## 🚀 Instalasi & Konfigurasi

Ikuti langkah-langkah ini untuk menjalankan bot di komputer baru.

1.  **Clone Repositori**
    ```bash
    https://github.com/Adliii/bot-pengeluaran-wa.git
    ```

2.  **Masuk ke Direktori Proyek**
    ```bash
    cd bot-pengeluaran-wa.git
    ```

3.  **Install Semua Dependensi**
    Perintah ini akan mengunduh semua library yang dibutuhkan oleh proyek.
    ```bash
    npm install
    ```

4.  **Buat File Environment (`.env`)**
    Buat sebuah file baru di direktori utama proyek dengan nama persis `.env`. File ini akan menyimpan ID grup Anda secara rahasia.

5.  **Isi File `.env`**
    Buka file `.env` dan tambahkan ID Grup WhatsApp target Anda dengan format berikut:
    ```
    GROUP_ID='ID_GRUP_ANDA_DISINI@g.us'
    ```

    > **💡 Cara Mendapatkan ID Grup:**
    > 1.  Jalankan bot sementara dengan `node bot.js`.
    > 2.  Undang bot ke grup WhatsApp Anda.
    > 3.  Kirim pesan apa saja di grup tersebut.
    > 4.  Lihat terminal, akan muncul log `Pesan masuk dari: ID_GRUP_ANDA@g.us`. Salin ID tersebut.

---

## 🏃 Menjalankan Bot

Sangat direkomendasikan untuk menjalankan bot menggunakan **PM2** agar bot dapat berjalan di latar belakang dan menyala kembali secara otomatis.

1.  **Install PM2 Secara Global**
    (Hanya perlu dilakukan sekali seumur hidup di satu komputer)
    ```bash
    npm install pm2 -g
    ```

2.  **Jalankan Bot Menggunakan File Konfigurasi**
    PM2 akan membaca file `ecosystem.config.js` yang sudah ada di proyek ini untuk memastikan bot berjalan dari direktori yang benar.
    ```bash
    pm2 start ecosystem.config.js
    ```

3.  **Atur untuk Startup Otomatis**
    Jalankan perintah ini untuk membuat PM2 menyala saat sistem reboot.
    ```bash
    pm2 startup
    ```
    *PM2 akan memberikan satu perintah balasan. Salin dan jalankan perintah balasan tersebut untuk menyelesaikan setup.*

4.  **Simpan Konfigurasi Proses**
    Perintah ini akan menyimpan daftar bot yang sedang berjalan agar bisa dijalankan kembali saat startup.
    ```bash
    pm2 save
    ```

---

## 💬 Format Penggunaan

Untuk mencatat pengeluaran, kirim pesan di grup dengan format tiga baris berikut:

hari iniKeterangan pengeluaran AndaJumlah pengeluaran
**Contoh:**
hari iniBeli bensin Pertamax50000Bot akan membalas dengan pesan konfirmasi jika data berhasil disimpan.

---

## 📊 Melihat Data

Data pengeluaran Anda disimpan di dalam file `database.sqlite`. Untuk melihat isinya dengan mudah, Anda bisa menggunakan aplikasi gratis seperti **[DB Browser for SQLite](https://sqlitebrowser.org/dl/)**. Cukup buka programnya, klik "Open Database", dan pilih file `database.sqlite` dari folder proyek Anda.

