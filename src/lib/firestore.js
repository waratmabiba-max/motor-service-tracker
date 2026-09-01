import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { uploadStrukFoto } from './cloudinary';

// Helper untuk cek db
function checkDB() {
  if (!db) {
    throw new Error('Firebase belum diinisialisasi. Pastikan berjalan di client-side.');
  }
}

// ============ MOTOR OPERATIONS ============

// Get semua motor
export async function getMotors() {
  checkDB();
  try {
    const motorsCol = collection(db, 'motors');
    const motorSnapshot = await getDocs(motorsCol);
    const motorList = motorSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    }));
    return motorList;
  } catch (error) {
    console.error('Error in getMotors:', error);
    return [];
  }
}

// Get motor by ID
export async function getMotor(motorId) {
  checkDB();
  try {
    const motorRef = doc(db, 'motors', motorId);
    const motorSnap = await getDoc(motorRef);
    if (motorSnap.exists()) {
      return { 
        id: motorSnap.id, 
        ...motorSnap.data(),
        createdAt: motorSnap.data().createdAt?.toDate?.() || motorSnap.data().createdAt,
        updatedAt: motorSnap.data().updatedAt?.toDate?.() || motorSnap.data().updatedAt
      };
    }
    return null;
  } catch (error) {
    console.error('Error in getMotor:', error);
    return null;
  }
}

// Tambah motor baru
export async function addMotor(motorData) {
  checkDB();
  try {
    const motorsCol = collection(db, 'motors');
    const docRef = await addDoc(motorsCol, {
      ...motorData,
      kilometerTerakhir: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error in addMotor:', error);
    throw error;
  }
}

// Hapus motor dan semua service-nya
export async function deleteMotor(motorId) {
  checkDB();
  try {
    // 1. Hapus semua service milik motor ini
    const servicesCol = collection(db, 'services');
    const q = query(servicesCol, where('motorId', '==', motorId));
    const serviceSnapshot = await getDocs(q);
    
    const deletePromises = [];
    serviceSnapshot.docs.forEach(doc => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    
    // 2. Hapus motor
    const motorRef = doc(db, 'motors', motorId);
    await deleteDoc(motorRef);
    
    return true;
  } catch (error) {
    console.error('Error in deleteMotor:', error);
    throw error;
  }
}

// ============ SERVICE OPERATIONS ============

// Get riwayat service berdasarkan motor
export async function getServicesByMotor(motorId) {
  checkDB();
  try {
    const servicesCol = collection(db, 'services');
    const q = query(
      servicesCol, 
      where('motorId', '==', motorId),
      orderBy('tanggalService', 'desc')
    );
    
    const serviceSnapshot = await getDocs(q);
    const serviceList = serviceSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        tanggalService: data.tanggalService?.toDate?.() || data.tanggalService,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      };
    });
    
    return serviceList;
  } catch (error) {
    console.error('Error in getServicesByMotor:', error);
    return [];
  }
}

// Get semua service
export async function getAllServices() {
  checkDB();
  try {
    const servicesCol = collection(db, 'services');
    const serviceSnapshot = await getDocs(servicesCol);
    const serviceList = serviceSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        tanggalService: data.tanggalService?.toDate?.() || data.tanggalService,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      };
    });
    return serviceList;
  } catch (error) {
    console.error('Error in getAllServices:', error);
    return [];
  }
}

// Tambah service baru dengan foto struk
export async function addService(serviceData, fotoFile = null) {
  checkDB();
  try {
    let fotoStruk = null;
    
    // Upload foto ke Cloudinary jika ada
    if (fotoFile) {
      const uploadResult = await uploadStrukFoto(fotoFile);
      fotoStruk = uploadResult.url;
    }
    
    const servicesCol = collection(db, 'services');
    
    const docRef = await addDoc(servicesCol, {
      ...serviceData,
      biaya: parseFloat(serviceData.biaya) || 0,
      kilometer: parseInt(serviceData.kilometer) || 0,
      tanggalService: new Date(serviceData.tanggalService),
      fotoStruk: fotoStruk,
      createdAt: serverTimestamp()
    });
    
    if (serviceData.kilometer) {
      const motorRef = doc(db, 'motors', serviceData.motorId);
      await updateDoc(motorRef, {
        kilometerTerakhir: parseInt(serviceData.kilometer),
        updatedAt: serverTimestamp()
      });
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error in addService:', error);
    throw error;
  }
}

// Hapus single service
export async function deleteService(serviceId) {
  checkDB();
  try {
    const serviceRef = doc(db, 'services', serviceId);
    await deleteDoc(serviceRef);
    return true;
  } catch (error) {
    console.error('Error in deleteService:', error);
    throw error;
  }
}
