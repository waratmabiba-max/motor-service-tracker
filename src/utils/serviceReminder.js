// Fungsi untuk menghitung status pengingat service

export function hitungStatusService(motor, latestService) {
  if (!motor) return null;
  
  const intervalKm = motor.serviceIntervalKm || 2500;
  const intervalBulan = motor.serviceIntervalBulan || 3;
  
  let kmSejakService = 0;
  let bulanSejakService = 0;
  
  if (latestService) {
    if (latestService.kilometer && motor.kilometerTerakhir) {
      kmSejakService = motor.kilometerTerakhir - latestService.kilometer;
    }
    
    const tanggalService = latestService.tanggalService instanceof Date 
      ? latestService.tanggalService 
      : new Date(latestService.tanggalService);
    
    const sekarang = new Date();
    const selisihBulan = (sekarang.getFullYear() - tanggalService.getFullYear()) * 12 
      + (sekarang.getMonth() - tanggalService.getMonth());
    
    bulanSejakService = selisihBulan;
  }
  
  const persenKm = (kmSejakService / intervalKm) * 100;
  const persenBulan = (bulanSejakService / intervalBulan) * 100;
  
  const persentase = Math.max(persenKm, persenBulan);
  
  let status, warna, icon, pesan;
  
  if (persentase >= 100) {
    status = 'segera'; warna = 'red'; icon = '🔴'; pesan = 'Segera Service!';
  } else if (persentase >= 70) {
    status = 'perhatian'; warna = 'yellow'; icon = '🟡'; pesan = 'Mendekati Jadwal';
  } else {
    status = 'aman'; warna = 'green'; icon = '🟢'; pesan = 'Masih Aman';
  }
  
  return {
    status, warna, icon, pesan,
    kmSejakService, bulanSejakService,
    persentase: Math.round(persentase),
    sisaKm: Math.max(0, intervalKm - kmSejakService),
    sisaBulan: Math.max(0, intervalBulan - bulanSejakService),
    intervalKm, intervalBulan
  };
}

// Fungsi untuk menghitung status pengingat komponen
export function hitungStatusKomponen(komponen, currentKm) {
  if (!komponen) return null;
  
  const intervalKm = komponen.intervalKm || 0;
  const intervalBulan = komponen.intervalBulan || 0;
  
  const kmSejakGanti = Math.max(0, currentKm - (komponen.kmTerakhirGanti || 0));
  
  let bulanSejakGanti = 0;
  if (komponen.tanggalTerakhirGanti) {
    const tgl = komponen.tanggalTerakhirGanti instanceof Date 
      ? komponen.tanggalTerakhirGanti 
      : new Date(komponen.tanggalTerakhirGanti);
    const sekarang = new Date();
    bulanSejakGanti = (sekarang.getFullYear() - tgl.getFullYear()) * 12 
      + (sekarang.getMonth() - tgl.getMonth());
  }
  
  let persentase = 0;
  if (intervalKm > 0) {
    persentase = Math.max(persentase, (kmSejakGanti / intervalKm) * 100);
  }
  if (intervalBulan > 0) {
    persentase = Math.max(persentase, (bulanSejakGanti / intervalBulan) * 100);
  }
  
  let status, warna, icon, pesan;
  if (persentase >= 100) {
    status = 'segera'; warna = 'red'; icon = '🔴'; pesan = 'Segera ganti';
  } else if (persentase >= 70) {
    status = 'perhatian'; warna = 'yellow'; icon = '🟡'; pesan = 'Mendekati';
  } else {
    status = 'aman'; warna = 'green'; icon = '🟢'; pesan = 'Aman';
  }
  
  return {
    status, warna, icon, pesan,
    persentase: Math.round(persentase),
    kmSejakGanti, bulanSejakGanti,
    sisaKm: Math.max(0, intervalKm - kmSejakGanti),
    sisaBulan: Math.max(0, intervalBulan - bulanSejakGanti)
  };
}
