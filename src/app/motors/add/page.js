'use client';

import { useState } from 'react';
import { addMotor } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

export default function AddMotor() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: '',
    merk: '',
    tipe: '',
    tahun: new Date().getFullYear(),
    platNomor: ''
  });
  const [loading, setLoading] = useState(false);

    function handleChange(e) {
    const { name, value } = e.target;
    
    // Auto kapital untuk plat nomor
    if (name === 'platNomor') {
      setFormData({
        ...formData,
        [name]: value.toUpperCase()
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
    
    if (!formData.nama || !formData.merk || !formData.tipe) {
      toast.error('Mohon lengkapi data yang wajib diisi');
      return;
    }
    
    setLoading(true);
    
    try {
      await addMotor({
        ...formData,
        tahun: parseInt(formData.tahun)
      });
      
      toast.success('Motor berhasil ditambahkan!');
      setTimeout(() => {
        router.push('/motors');
      }, 1500);
    } catch (error) {
      console.error('Error adding motor:', error);
      toast.error('Gagal menambahkan motor');
      setLoading(false);
    }
  }

  return (
    <main className="pb-24">
      <Toaster />
      
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-8 rounded-b-3xl">
        <div className="flex items-center gap-4">
          <Link href="/motors" className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Tambah Motor</h1>
            <p className="text-blue-100 text-sm">Daftarkan motor baru Anda</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 mt-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Nama Motor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Motor Harian"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Merk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="merk"
              value={formData.merk}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Honda"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Tipe <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="tipe"
              value={formData.tipe}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Vario 150"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Tahun
              </label>
              <input
                type="number"
                name="tahun"
                value={formData.tahun}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1990"
                max="2026"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Plat Nomor
              </label>
             <input
                type="text"
                name="platNomor"
                value={formData.platNomor}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="B 1234 XYZ"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Menyimpan...' : '💾 Simpan Motor'}
          </button>
        </form>
      </div>

      <BottomNav />
    </main>
  );
}
