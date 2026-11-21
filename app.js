// =============================================================
// LAB 2 - app.js - berjalan di BROWSER
// DOM + event + async/await.
// Memakai function dari nilai.js (hitung nilai) dan api.js (data),
// yang sudah dimuat lebih dulu oleh index.html.
// =============================================================

// ---------- Pilih elemen ----------
const tbody = document.querySelector('#tabel-body');
const form = document.querySelector('#form-mahasiswa');
const inputCari = document.querySelector('#cari');
const pesan = document.querySelector('#pesan');

let semuaData = [];   // hasil rekap (sudah ada nilaiAkhir, grade, lulus)

// =============================================================
// LANGKAH 3a: ambil data dari API (api.js)
// =============================================================
async function muatData() {
  try {
    const daftar = await ambilMahasiswa();   // data mentah dari api.js
    semuaData = buatRekap(daftar);           // hitung nilai (nilai.js)
    tampilkan();
  } catch (err) {
    tampilkanPesan(`Gagal memuat data: ${err.message}`, 'error');
  }
}

// Menampilkan tabel (hasil pencarian) + statistik (seluruh data)
function tampilkan() {
  const hasilCari = cariMahasiswa(semuaData, inputCari.value);
  renderTabel(hasilCari);
  renderStatistik(semuaData);
}

// =============================================================
// LANGKAH 3b: tampilkan data ke tabel
// =============================================================
function renderTabel(data) {
  tbody.replaceChildren();   // kosongkan isi tabel

  if (data.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 8;
    td.className = 'kosong';
    td.textContent = 'Tidak ada data';
    tr.append(td);
    tbody.append(tr);
    return;
  }

  for (const m of data) {
    const tr = document.createElement('tr');
    tr.classList.add(m.lulus ? 'lulus' : 'tidak-lulus');

    const kolom = [m.nim, m.nama, m.tugas, m.uts, m.uas, m.nilaiAkhir, m.grade];
    for (const nilai of kolom) {
      const td = document.createElement('td');
      td.textContent = nilai;   // textContent, BUKAN innerHTML
      tr.append(td);
    }

    // BONUS: tombol hapus
    const aksi = document.createElement('td');
    const tombol = document.createElement('button');
    tombol.className = 'btn-hapus';
    tombol.dataset.nim = m.nim;
    tombol.textContent = 'Hapus';
    aksi.append(tombol);
    tr.append(aksi);

    tbody.append(tr);
  }
}

// =============================================================
// LANGKAH 4: statistik
// =============================================================
function renderStatistik(data) {
  const jumlahLulus = data.filter((m) => m.lulus).length;
  const tertinggi = cariTertinggi(data);

  document.querySelector('#stat-jumlah').textContent = data.length;
  document.querySelector('#stat-lulus').textContent = `${jumlahLulus}/${data.length}`;
  document.querySelector('#stat-rata').textContent = hitungRataRata(data);
  document.querySelector('#stat-tertinggi').textContent =
    tertinggi ? `${tertinggi.nama} (${tertinggi.nilaiAkhir})` : '-';
  document.querySelector('#stat-distribusi').textContent =
    Object.entries(hitungDistribusiGrade(data))
      .map(([grade, jumlah]) => `${grade}: ${jumlah}`)
      .join(' · ');
}

// Sudah jadi
function tampilkanPesan(teks, jenis) {
  pesan.textContent = teks;
  pesan.className = jenis;   // 'sukses' atau 'error' (lihat style.css)
}

// =============================================================
// LANGKAH 5: pencarian
// =============================================================
inputCari.addEventListener('input', tampilkan);

// =============================================================
// LANGKAH 6: tambah mahasiswa
// =============================================================
form.addEventListener('submit', async (event) => {
  event.preventDefault();   // cegah reload halaman

  const f = new FormData(form);
  const baru = {
    nim: f.get('nim').trim(),
    nama: f.get('nama').trim(),
    tugas: f.get('tugas') === '' ? NaN : Number(f.get('tugas')),
    uts: f.get('uts') === '' ? NaN : Number(f.get('uts')),
    uas: f.get('uas') === '' ? NaN : Number(f.get('uas')),
  };

  const errors = validasiMahasiswa(baru);
  if (errors.length > 0) {
    tampilkanPesan(errors.join(', '), 'error');
    return;
  }

  try {
    const hasil = await tambahMahasiswa(baru);   // melempar Error jika ditolak
    const [r] = buatRekap([hasil]);
    tampilkanPesan(`${r.nama} tersimpan: nilai ${r.nilaiAkhir} (${r.grade})`, 'sukses');
    form.reset();
    await muatData();
  } catch (err) {
    tampilkanPesan(`Gagal menyimpan: ${err.message}`, 'error');
  }
});

// =============================================================
// LANGKAH 7 (BONUS): hapus dengan event delegation
// =============================================================
tbody.addEventListener('click', async (event) => {
  const tombol = event.target.closest('.btn-hapus');
  if (!tombol) return;

  const nim = tombol.dataset.nim;
  if (!confirm(`Hapus mahasiswa dengan NIM ${nim}?`)) return;

  try {
    const teks = await hapusMahasiswa(nim);
    tampilkanPesan(teks, 'sukses');
    await muatData();
  } catch (err) {
    tampilkanPesan(`Gagal menghapus: ${err.message}`, 'error');
  }
});

// ---------- Mulai ----------
muatData();
