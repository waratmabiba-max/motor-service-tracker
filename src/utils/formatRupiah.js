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

// Format angka dengan thousand separator
export function formatNumber(angka) {
  if (!angka) return '';
  
  // Hapus karakter selain angka
  const number = angka.toString().replace(/[^0-9]/g, '');
  
  // Tambahkan thousand separator
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Parse string formatted ke number
export function parseNumber(formatted) {
  if (!formatted) return 0;
  return parseInt(formatted.replace(/\./g, '')) || 0;
}
