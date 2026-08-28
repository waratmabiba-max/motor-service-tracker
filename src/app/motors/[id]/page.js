'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getMotor, getServicesByMotor, deleteService } from '@/lib/firestore';
import { formatRupiah, formatTanggal } from '@/utils/formatRupiah';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function MotorDetail() {
  const { id } = useParams();
  const [motor, setMotor] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBiaya, setTotalBiaya] = useState(0);

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
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!motor) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl mb-4">Motor tidak ditemukan</p>
        <Link href="/" className="text-blue-600 hover:underline">← Kembali ke Home</Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <Toaster />
      
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Kembali
      </Link>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold">{motor.nama}</h1>
            <p className="text-gray-600">
              {motor.merk} {motor.tipe} ({motor.tahun})
            </p>
          </div>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            {motor.platNomor || 'No Plat'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Kilometer</p>
            <p className="text-xl font-bold">
              {motor.kilometerTerakhir?.toLocaleString() || 0} km
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Service</p>
            <p className="text-xl font-bold">{services.length}x</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Biaya</p>
            <p className="text-xl font-bold text-green-600">
              {formatRupiah(totalBiaya)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Riwayat Service</h2>
        <Link 
          href={`/services/add?motorId=${id}`}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          + Catat Service
        </Link>
      </div>
      
      {services.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
          Belum ada riwayat service
        </div>
      ) : (
        <div className="space-y-4">
          {services.map(service => (
            <div key={service.id} className="relative bg-white rounded-lg shadow-md p-6">
              <button
                onClick={() => handleDeleteService(service.id, service.jenisService)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                title="Hapus service"
              >
                🗑️
              </button>
              
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{service.jenisService}</h3>
                  <p className="text-sm text-gray-600">
                    {formatTanggal(service.tanggalService)}
                  </p>
                </div>
                <span className="font-semibold text-green-600 mr-10">
                  {formatRupiah(service.biaya)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {service.bengkel && (
                  <div>
                    <span className="text-gray-600">Bengkel:</span>
                    <p className="font-semibold">{service.bengkel}</p>
                  </div>
                )}
                {service.kilometer > 0 && (
                  <div>
                    <span className="text-gray-600">Kilometer:</span>
                    <p className="font-semibold">{service.kilometer.toLocaleString()} km</p>
                  </div>
                )}
              </div>
              
              {service.catatan && (
                <p className="mt-3 text-sm text-gray-600">
                  📝 {service.catatan}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
