'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getMotor, getServicesByMotor, deleteService } from '@/lib/firestore';
import { formatRupiah, formatTanggal } from '@/utils/formatRupiah';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import BottomNav from '@/components/BottomNav';

export default function MotorDetail() {
  const { id } = useParams();
  const [motor, setMotor] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBiaya, setTotalBiaya] = useState(0);
  const [selectedFoto, setSelectedFoto] = useState(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  async function loadData() {
    try {
      const motorData = await getMotor(id);
      const serviceData = await getServicesByMotor(id);
      
      setMotor(motorData);
      setServices(serviceData);
      
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
    const confirmDelete = window.confirm(`Yakin ingin menghapus service "${serviceType}"?`);
    
    if (!confirmDelete) return;
    
    try {
      await deleteService(serviceId);
      toast.success('Service berhasil dihapus');
      loadData();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Gagal menghapus service');
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
        <Link href="/" className="text-blue-600 font-bold hover:underline">
          ← Kembali ke Home
        </Link>
      </main>
    );
  }

  return (
    <main className="pb-24">
      <Toaster />
      
      {/* Modal untuk lihat foto */}
      {selectedFoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedFoto(null)}
        >
          <div className="max-w-lg w-full">
            <img 
              src={selectedFoto} 
              alt="Foto struk" 
              className="w-full rounded-lg"
            />
            <button
              onClick={() => setSelectedFoto(null)}
              className="mt-4 w-full bg-white text-gray-900 py-3 rounded-lg font-bold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-8 rounded-b-3xl">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/" className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{motor.nama}</h1>
            <p className="text-blue-50 text-sm font-medium">
              {motor.merk} {motor.tipe} ({motor.tahun})
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold">
            {motor.platNomor || 'No Plat'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-sm text-gray-700 font-semibold">Kilometer</p>
            <p className="text-xl font-bold text-gray-900">
              {motor.kilometerTerakhir?.toLocaleString() || 0} km
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-sm text-gray-700 font-semibold">Total Service</p>
            <p className="text-xl font-bold text-gray-900">{services.length}x</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-sm text-gray-700 font-semibold">Total Biaya</p>
            <p className="text-sm font-bold text-green-600">
              {formatRupiah(totalBiaya)}
            </p>
          </div>
        </div>
      </div>

      {/* Service List */}
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Riwayat Service</h2>
          <Link 
            href={`/services/add?motorId=${id}`}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-bold"
          >
            + Catat Service
          </Link>
        </div>
        
        {services.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-800 font-semibold">Belum ada riwayat service</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map(service => (
              <div key={service.id} className="bg-white rounded-xl shadow-md p-5">
                {/* Info utama service */}
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900">{service.jenisService}</h3>
                    <p className="text-sm text-gray-700 font-medium">
                      {formatTanggal(service.tanggalService)}
                    </p>
                  </div>
                  <span className="font-bold text-green-600 whitespace-nowrap">
                    {formatRupiah(service.biaya)}
                  </span>
                </div>
                
                {/* Detail service */}
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
                
                {/* Foto struk */}
                {service.fotoStruk && (
                  <div className="mb-3">
                    <img 
                      src={service.fotoStruk} 
                      alt="Struk service"
                      className="w-full h-32 object-cover rounded-lg cursor-pointer border border-gray-200"
                      onClick={() => setSelectedFoto(service.fotoStruk)}
                    />
                    <p className="text-xs text-gray-700 font-medium mt-1 text-center">
                      👆 Klik untuk perbesar
                    </p>
                  </div>
                )}
                
                {/* Catatan */}
                {service.catatan && (
                  <p className="mb-3 text-sm text-gray-700 font-medium">
                    📝 {service.catatan}
                  </p>
                )}
                
                {/* Tombol hapus */}
                <div className="border-t border-gray-200 pt-3 flex justify-end">
                  <button
                    onClick={() => handleDeleteService(service.id, service.jenisService)}
                    className="text-red-600 hover:text-red-700 text-sm font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                    title="Hapus service"
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
