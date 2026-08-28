import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Helper untuk cek db
function checkDB() {
  if (!db) {
    throw new Error('Firebase belum diinisialisasi. Pastikan berjalan di client-side.');
  }
}

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
    return []; // Return empty array instead of throwing
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
    return []; // Return empty array
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

// Tambah service baru
export async function addService(serviceData) {
  checkDB();
  try {
    const servicesCol = collection(db, 'services');
    
    const docRef = await addDoc(servicesCol, {
      ...serviceData,
      biaya: parseFloat(serviceData.biaya) || 0,
      kilometer: parseInt(serviceData.kilometer) || 0,
      tanggalService: new Date(serviceData.tanggalService),
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
