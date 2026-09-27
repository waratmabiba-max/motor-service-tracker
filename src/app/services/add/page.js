'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getMotors, addService } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { formatNumber, parseNumber } from '@/utils/formatRupiah';

const PILIHAN_SERVICE = [
  'Ganti Oli',
  'Servis Rutin',
  'Servis Besar',
  'Ganti Ban',
  'Ganti Aki',
  'Ganti Kampas Rem',
  'Ganti Busi',
  'Ganti Filter Udara',
  'Ganti V-belt/CVT',
  'Perbaikan',
  'Lainnya'
];

function AddServiceForm() {
  const searchParams = useSearchParams();
  const motorId = searchParams.get('motorId');
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  const [motors, setMotors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [jenisServiceDipilih, setJenisServiceDipilih] = useState([]);
  const [formData, setFormData] = useState({
    motorId: motorId || '',
    tanggalService: new Date().toISOString().split('T')[0],
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

  function toggleJenisService(jenis) {
    setJenisServiceDipilih(prev => {
      if (prev.includes(jenis)) {
        return prev.filter(j => j !== jenis);
      } else {
        return [...prev, jenis];
      }
    });
  }

  function handleFotoChange(e) {
    const file = e.target.files[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }
    
    setFotoFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function hapusFoto() {
    setFotoFile(null);
    setFotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.motorId || !formData.tanggalService) {
      toast.error('Mohon lengkapi data yang wajib diisi');
      return;
    }
    
    if (jenisServiceDipilih.length === 0) {
      toast.error('Pilih minimal satu jenis service');
      return;
    }
    
    setLoading(true);
    
    try {
      const biayaNumber = parseNumber(formData.biaya);
      
      await addService(
        {
          ...formData,
          jenisService: jenisServiceDipilih,  // Simpan sebagai array
          biaya: biayaNumber,
          kilometer: parseInt(formData.kilometer) || 0
        },
        fotoFile
      );
      
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
            <p className="text-blue-50 text-sm font-medium">Tambahkan riwayat service baru</p>
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
          
          {/* Multi-select Jenis Service */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Jenis Service <span className="text-red-500">*</span>
              <span className="text-xs text-gray-600 font-normal ml-2">
                (bisa pilih lebih dari satu)
              </span>
            </label>
            
            {jenisServiceDipilih.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {jenisServiceDipilih.map(jenis => (
                  <span 
                    key={jenis}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                  >
                    {jenis}
                    <button
                      type="button"
                      onClick={() => toggleJenisService(jenis)}
                      className="text-blue-800 hover:text-blue-900"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              {PILIHAN_SERVICE.map(jenis => {
                const isSelected = jenisServiceDipilih.includes(jenis);
                return (
                  <button
                    key={jenis}
                    type="button"
                    onClick={() => toggleJenisService(jenis)}
                    className={`px-3 py-3 rounded-lg border-2 text-sm font-semibold transition text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-800 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-400'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs leading-tight">{jenis}</span>
                    </div>
                  </button>
                );
              })}
            </div>
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
              Foto Struk/Nota
            </label>
            
            {fotoPreview ? (
              <div className="relative">
                <img 
                  src={fotoPreview} 
                  alt="Preview struk" 
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={hapusFoto}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition"
              >
                <div className="text-4xl mb-2">📄</div>
                <p className="text-gray-700 font-semibold">Klik untuk upload foto struk</p>
                <p className="text-xs text-gray-700 mt-1">JPG, PNG, atau JPEG (max 5MB)</p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="hidden"
            />
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
