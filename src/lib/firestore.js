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

function checkDB() {
  if (!db) {
    throw new Error('Firebase belum diinisialisasi.');
  }
}

// ============ MOTOR OPERATIONS ============

export async function getMotors() {
  checkDB();
  try {
    const motorsCol = collection(db, 'motors');
    const motorSnapshot = await getDocs(motorsCol);
    return motorSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    }));
  } catch (error) {
    console.error('Error in getMotors:', error);
    return [];
  }
}

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
    
    // Init komponen default, tapi jangan gagalkan addMotor jika error
    try {
      await initKomponenDefault(docRef.id);
    } catch (komponenError) {
      console.error('Motor berhasil dibuat, tapi gagal init komponen:', komponenError);
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error in addMotor:', error);
    throw error;
  }
}

export async function updateKilometer(motorId, kilometerBaru) {
  checkDB();
  try {
    const motorRef = doc(db, 'motors', motorId);
    await updateDoc(motorRef, {
      kilometerTerakhir: parseInt(kilometerBaru),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error in updateKilometer:', error);
    throw error;
  }
}

export async function deleteMotor(motorId) {
  checkDB();
  try {
    // Hapus semua service
    const servicesCol = collection(db, 'services');
    const q = query(servicesCol, where('motorId', '==', motorId));
    const serviceSnapshot = await getDocs(q);
    await Promise.all(serviceSnapshot.docs.map(d => deleteDoc(d.ref)));
    
    // Hapus semua komponen
    const komponenCol = collection(db, 'motors', motorId, 'komponen');
    const komponenSnapshot = await getDocs(komponenCol);
    await Promise.all(komponenSnapshot.docs.map(d => deleteDoc(d.ref)));
    
    // Hapus motor
    await deleteDoc(doc(db, 'motors', motorId));
    return true;
  } catch (error) {
    console.error('Error in deleteMotor:', error);
    throw error;
  }
}

// ============ KOMPONEN OPERATIONS ============

export async function initKomponenDefault(motorId) {
  checkDB();
  const komponenDefault = [
    { nama: 'Oli Mesin', intervalKm: 2500, intervalBulan: 2 },
    { nama: 'Oli Gardan', intervalKm: 8000, intervalBulan: 8 },
    { nama: 'Busi', intervalKm: 6000, intervalBulan: 6 },
    { nama: 'Filter Udara', intervalKm: 5000, intervalBulan: 5 },
    { nama: 'Kampas Rem Depan', intervalKm: 10000, intervalBulan: 12 },
    { nama: 'Kampas Rem Belakang', intervalKm: 8000, intervalBulan: 10 },
    { nama: 'Ban Depan', intervalKm: 15000, intervalBulan: 18 },
    { nama: 'Ban Belakang', intervalKm: 10000, intervalBulan: 12 },
    { nama: 'Aki', intervalKm: 20000, intervalBulan: 24 },
    { nama: 'CVT/V-belt', intervalKm: 25000, intervalBulan: 24 }
  ];

  try {
    const komponenCol = collection(db, 'motors', motorId, 'komponen');
    const promises = komponenDefault.map(komp => addDoc(komponenCol, {
      ...komp,
      kmTerakhirGanti: 0,
      tanggalTerakhirGanti: null
    }));
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Error in initKomponenDefault:', error);
    throw error;
  }
}

export async function getKomponenMotor(motorId) {
  checkDB();
  try {
    const komponenCol = collection(db, 'motors', motorId, 'komponen');
    const snapshot = await getDocs(komponenCol);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      tanggalTerakhirGanti: doc.data().tanggalTerakhirGanti?.toDate?.() || doc.data().tanggalTerakhirGanti
    }));
  } catch (error) {
    console.error('Error in getKomponenMotor:', error);
    return [];
  }
}

export async function addKomponen(motorId, data) {
  checkDB();
  try {
    const komponenCol = collection(db, 'motors', motorId, 'komponen');
    await addDoc(komponenCol, {
      ...data,
      kmTerakhirGanti: 0,
      tanggalTerakhirGanti: null
    });
    return true;
  } catch (error) {
    console.error('Error in addKomponen:', error);
    throw error;
  }
}

export async function updateKomponen(motorId, komponenId, data) {
  checkDB();
  try {
    const komponenRef = doc(db, 'motors', motorId, 'komponen', komponenId);
    await updateDoc(komponenRef, data);
    return true;
  } catch (error) {
    console.error('Error in updateKomponen:', error);
    throw error;
  }
}

export async function deleteKomponen(motorId, komponenId) {
  checkDB();
  try {
    const komponenRef = doc(db, 'motors', motorId, 'komponen', komponenId);
    await deleteDoc(komponenRef);
    return true;
  } catch (error) {
    console.error('Error in deleteKomponen:', error);
    throw error;
  }
}

// ============ SERVICE OPERATIONS ============

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
    return serviceSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        tanggalService: data.tanggalService?.toDate?.() || data.tanggalService,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      };
    });
  } catch (error) {
    console.error('Error in getServicesByMotor:', error);
    return [];
  }
}

export async function getAllServices() {
  checkDB();
  try {
    const servicesCol = collection(db, 'services');
    const serviceSnapshot = await getDocs(servicesCol);
    return serviceSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        tanggalService: data.tanggalService?.toDate?.() || data.tanggalService,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      };
    });
  } catch (error) {
    console.error('Error in getAllServices:', error);
    return [];
  }
}

export async function addService(serviceData, fotoFile = null) {
  checkDB();
  try {
    let fotoStruk = null;
    
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
