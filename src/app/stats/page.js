'use client';

import { useState, useEffect } from 'react';
import { getMotors, getAllServices } from '@/lib/firestore';
import { formatRupiah, formatTanggal } from '@/utils/formatRupiah';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

export default function StatsPage() {
  const [stats, setStats] = useState({
    totalMotor: 0,
    totalService: 0,
    totalBiaya: 0,
    rataBiaya: 0,
    serviceTerakhir: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const motors = await getMotors();
      const services = await getAllServices();
      
      const totalBiaya = services.reduce((sum, s) => sum + (s.biaya || 0), 0);
      
      // Sort services by date
      services.sort((a, b) => {
        const dateA = a.tanggalService instanceof Date ? a.tanggalService : new Date(a.tanggalService);
        const dateB = b.tanggalService instanceof Date ? b.tanggalService : new Date(b.tanggalService);
        return dateB - dateA;
      });
      
      setStats({
        totalMotor: motors.length,
        totalService: services.length,
        totalBiaya: totalBiaya,
        rataBiaya: services.length > 0 ? totalBiaya / services.length : 0,
        serviceTerakhir: services[0] || null
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-8 rounded-b-3xl">
        <h1 className="text-2xl font-bold text-white">📊 Statistik</h1>
        <p className="text-blue-50 text-sm font-medium">Ringkasan service motor Anda</p>
      </div>

      {/* Stats Cards */}
      <div className="px-4 mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl shadow-md p-5">
            <p className="text-3xl mb-1">🏍️</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalMotor}</p>
            <p className="text-sm text-gray-700 font-semibold mt-1">Total Motor</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5">
            <p className="text-3xl mb-1">🔧</p>
            <p className="text-2xl font-bold text-green-600">{stats.totalService}</p>
            <p className="text-sm text-gray-700 font-semibold mt-1">Total Service</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="text-sm text-gray-700 font-semibold mb-2">Total Biaya Service</p>
          <p className="text-3xl font-bold text-orange-600">{formatRupiah(stats.totalBiaya)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="text-sm text-gray-700 font-semibold mb-2">Rata-rata Biaya per Service</p>
          <p className="text-2xl font-bold text-blue-600">{formatRupiah(stats.rataBiaya)}</p>
        </div>

        {stats.serviceTerakhir ? (
          <div className="bg-white rounded-xl shadow-md p-5">
            <p className="text-sm text-gray-700 font-semibold mb-3">Service Terakhir</p>
            <div className="flex justify-between items-center gap-3">
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg">{stats.serviceTerakhir.jenisService}</p>
                <p className="text-sm text-gray-700 font-medium">
                  {formatTanggal(stats.serviceTerakhir.tanggalService)}
                </p>
                {stats.serviceTerakhir.bengkel && (
                  <p className="text-xs text-gray-700 font-medium mt-1">
                    📍 {stats.serviceTerakhir.bengkel}
                  </p>
                )}
              </div>
              <p className="font-bold text-green-600 whitespace-nowrap">
                {formatRupiah(stats.serviceTerakhir.biaya)}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-800 font-semibold">Belum ada data service</p>
            <Link 
              href="/services/add"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              + Catat Service Pertama
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
