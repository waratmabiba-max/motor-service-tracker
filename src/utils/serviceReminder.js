// Fungsi untuk menghitung status pengingat service

export function hitungStatusService(motor, latestService) {
  if (!motor) return null;
  
  const intervalKm = motor.serviceIntervalKm || 2500;
  const intervalBulan = motor.serviceIntervalBulan || 3;
  
  let kmSejakService = 0;
  let bulanSejakService = 0;
  
  if (latestService) {
    // Hitung selisih km
    if (latestService.kilometer && motor.kilometerTerakhir) {
      kmSejakService = motor.kilometerTerakhir - latestService.kilometer;
    }
    
    // Hitung selisih bulan
    const tanggalService = latestService.tanggalService instanceof Date 
      ? latestService.tanggalService 
      : new Date(latestService.tanggalService);
    
    const sekarang = new Date();
    const selisihBulan = (sekarang.getFullYear() - tanggalService.getFullYear()) * 12 
      + (sekarang.getMonth() - tanggalService.getMonth());
    
    bulanSejakService = selisihBulan;
  }
  
  // Hitung persentase
  const persenKm = (kmSejakService / intervalKm) * 100;
  const persenBulan = (bulanSejakService / intervalBulan) * 100;
  
  // Ambil persentase tertinggi
  const persentase = Math.max(persenKm, persenBulan);
  
  // Tentukan status
  let status;
  let warna;
  let icon;
  let pesan;
  
  if (persentase >= 100) {
    status = 'segera';
    warna = 'red';
    icon = '🔴';
    pesan = 'Segera Service!';
  } else if (persentase >= 70) {
    status = 'perhatian';
    warna = 'yellow';
    icon = '🟡';
    pesan = 'Mendekati Jadwal';
  } else {
    status = 'aman';
    warna = 'green';
    icon = '🟢';
    pesan = 'Masih Aman';
  }
  
  return {
    status,
    warna,
    icon,
    pesan,
    kmSejakService,
    bulanSejakService,
    persentase: Math.round(persentase),
    sisaKm: Math.max(0, intervalKm - kmSejakService),
    sisaBulan: Math.max(0, intervalBulan - bulanSejakService),
    intervalKm,
    intervalBulan
  };
}
