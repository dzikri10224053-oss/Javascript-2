// =============================================================
// nilai.js - LOGIKA hitung nilai, berjalan di BROWSER
// File ini hanya berisi LOGIKA (hitung nilai). Urusan DOM ada di app.js.
// Uji di Console browser, mis.: tentukanGrade(84.9)  -> 'B'
// =============================================================

// Bobot nilai akhir: tugas 30%, UTS 30%, UAS 40%
const BOBOT = { tugas: 0.3, uts: 0.3, uas: 0.4 };

function hitungNilaiAkhir(tugas, uts, uas) {
  const nilai = tugas * BOBOT.tugas + uts * BOBOT.uts + uas * BOBOT.uas;
  return Math.round(nilai * 10) / 10;   // dibulatkan 1 desimal
}

// A >= 85, B >= 75, C >= 65, D >= 55, selain itu E
function tentukanGrade(nilai) {
  if (nilai >= 85) return 'A';
  if (nilai >= 75) return 'B';
  if (nilai >= 65) return 'C';
  if (nilai >= 55) return 'D';
  return 'E';
}

// Dari data mentah -> data + nilaiAkhir, grade, lulus (grade bukan E)
function buatRekap(daftar) {
  return daftar.map((m) => {
    const nilaiAkhir = hitungNilaiAkhir(m.tugas, m.uts, m.uas);
    const grade = tentukanGrade(nilaiAkhir);
    return { ...m, nilaiAkhir, grade, lulus: grade !== 'E' };
  });
}

function hitungRataRata(rekap) {
  if (rekap.length === 0) return 0;
  const total = rekap.reduce((jumlah, m) => jumlah + m.nilaiAkhir, 0);
  return Math.round((total / rekap.length) * 10) / 10;
}

function cariTertinggi(rekap) {
  if (rekap.length === 0) return null;
  return rekap.reduce((terbaik, m) => (m.nilaiAkhir > terbaik.nilaiAkhir ? m : terbaik));
}

function hitungDistribusiGrade(rekap) {
  const distribusi = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  for (const m of rekap) distribusi[m.grade] += 1;
  return distribusi;
}

// Pencarian nama, tidak peka huruf besar/kecil
function cariMahasiswa(rekap, kataKunci) {
  const kunci = kataKunci.trim().toLowerCase();
  if (kunci === '') return rekap;
  return rekap.filter((m) => m.nama.toLowerCase().includes(kunci));
}

// ---- Validasi input mahasiswa baru (dipakai sebelum memanggil api.js) ----
// Mengembalikan array pesan error; array kosong = valid.
function validasiMahasiswa(input) {
  const errors = [];
  if (typeof input.nim !== 'string' || !/^\d{7}$/.test(input.nim)) {
    errors.push('NIM harus 7 digit angka');
  }
  if (typeof input.nama !== 'string' || input.nama.trim().length < 3) {
    errors.push('Nama minimal 3 karakter');
  }
  for (const kolom of ['tugas', 'uts', 'uas']) {
    const n = input[kolom];
    if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 100) {
      errors.push(`Nilai ${kolom} harus angka 0-100`);
    }
  }
  return errors;
}
