// Helper untuk handle jenis service (bisa string atau array)
// Untuk backward compatibility dengan data lama

export function formatJenisService(jenisService) {
  if (!jenisService) return '-';
  
  // Kalau array (data baru)
  if (Array.isArray(jenisService)) {
    if (jenisService.length === 0) return '-';
    return jenisService.join(', ');
  }
  
  // Kalau string (data lama)
  return jenisService;
}

export function getJenisServiceList(jenisService) {
  if (!jenisService) return [];
  
  if (Array.isArray(jenisService)) {
    return jenisService;
  }
  
  return [jenisService];
}
