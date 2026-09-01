'use client';

import { useState, useEffect } from 'react';
import { getMotors, getAllServices, deleteMotor, updateKilometer } from '@/lib/firestore';
import { formatRupiah } from '@/utils/formatRupiah';
import { hitungStatusService } from '@/utils/serviceReminder';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import BottomNav from '@/components/BottomNav';

export default function Home() {
  const [motors, setMotors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMotor: 0,
    totalService: 0,
    totalBiaya: 0
  });
  const [showUpdateKm, setShowUpdateKm] = useState(null);
  const [kmBaru, setKmBaru] = useState('');
  const [updatingKm, setUpdatingKm] = useState(false);

  useEffect(() => {
    loadMotors();
  }, []);

  async function loadMotors() {
    try {
      setLoading(true);
      const motorList = await getMotors();
      const allServices = await getAllServices();
      
      const motorsWithStatus = motorList.map(motor => {
        const motorServices = allServices.filter(s => s.motorId === motor.id);
        const latestService = motorServices[0];
        const status = hitungStatusService(motor, latestService);
        
        return {
          ...motor,
          statusReminder: status,
          latestService: latestService
        };
      });
      
      setMotors(motorsWithStatus);
      
      setStats({
        totalMotor: motorList.length,
        totalService: allServices.length,
        totalBiaya: allServices.reduce((sum, service) => sum + (service.biaya || 0), 0)
      });
    } catch (error) {
      console.error('Error loading motors:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteMotor(motorId, motorName) {
    if (!window.confirm(`Yakin ingin menghapus "${motorName}"? Semua riwayat service juga akan dihapus.`)) return;
    
    try {
      await deleteMotor(motorId);
      toast.success(`Motor "${motorName}" berhasil dihapus`);
      loadMotors();
    } catch (error) {
      console.error('Error deleting motor:', error);
      toast.error('Gagal menghapus motor');
    }
  }

  function openUpdateKm(motor) {
    setShowUpdateKm(motor);
    setKmBaru(motor.kilometerTerakhir?.toString() || '');
  }

  async function handleUpdateKm() {
    if (!showUpdateKm) return;
    
    if (!kmBaru || parseInt(kmBaru) <= 0) {
      toast.error('Masukkan kilometer yang valid');
      return;
    }
    
    setUpdatingKm(true);
    
    try {
      await updateKilometer(showUpdateKm.id, kmBaru);
      toast.success('Kilometer berhasil diupdate!');
      setShowUpdateKm(null);
      setKmBaru('');
      loadMotors();
    } catch (error) {
      console.error('Error updating km:', error);
      toast.error('Gagal update kilometer');
    } finally {
      setUpdatingKm(false);
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

  return (
    <main className="pb-24">
      <Toaster />
      
      {/* Modal Update KM */}
      {showUpdateKm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Update Kilometer</h3>
            <p className="text-sm text-gray-700 font-medium mb-4">
              {showUpdateKm.nama} - {showUpdateKm.merk} {showUpdateKm.tipe}
            </p>
            
            <div className="mb-4">
              <label className="block text-gray-800 font-semibold mb-2">
                Kilometer Saat Ini
              </label>
              <input
                type="number"
                value={kmBaru}
                onChange={(e) => setKmBaru(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-lg font-bold"
                placeholder="Contoh: 15500"
                min="0"
                autoFocus
              />
              {showUpdateKm.kilometerTerakhir > 0 && (
                <p className="text-xs text-gray-700 font-medium mt-1">
                  KM sebelumnya: {showUpdateKm.kilometerTerakhir.toLocaleString()} km
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpdateKm(null)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateKm}
                disabled={updatingKm}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {updatingKm ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-8 rounded-b-3xl">
        <h1 className="text-2xl font-bold mb-1 text-white">🏍️ Motor Service Tracker</h1>
        <p className="text-blue-50 text-sm font-medium">Kelola service motor Anda</p>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.totalMotor}</p>
            <p className="text-xs text-gray-700 font-semibold">Motor</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.totalService}</p>
            <p className="text-xs text-gray-700 font-semibold">Service</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-sm font-bold text-orange-600">{formatRupiah(stats.totalBiaya)}</p>
            <p className="text-xs text-gray-700 font-semibold">Total Biaya</p>
          </div>
        </div>
      </div>

      {/* Motor List */}
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Motor Anda</h2>
          <Link href="/motors/add" className="text-blue-600 text-sm font-bold">
            + Tambah
          </Link>
        </div>

        {motors.length === 0 ? (
          <div className="text-center bg-white rounded-xl shadow-md p-8">
            <div className="text-5xl mb-3">🏍️</div>
            <p className="text-gray-800 font-semibold mb-4">Belum ada motor terdaftar</p>
            <Link 
              href="/motors/add"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg inline-block font-semibold"
            >
              + Tambah Motor Pertama
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {motors.map(motor => (
              <div key={motor.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <Link href={`/motors/${motor.id}`}>
                  <div className="p-5 active:scale-95 transition">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{motor.nama}</h3>
                        <p className="text-sm text-gray-700 font-medium">
                          {motor.merk} {motor.tipe}
                        </p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                        {motor.platNomor || 'No Plat'}
                      </span>
                    </div>
                    
                    {/* Status Service Reminder */}
                    {motor.statusReminder && (
                      <div className={`mb-3 p-3 rounded-lg ${
                        motor.statusReminder.warna === 'green' 
                          ? 'bg-green-50 border border-green-200' 
                          : motor.statusReminder.warna === 'yellow'
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">
                            {motor.statusReminder.icon} {motor.statusReminder.pesan}
                          </span>
                          <span className="text-xs font-semibold text-gray-700">
                            {motor.statusReminder.persentase}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 font-medium mt-1">
                          {motor.statusReminder.sisaKm > 0 && `Sisa ${motor.statusReminder.sisaKm.toLocaleString()} km`}
                          {motor.statusReminder.sisaKm > 0 && motor.statusReminder.sisaBulan > 0 && ' • '}
                          {motor.statusReminder.sisaBulan > 0 && `Sisa ${motor.statusReminder.sisaBulan} bulan`}
                          {(motor.statusReminder.sisaKm <= 0 && motor.statusReminder.sisaBulan <= 0) && 'Sudah melewati jadwal service'}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm font-medium mb-3">
                      <span className="text-gray-700">🛣️ {motor.kilometerTerakhir?.toLocaleString() || 0} km</span>
                      <span className="text-gray-700">🔧 {motor.latestService ? motor.latestService.jenisService : 'Belum ada service'}</span>
                    </div>
                  </div>
                </Link>
                
                {/* Tombol Update KM & Hapus */}
                <div className="border-t border-gray-200 flex justify-between items-center px-4 py-2">
                  <button
                    onClick={() => openUpdateKm(motor)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update KM
                  </button>
                  <button
                    onClick={() => handleDeleteMotor(motor.id, motor.nama)}
                    className="text-red-600 hover:text-red-700 text-sm font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
