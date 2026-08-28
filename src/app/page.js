'use client';

import { useState, useEffect } from 'react';
import { getMotors } from '@/lib/firestore';
import { formatRupiah, formatTanggal } from '@/utils/formatRupiah';
import Link from 'next/link';
import { getServicesByMotor } from '@/lib/firestore';

export default function Home() {
  const [motors, setMotors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      setError(null);
      
      const motorList = await getMotors();
      setMotors(motorList);
      
      // Hitung statistik
      let totalService = 0;
      let totalBiaya = 0;
      
      // Ambil service untuk setiap motor
      for (const motor of motorList) {
        const services = await getServicesByMotor(motor.id);
        totalService += services.length;
        totalBiaya += services.reduce((sum, service) => sum + (service.biaya || 0), 0);
      }
      
      setStats({
        totalMotor: motorList.length,
        totalService: totalService,
        totalBiaya: totalBiaya
      });
      
    } catch (error) {
      console.error('Error loading motors:', error);
      setError('Gagal memuat data. Pastikan Firebase sudah dikonfigurasi dengan benar.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadMotors}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🏍️ Motor Service Tracker</h1>
        <p className="text-gray-600">Catat riwayat service motor Anda dengan mudah</p>
      </div>

      {/* Statistik Dashboard */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl mb-2">🏍️</div>
          <p className="text-2xl font-bold text-blue-600">{stats.totalMotor}</p>
          <p className="text-gray-600">Motor</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl mb-2">🔧</div>
          <p className="text-2xl font-bold text-green-600">{stats.totalService}</p>
          <p className="text-gray-600">Service</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl mb-2">💰</div>
          <p className="text-2xl font-bold text-orange-600">{formatRupiah(stats.totalBiaya)}</p>
          <p className="text-gray-600">Total Biaya</p>
        </div>
      </div>

      {/* Daftar Motor */}
      {motors.length === 0 ? (
        <div className="text-center bg-white rounded-lg shadow-md p-12">
          <div className="text-6xl mb-4">🏍️</div>
          <h2 className="text-2xl font-bold mb-2">Belum Ada Motor Terdaftar</h2>
          <p className="text-gray-600 mb-6">
            Mulai dengan menambahkan motor pertama Anda
          </p>
          <Link 
            href="/motors/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
          >
            + Tambah Motor Pertama
          </Link>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Motor Anda</h2>
            <Link 
              href="/motors/add"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Tambah Motor
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {motors.map(motor => (
              <Link href={`/motors/${motor.id}`} key={motor.id}>
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{motor.nama}</h3>
                      <p className="text-gray-600">
                        {motor.merk} {motor.tipe} ({motor.tahun})
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {motor.platNomor || 'No Plat'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kilometer:</span>
                      <span className="font-semibold">
                        {motor.kilometerTerakhir?.toLocaleString() || 0} km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Terakhir Update:</span>
                      <span className="font-semibold">
                        {motor.updatedAt?.toDate?.() 
                          ? formatTanggal(motor.updatedAt.toDate()) 
                          : '-'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <span className="text-blue-600 text-sm font-semibold">
                      Lihat Detail →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Quick Actions */}
      {motors.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-8">
          <Link 
            href="/services/add"
            className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition text-center"
          >
            🔧 Catat Service
          </Link>
          <Link 
            href="/motors/add"
            className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition text-center"
          >
            🏍️ Tambah Motor
          </Link>
        </div>
      )}
    </main>
  );
}
