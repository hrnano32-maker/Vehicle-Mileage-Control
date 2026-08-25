import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyCP-DLzpwuErHjXOOE9zhPptJX6a_uHcMU",
  authDomain: "vehicle-mileage-control-dl.firebaseapp.com",
  projectId: "vehicle-mileage-control-dl",
  storageBucket: "vehicle-mileage-control-dl.firebasestorage.app",
  messagingSenderId: "464190811569",
  appId: "1:464190811569:web:f115ca22e07dc2761f2190",
  measurementId: "G-FB8QGYYN50"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };

// โหลดฟังก์ชันสรุประยะทางตามสถานที่เฉพาะหน้า Dashboard
if (location.pathname.endsWith('/dashboard.html') || location.pathname.endsWith('dashboard.html')) {
  import('./destination-report.js').catch(err => console.error('Destination report module:', err));
}
