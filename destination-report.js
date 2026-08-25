import { collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';
import { db } from './firebase-config.js';

const $ = (id) => document.getElementById(id);

function money(n) {
  return Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function addStyles() {
  if (document.getElementById('destinationReportStyles')) return;
  const style = document.createElement('style');
  style.id = 'destinationReportStyles';
  style.textContent = `
    .destination-report{background:linear-gradient(135deg,#f8fcff,#f2f8fb);border:1px solid #cfe0ea!important}
    .destination-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .destination-controls{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:10px;align-items:end;margin-top:12px}
    .destination-result{margin-top:14px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
    .destination-kpi{background:#fff;border:1px solid #d8e5ec;border-radius:12px;padding:14px}
    .destination-kpi b{display:block;font-size:23px;margin-top:5px;color:#126da3}
    .destination-empty{margin-top:12px;padding:12px;border-radius:10px;background:#fff7df;border:1px solid #efd48b;color:#7a5200}
    @media(max-width:600px){.destination-controls,.destination-result{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}

function buildCard() {
  if ($('destinationReport')) return;
  const card = document.createElement('section');
  card.id = 'destinationReport';
  card.className = 'card destination-report';
  card.innerHTML = `
    <div class="destination-head">
      <div>
        <h2 style="margin:0">📍 สรุประยะทางตามสถานที่</h2>
        <div class="note" style="margin-top:5px">เลือกสถานที่เพื่อดูว่าตลอดทั้งเดือน รถทุกคันเดินทางไปที่นี่รวมกี่กิโลเมตร</div>
      </div>
    </div>
    <div class="destination-controls">
      <div>
        <label>สถานที่ไป</label>
        <select id="destinationSelect"><option value="">-- เลือกสถานที่ --</option></select>
      </div>
      <button class="btn primary" id="destinationLoad">🔎 ดูสรุป</button>
    </div>
    <div id="destinationStatus" class="note" style="margin-top:10px">เลือกเดือนด้านบน แล้วกดแสดงข้อมูลเพื่อโหลดรายการสถานที่</div>
    <div id="destinationResult" class="destination-result" style="display:none">
      <div class="destination-kpi">สถานที่<b id="destinationName">-</b></div>
      <div class="destination-kpi">ระยะทางรวมทุกคัน<b id="destinationKm">0 กม.</b></div>
      <div class="destination-kpi">จำนวนเที่ยว<b id="destinationTrips">0 เที่ยว</b></div>
    </div>`;
  const monthCard = $('month')?.closest('section.card');
  if (monthCard?.nextElementSibling) monthCard.parentNode.insertBefore(card, monthCard.nextElementSibling);
  else document.querySelector('.wrap')?.appendChild(card);
}

let rows = [];

async function loadDestinations() {
  const month = $('month')?.value;
  const select = $('destinationSelect');
  const status = $('destinationStatus');
  if (!month || !select) return;
  status.textContent = 'กำลังโหลดสถานที่...';
  try {
    const snap = await getDocs(query(collection(db, 'mileageRecords'), where('month', '==', month)));
    rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const names = [...new Set(rows.map(r => String(r.destination || '').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'th'));
    select.innerHTML = '<option value="">-- เลือกสถานที่ --</option>' + names.map(n => `<option value="${n.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')}">${n.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}</option>`).join('');
    status.textContent = names.length ? `พบ ${names.length.toLocaleString()} สถานที่ในเดือนนี้` : 'เดือนนี้ยังไม่มีข้อมูลสถานที่';
  } catch (e) {
    console.error(e);
    status.textContent = 'โหลดรายการสถานที่ไม่สำเร็จ: ' + e.message;
  }
}

function showDestination() {
  const name = $('destinationSelect')?.value;
  const result = $('destinationResult');
  if (!name) { result.style.display='none'; return; }
  const matched = rows.filter(r => String(r.destination || '').trim() === name);
  const km = matched.reduce((sum,r)=>sum + Number(r.distanceKm || (Number(r.odoIn||0)-Number(r.odoOut||0)) || 0),0);
  $('destinationName').textContent = name;
  $('destinationKm').textContent = money(km) + ' กม.';
  $('destinationTrips').textContent = matched.length.toLocaleString('th-TH') + ' เที่ยว';
  result.style.display='grid';
}

function init() {
  addStyles();
  buildCard();
  $('destinationLoad')?.addEventListener('click', showDestination);
  $('month')?.addEventListener('change', loadDestinations);
  $('load')?.addEventListener('click', () => setTimeout(loadDestinations, 100));
  loadDestinations();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
