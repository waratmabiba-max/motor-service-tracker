export function formatRupiah(angka) {
  if (!angka && angka !== 0) return 'Rp 0';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(angka);
}

export function formatTanggal(tanggal) {
  if (!tanggal) return '-';
  
  try {
    const date = tanggal instanceof Date ? tanggal : new Date(tanggal);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return '-';
  }
}
