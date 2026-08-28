'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getMotors, addService } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

function AddServiceForm() {
  const searchParams = useSearchParams();
  const motorId = searchParams.get('motorId');
  const router = useRouter();
  
  const [motors, setMotors] = useState([]);
  const [formData, setFormData] = useState({
    motorId: motorId || '',
    tanggalService: new Date().toISOString().split('T')[0],
    jenisService: '',
    bengkel: '',
    biaya: '',
    kilometer: '',
    catatan: ''
  });

  useEffect(() => {
    loadMotors();
  }, []);

  async function loadMotors() {
    try {
      const motorList = await getMotors();
      setMotors(motorList);
    } catch (error) {
      console.error('Error loading motors:', error);
      toast.error('Gagal memuat data motor');
    }
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      await addService(formData);
      
      toast.success('Service berhasil dicatat!');
      setTimeout(() => {
        router.push(`/motors/${formData.motorId}`);
      }, 1500);
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Gagal mencatat service');
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <Toaster />
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Kembali
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">Catat Service Baru</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Pilih Motor *</label>
          <select
            name="motorId"
            value={formData.motorId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Pilih Motor</option>
            {motors.map(motor => (
              <option key={motor.id} value={motor.id}>
                {motor.nama} - {motor.merk} {motor.tipe}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Tanggal Service *</label>
          <input
            type="date"
            name="tanggalService"
            value={formData.tanggalService}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Jenis Service *</label>
          <select
            name="jenisService"
            value={formData.jenisService}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Pilih Jenis Service</option>
            <option value="Ganti Oli">Ganti Oli</option>
            <option value="Servis Rutin">Servis Rutin</option>
            <option value="Servis Besar">Servis Besar</option>
            <option value="Ganti Ban">Ganti Ban</option>
            <option value="Ganti Aki">Ganti Aki</option>
            <option value="Ganti Kampas Rem">Ganti Kampas Rem</option>
            <option value="Perbaikan">Perbaikan</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Bengkel</label>
          <input
            type="text"
            name="bengkel"
            value={formData.bengkel}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Nama bengkel"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Biaya (Rp)</label>
            <input
              type="number"
              name="biaya"
              value={formData.biaya}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="0"
              min="0"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Kilometer</label>
            <input
              type="number"
              name="kilometer"
              value={formData.kilometer}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="0"
              min="0"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Catatan</label>
          <textarea
            name="catatan"
            value={formData.catatan}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Catatan tambahan..."
          ></textarea>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Simpan Service
        </button>
      </form>
    </main>
  );
}

export default function AddService() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AddServiceForm />
    </Suspense>
  );
}
