'use client';

import { useState, useEffect } from 'react';
import { getMotors, deleteMotor } from '@/lib/firestore';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import BottomNav from '@/components/BottomNav';

export default function MotorsPage() {
  const [motors, setMotors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMotors();
  }, []);

  async function loadMotors() {
    try {
      const motorList = await getMotors();
      setMotors(motorList);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal memuat data motor');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteMotor(motorId, motorName) {
    if (!window.confirm(`Yakin ingin menghapus "${motorName}"?`)) return;
    
    try {
      await deleteMotor(motorId);
      toast.success('Motor berhasil dihapus');
      loadMotors();
    } catch (error) {
      toast.error('Gagal menghapus motor');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="pb-24">
      <Toaster />
      
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-8 rounded-b-3xl">
        <h1 className="text-2xl font-bold">🛵 Motor Saya</h1>
        <p className="text-blue-100 text-sm">Kelola data motor Anda</p>
      </div>

      {/* Motor List */}
      <div className="px-4 mt-6">
        {motors.length === 0 ? (
          <div className="text-center bg-white rounded-xl shadow-md p-8">
            <div className="text-5xl mb-3">🏍️</div>
            <p className="text-gray-600 mb-4">Belum ada motor</p>
            <Link href="/motors/add" className="bg-blue-600 text-white px-6 py-3 rounded-lg">
              + Tambah Motor
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {motors.map(motor => (
              <div key={motor.id} className="bg-white rounded-xl shadow-md p-5 relative">
                <Link href={`/motors/${motor.id}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
                      🏍️
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{motor.nama}</h3>
                      <p className="text-sm text-gray-600">{motor.merk} {motor.tipe}</p>
                      <p className="text-xs text-gray-500">{motor.platNomor}</p>
                    </div>
                    <span className="text-gray-400">›</span>
                  </div>
                </Link>
                <button
                  onClick={() => handleDeleteMotor(motor.id, motor.nama)}
                  className="absolute bottom-2 right-2 text-red-500 p-2"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <Link
        href="/motors/add"
        className="fixed bottom-20 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>

      <BottomNav />
    </main>
  );
}
