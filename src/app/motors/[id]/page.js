'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  getMotor, 
  getServicesByMotor, 
  deleteService,
  getKomponenMotor,
  addKomponen,
  updateKomponen,
  deleteKomponen
} from '@/lib/firestore';
import { formatRupiah, formatTanggal } from '@/utils/formatRupiah';
import { hitungStatusKomponen } from '@/utils/serviceReminder';
import { getJenisServiceList } from '@/utils/formatJenisService';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import BottomNav from '@/components/BottomNav';

export default function MotorDetail() {
  const { id } = useParams();
  const [motor, setMotor] = useState(null);
  const [services, setServices] = useState([]);
  const [komponen, setKomponen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBiaya, setTotalBiaya] = useState(0);
  const [selectedFoto, setSelectedFoto] = useState(null);
  
  const [showTambahKomponen, setShowTambahKomponen] = useState(false);
  const [editingKomponen, setEditingKomponen] = useState(null);
  const [formKomponen, setFormKomponen] = useState({ nama: '', intervalKm: '', intervalBulan: '' });
  const [showGantiModal, setShowGantiModal] = useState(null);
  const [formGanti, setFormGanti] = useState({ km: '', tanggal: '' });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);
      const motorData = await getMotor(id);
      const serviceData = await getServicesByMotor(id);
      const komponenData = await getKomponenMotor(id);
      
      setMotor(motorData);
      setServices(serviceData);
      setKomponen(komponenData);
      
      const total = serviceData.reduce((sum, service) => sum + (service.biaya || 0), 0);
      setTotalBiaya(total);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteService(serviceId, serviceType) {
    const namaService = Array.isArray(serviceType) ? serviceType.join(', ') : serviceType;
    if (!window.confirm(`Yakin ingin menghapus service "${namaService}"?`)) return;
    try {
      await deleteService(serviceId);
      toast.success('Service berhasil dihapus');
      loadData();
    } catch (error) {
      toast.error('Gagal menghapus service');
    }
  }

  function openTambahKomponen() {
    setEditingKomponen(null);
    setFormKomponen({ nama: '', intervalKm: '', intervalBulan: '' });
    setShowTambahKomponen(true);
  }

  function openEditKomponen(komp) {
    setEditingKomponen(komp);
    setFormKomponen({
      nama: komp.nama,
      intervalKm: komp.intervalKm?.toString() || '',
      intervalBulan: komp.intervalBulan?.toString() || ''
    });
    setShowTambahKomponen(true);
  }

  async function handleSimpanKomponen() {
    if (!formKomponen.nama.trim()) {
      toast.error('Nama komponen wajib diisi');
      return;
    }
    
    try {
      const dataToSave = {
        nama: formKomponen.nama,
        intervalKm: parseInt(formKomponen.intervalKm) || 0,
        intervalBulan: parseInt(formKomponen.intervalBulan) || 0,
      };
      
      if (editingKomponen) {
        await updateKomponen(id, editingKomponen.id, dataToSave);
        toast.success('Komponen berhasil diupdate');
      } else {
        await addKomponen(id, dataToSave);
        toast.success('Komponen baru ditambahkan');
      }
      
      setShowTambahKomponen(false);
      loadData();
    } catch (error) {
      console.error('Error saving komponen:', error);
      toast.error('Gagal menyimpan komponen');
    }
  }

  async function handleDeleteKomponen(kompId, nama) {
    if (!window.confirm(`Yakin ingin menghapus komponen "${nama}"?`)) return;
    try {
      await deleteKomponen(id, kompId);
      toast.success('Komponen dihapus');
      loadData();
    } catch (error) {
      toast.error('Gagal menghapus komponen');
    }
  }

  function openGantiModal(komp) {
    setShowGantiModal(komp);
    setFormGanti({
      km: motor?.kilometerTerakhir?.toString() || '',
      tanggal: new Date().toISOString().split('T')[0]
    });
  }

  async function handleCatatGanti() {
    if (!showGantiModal) return;
    if (!formGanti.km || parseInt(formGanti.km) <= 0) {
      toast.error('Masukkan kilometer yang valid');
      return;
    }
    
    try {
      await updateKomponen(id, showGantiModal.id, {
        kmTerakhirGanti: parseInt(formGanti.km),
        tanggalTerakhirGanti: new Date(formGanti.tanggal)
      });
      toast.success('Penggantian komponen dicatat');
      setShowGantiModal(null);
      loadData();
    } catch (error) {
      toast.error('Gagal mencatat penggantian');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 font-semibold">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!motor) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl font-bold text-gray-900 mb-4">Motor tidak ditemukan</p>
        <Link href="/" className="text-blue-600 font-bold hover:underline">← Kembali ke Home</Link>
      </main>
    );
  }

  return (
    <main className="pb-24">
      <Toaster />
      
      {selectedFoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setSelectedFoto(null)}>
          <div className="max-w-lg w-full">
            <img src={selectedFoto} alt="Foto struk" className="w-full rounded-lg" />
            <button onClick={() => setSelectedFoto(null)} className="mt-4 w-full bg-white text-gray-900 py-3 rounded-lg font-bold">Tutup</button>
          </div>
        </div>
      )}

      {showTambahKomponen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingKomponen ? 'Edit Komponen' : 'Tambah Komponen'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-800 font-semibold mb-2">Nama Komponen</label>
                <input type="text" value={formKomponen.nama} onChange={(e) => setFormKomponen({...formKomponen, nama: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900" placeholder="Contoh: Kampas Rem" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">Interval KM</label>
                  <input type="number" value={formKomponen.intervalKm} onChange={(e) => setFormKomponen({...formKomponen, intervalKm: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900" placeholder="0" min="0" />
                </div>
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">Interval Bulan</label>
                  <input type="number" value={formKomponen.intervalBulan} onChange={(e) => setFormKomponen({...formKomponen, intervalBulan: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900" placeholder="0" min="0" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowTambahKomponen(false)} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold">Batal</button>
                <button onClick={handleSimpanKomponen} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showGantiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Catat Penggantian</h3>
            <p className="text-sm text-gray-700 font-medium mb-4">{showGantiModal.nama}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-800 font-semibold mb-2">Kilometer saat ganti</label>
                <input type="number" value={formGanti.km} onChange={(e) => setFormGanti({...formGanti, km: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900" min="0" />
              </div>
              <div>
                <label className="block text-gray-800 font-semibold mb-2">Tanggal ganti</label>
                <input type="date" value={formGanti.tanggal} onChange={(e) => setFormGanti({...formGanti, tanggal: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowGantiModal(null)} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold">Batal</button>
                <button onClick={handleCatatGanti} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-600 text-white px-6 py-8 rounded-b-3xl">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/" className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{motor.nama}</h1>
            <p className="text-blue-50 text-sm font-medium">{motor.merk} {motor.tipe} ({motor.tahun})</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold">{motor.platNomor || 'No Plat'}</span>
        </div>
      </div>

      <div className="px-4 -mt-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-sm text-gray-700 font-semibold">Kilometer</p>
            <p className="text-xl font-bold text-gray-900">{motor.kilometerTerakhir?.toLocaleString() || 0} km</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-sm text-gray-700 font-semibold">Total Service</p>
            <p className="text-xl font-bold text-gray-900">{services.length}x</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-sm text-gray-700 font-semibold">Total Biaya</p>
            <p className="text-sm font-bold text-green-600">{formatRupiah(totalBiaya)}</p>
          </div>
        </div>
      </div>

      {/* Komponen List */}
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Komponen & Pengingat</h2>
          <button onClick={openTambahKomponen} className="text-blue-600 text-sm font-bold">+ Tambah</button>
        </div>

        {komponen.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-800 font-semibold mb-3">Belum ada komponen terdaftar</p>
            <button onClick={openTambahKomponen} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">+ Tambah Komponen</button>
          </div>
        ) : (
          <div className="space-y-3">
            {komponen.map(komp => {
              const status = hitungStatusKomponen(komp, motor.kilometerTerakhir || 0);
              return (
                <div key={komp.id} className="bg-white rounded-xl shadow-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{komp.nama}</h3>
                      <p className="text-xs text-gray-700 font-medium">
                        Interval: {komp.intervalKm?.toLocaleString()} km / {komp.intervalBulan} bln
                      </p>
                    </div>
                    <span className={`text-sm font-bold ${
                      status.warna === 'green' ? 'text-green-600' : status.warna === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {status.icon} {status.persentase}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-700 font-medium mb-2">
                    <span>Terakhir ganti: {komp.kmTerakhirGanti?.toLocaleString() || 0} km</span>
                    <span>Sisa: {status.sisaKm.toLocaleString()} km / {status.sisaBulan} bln</span>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openGantiModal(komp)} className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-bold hover:bg-green-100">Catat Ganti</button>
                    <button onClick={() => openEditKomponen(komp)} className="px-3 py-2 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50">Edit</button>
                    <button onClick={() => handleDeleteKomponen(komp.id, komp.nama)} className="px-3 py-2 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50">Hapus</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Service List */}
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Riwayat Service</h2>
          <Link href={`/services/add?motorId=${id}`} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-bold">+ Catat Service</Link>
        </div>
        
        {services.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-800 font-semibold">Belum ada riwayat service</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map(service => {
              const listJenis = getJenisServiceList(service.jenisService);
              return (
                <div key={service.id} className="bg-white rounded-xl shadow-md p-5">
                  {/* Multi badge jenis service */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {listJenis.map((jenis, idx) => (
                      <span 
                        key={idx}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold"
                      >
                        {jenis}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <p className="text-sm text-gray-700 font-medium">
                      {formatTanggal(service.tanggalService)}
                    </p>
                    <span className="font-bold text-green-600 whitespace-nowrap">
                      {formatRupiah(service.biaya)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    {service.bengkel && (
                      <div>
                        <span className="text-gray-700 font-semibold">Bengkel:</span>
                        <p className="font-medium text-gray-900">{service.bengkel}</p>
                      </div>
                    )}
                    {service.kilometer > 0 && (
                      <div>
                        <span className="text-gray-700 font-semibold">Kilometer:</span>
                        <p className="font-medium text-gray-900">{service.kilometer.toLocaleString()} km</p>
                      </div>
                    )}
                  </div>
                  
                  {service.fotoStruk && (
                    <div className="mb-3">
                      <img src={service.fotoStruk} alt="Struk service" className="w-full h-32 object-cover rounded-lg cursor-pointer border border-gray-200" onClick={() => setSelectedFoto(service.fotoStruk)} />
                      <p className="text-xs text-gray-700 font-medium mt-1 text-center">👆 Klik untuk perbesar</p>
                    </div>
                  )}
                  
                  {service.catatan && (
                    <p className="mb-3 text-sm text-gray-700 font-medium">📝 {service.catatan}</p>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3 flex justify-end">
                    <button onClick={() => handleDeleteService(service.id, service.jenisService)} className="text-red-600 hover:text-red-700 text-sm font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
