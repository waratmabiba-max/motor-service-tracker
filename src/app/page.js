'use client';

import { useState, useEffect } from 'react';
import { getMotors, getAllServices, deleteMotor } from '@/lib/firestore';
import { formatRupiah, formatTanggal } from '@/utils/formatRupiah';
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

  useEffect(() => {
    loadMotors();
  }, []);

  async function loadMotors() {
    try {
      setLoading(true);
      const motorList = await getMotors();
      setMotors(motorList);
      
      const allServices = await getAllServices();
      
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="pb-24">
      <Toaster />
      
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-8 rounded-b-3xl">
        <h1 className="text-2xl font-bold mb-1">🏍️ Motor Service Tracker</h1>
        <p className="text-blue-100 text-sm">Kelola service motor Anda</p>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.totalMotor}</p>
            <p className="text-xs text-gray-600">Motor</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.totalService}</p>
            <p className="text-xs text-gray-600">Service</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-sm font-bold text-orange-600">{formatRupiah(stats.totalBiaya)}</p>
            <p className="text-xs text-gray-600">Total Biaya</p>
          </div>
        </div>
      </div>

      {/* Motor List */}
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Motor Anda</h2>
          <Link href="/motors/add" className="text-blue-600 text-sm font-semibold">
            + Tambah
          </Link>
        </div>

        {motors.length === 0 ? (
          <div className="text-center bg-white rounded-xl shadow-md p-8">
            <div className="text-5xl mb-3">🏍️</div>
            <p className="text-gray-600 mb-4">Belum ada motor terdaftar</p>
            <Link 
              href="/motors/add"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg inline-block"
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
                        <h3 className="font-bold text-lg">{motor.nama}</h3>
                        <p className="text-sm text-gray-600">
                          {motor.merk} {motor.tipe}
                        </p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                        {motor.platNomor || 'No Plat'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>📅 {motor.tahun}</span>
                      <span>🛣️ {motor.kilometerTerakhir?.toLocaleString() || 0} km</span>
                    </div>
                  </div>
                </Link>
                
                {/* Tombol hapus */}
                <div className="border-t border-gray-100 flex justify-end px-4 py-2">
                  <button
                    onClick={() => handleDeleteMotor(motor.id, motor.nama)}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1"
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
