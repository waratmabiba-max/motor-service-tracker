'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getMotors, addService } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { formatNumber, parseNumber } from '@/utils/formatRupiah';

function AddServiceForm() {
  const searchParams = useSearchParams();
  const motorId = searchParams.get('motorId');
  const router = useRouter();
  
  const [motors, setMotors] = useState([]);
  const [loading, setLoading] = useState(false);
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
    const { name, value } = e.target;
    
    if (name === 'biaya') {
      const formatted = formatNumber(value);
      setFormData({
        ...formData,
        [name]: formatted
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.motorId || !formData.tanggalService || !formData.jenisService) {
      toast.error('Mohon lengkapi data yang wajib diisi');
      return;
    }
    
    setLoading(true);
    
    try {
      const biayaNumber = parseNumber(formData.biaya);
      
      await addService({
        ...formData,
        biaya: biayaNumber,
        kilometer: parseInt(formData.kilometer) || 0
      });
      
      toast.success('Service berhasil dicatat!');
      setTimeout(() => {
        router.push(`/motors/${formData.motorId}`);
      }, 1500);
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Gagal mencatat service');
      setLoading(false);
    }
  }

  return (
    <main className="pb-24">
      <Toaster />
      
      <div className="bg-blue-600 text-white px-6 py-8 rounded-b-3xl">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Catat Service</h1>
            <p className="text-blue-100 text-sm">Tambahkan riwayat service baru</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-5">
          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Pilih Motor <span className="text-red-500">*</span>
            </label>
            <select
              name="motorId"
              value={formData.motorId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="">-- Pilih Motor --</option>
              {motors.map(motor => (
                <option key={motor.id} value={motor.id}>
                  {motor.nama} - {motor.merk} {motor.tipe}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Tanggal Service <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggalService"
              value={formData.tanggalService}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>
          
          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Jenis Service <span className="text-red-500">*</span>
            </label>
            <select
              name="jenisService"
              value={formData.jenisService}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="">-- Pilih Jenis Service --</option>
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
            <label className="block text-gray-800 font-semibold mb-2">
              Bengkel
            </label>
            <input
              type="text"
              name="bengkel"
              value={formData.bengkel}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-white"
              placeholder="Nama bengkel"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-800 font-semibold mb-2">
                Biaya (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                  Rp
                </span>
                <input
                  type="text"
                  name="biaya"
                  value={formData.biaya}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-white"
                  placeholder="0"
                  inputMode="numeric"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-800 font-semibold mb-2">
                Kilometer
              </label>
              <input
                type="number"
                name="kilometer"
                value={formData.kilometer}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Catatan
            </label>
            <textarea
              name="catatan"
              value={formData.catatan}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-white"
              placeholder="Catatan tambahan..."
            ></textarea>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Menyimpan...' : '💾 Simpan Service'}
          </button>
        </form>
      </div>

      <BottomNav />
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
