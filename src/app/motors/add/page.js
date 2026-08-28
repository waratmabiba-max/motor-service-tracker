'use client';

import { useState } from 'react';
import { addMotor } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default function AddMotor() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: '',
    merk: '',
    tipe: '',
    tahun: new Date().getFullYear(),
    platNomor: ''
  });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      await addMotor({
        ...formData,
        tahun: parseInt(formData.tahun)
      });
      
      toast.success('Motor berhasil ditambahkan!');
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      console.error('Error adding motor:', error);
      toast.error('Gagal menambahkan motor');
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <Toaster />
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Kembali
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">Tambah Motor Baru</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Nama Motor *</label>
          <input
            type="text"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Contoh: Motor Harian"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Merk *</label>
          <input
            type="text"
            name="merk"
            value={formData.merk}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Contoh: Honda"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Tipe *</label>
          <input
            type="text"
            name="tipe"
            value={formData.tipe}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Contoh: Vario 150"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Tahun</label>
            <input
              type="number"
              name="tahun"
              value={formData.tahun}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              min="1990"
              max="2026"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Plat Nomor</label>
            <input
              type="text"
              name="platNomor"
              value={formData.platNomor}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="B 1234 XYZ"
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Simpan Motor
        </button>
      </form>
    </main>
  );
}
