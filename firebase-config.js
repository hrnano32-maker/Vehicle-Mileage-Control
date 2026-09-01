import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getFirestore, collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';
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

if (location.pathname.endsWith('/dashboard.html') || location.pathname.endsWith('dashboard.html')) {
  import('./destination-report.js').catch(err => console.error('Destination report module:', err));

  // หน้าสรุปรายงาน: ซ่อนคอลัมน์วันที่/เวลาเฉพาะบนหน้าจอ
  // ข้อมูลวันที่/เวลายังคงอยู่ใน currentRows และไม่กระทบฟังก์ชันดาวน์โหลด
  const hideReportDateTime = () => {
    const table = document.querySelector('.table table');
    if (!table) return false;

    table.querySelectorAll('tr').forEach(row => {
      const firstCell = row.children[0];
      if (firstCell) firstCell.style.display = 'none';
    });

    return true;
  };

  const waitForReportTable = () => {
    if (!hideReportDateTime()) {
      setTimeout(waitForReportTable, 100);
    }
  };

  waitForReportTable();

  const reportObserver = new MutationObserver(() => hideReportDateTime());
  reportObserver.observe(document.body, { childList: true, subtree: true });

  // ระบบยืนยันรหัสก่อนลบรายการเลขไมล์
  // ทำงานเฉพาะหน้า Dashboard และเฉพาะข้อความยืนยันการลบรายการเลขไมล์
  const nativeConfirm = window.confirm.bind(window);
  window.confirm = (message) => {
    const text = String(message ?? '');

    if (text.startsWith('ยืนยันลบรายการของ')) {
      const password = window.prompt('🔒 กรุณาใส่รหัสเพื่อยืนยันการลบ');

      if (password !== 'Tan128') {
        window.alert('❌ รหัสไม่ถูกต้อง ไม่สามารถลบรายการได้');
        return false;
      }
    }

    return nativeConfirm(message);
  };
}

// หน้า Employee: เลือกทะเบียนแล้วดึงเลขไมล์ขาเข้าล่าสุดของทะเบียนนั้น
// เพื่อกรอกเป็นเลขไมล์ขาออกอัตโนมัติสำหรับรายการถัดไป
if (location.pathname.endsWith('/employee.html') || location.pathname.endsWith('employee.html')) {
  const fillPreviousMileage = async () => {
    const plateEl = document.getElementById('plate');
    const outEl = document.getElementById('odoOut');
    if (!plateEl || !outEl || !plateEl.value) return;

    try {
      const snap = await getDocs(
        query(collection(db, 'mileageRecords'), where('plate', '==', plateEl.value))
      );

      let latest = null;
      for (const item of snap.docs) {
        const data = item.data();
        const odoIn = Number(data.odoIn);
        if (!Number.isFinite(odoIn)) continue;

        let submitted = 0;
        if (data.clientSubmittedAt) submitted = Date.parse(data.clientSubmittedAt) || 0;
        if (!submitted && data.submittedAt?.seconds) submitted = data.submittedAt.seconds * 1000;

        if (!latest || submitted > latest.submitted) {
          latest = { odoIn, submitted };
        }
      }

      if (latest) {
        outEl.value = latest.odoIn;
        outEl.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        outEl.value = '';
      }
    } catch (err) {
      console.warn('ไม่สามารถดึงเลขไมล์ขาเข้าล่าสุดของรถได้:', err);
    }
  };

  const attachMileageAutoFill = () => {
    const plateEl = document.getElementById('plate');
    if (!plateEl) return setTimeout(attachMileageAutoFill, 50);
    plateEl.addEventListener('change', fillPreviousMileage);
  };

  attachMileageAutoFill();
}
