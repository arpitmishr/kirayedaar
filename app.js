// ============================================================================
// 1. FIREBASE CONFIGURATION & INITIALIZATION (v10 Modular)
// ============================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

// !!! PASTE YOUR FIREBASE CONFIG HERE !!!
const firebaseConfig = {
    apiKey: "AIzaSyB-dS8rEXwAwfdpXQhwhLNhsQYq6ug3XWA",
    authDomain: "tenant-75f84.firebaseapp.com",
    projectId: "tenant-75f84",
    storageBucket: "tenant-75f84.firebasestorage.app",
    messagingSenderId: "882401370229",
    appId: "1:882401370229:web:85d5c82cf49c7e1c8dd83c"
};

// Auto-Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ============================================================================
// 2. GLOBAL STATE & SYSTEM UTILS
// ============================================================================
const state = { rooms: [], tenants: [], rent: [], charts: {} };
const ui = {
    spinner: document.getElementById('spinner'),
    toast: new bootstrap.Toast(document.getElementById('systemToast')),
    modals: {
        room: new bootstrap.Modal(document.getElementById('modalRoom')),
        tenant: new bootstrap.Modal(document.getElementById('modalTenant')),
        rent: new bootstrap.Modal(document.getElementById('modalRent'))
    }
};

const toggleLoader = (show) => ui.spinner.classList.toggle('d-none', !show);
const showToast = (msg, type = 'success') => {
    const toastEl = document.getElementById('systemToast');
    toastEl.className = `toast text-white border-0 bg-${type}`;
    document.getElementById('toastMsg').innerText = msg;
    ui.toast.show();
};
const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

// ============================================================================
// 3. SPA ROUTER
// ============================================================================
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.currentTarget.dataset.target;
        
        // UI Updates
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.querySelectorAll('.app-view').forEach(v => v.classList.add('d-none'));
        document.getElementById(`view-${target}`).classList.remove('d-none');
        document.getElementById('topbar-title').innerText = e.currentTarget.innerText;
        
        // Mobile Sidebar Auto-Close
        document.getElementById('sidebar').classList.remove('show');
    });
});

// ============================================================================
// 4. DATA LISTENERS (Real-time Firestore)
// ============================================================================
function initDataListeners() {
    toggleLoader(true);
    let loaded = 0;
    const checkReady = () => { if (++loaded === 3) { toggleLoader(false); updateDashboard(); }};

    onSnapshot(collection(db, "rooms"), (snap) => {
        state.rooms = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderRooms(); checkReady();
    }, (e) => showToast("Error loading rooms", "danger"));

    onSnapshot(collection(db, "tenants"), (snap) => {
        state.tenants = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderTenants(); updateRoomDropdowns(); checkReady();
    }, (e) => showToast("Error loading tenants", "danger"));

    onSnapshot(collection(db, "rent"), (snap) => {
        state.rent = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderRent(); checkReady();
    }, (e) => showToast("Error loading rent", "danger"));
}

// ============================================================================
// 5. DASHBOARD & CHARTS MODULE
// ============================================================================
function updateDashboard() {
    // Stat Cards
    document.getElementById('dash-rooms').innerText = state.rooms.length;
    document.getElementById('dash-occupied').innerText = state.rooms.filter(r => r.status === 'Occupied').length;
    document.getElementById('dash-tenants').innerText = state.tenants.filter(t => t.status === 'Active').length;
    
    const rentCollected = state.rent.reduce((sum, r) => sum + Number(r.amount), 0);
    document.getElementById('dash-rent-pending').innerText = `₹${rentCollected}`; // Using as 'Collected' for now

    // Occupancy Chart
    const occCtx = document.getElementById('chartOccupancy').getContext('2d');
    if(state.charts.occ) state.charts.occ.destroy();
    const vacantCount = state.rooms.filter(r => r.status === 'Vacant').length;
    const occCount = state.rooms.filter(r => r.status === 'Occupied').length;
    state.charts.occ = new Chart(occCtx, {
        type: 'doughnut',
        data: { labels: ['Occupied', 'Vacant', 'Maintenance'], datasets: [{ data: [occCount, vacantCount, state.rooms.length - (occCount+vacantCount)], backgroundColor: ['#198754', '#0d6efd', '#ffc107'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Rent Chart (Mocked monthly logic for brevity)
    const rentCtx = document.getElementById('chartRent').getContext('2d');
    if(state.charts.rent) state.charts.rent.destroy();
    state.charts.rent = new Chart(rentCtx, {
        type: 'bar',
        data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], datasets: [{ label: 'Rent Collection (₹)', data: [15000, 25000, 20000, 30000, rentCollected], backgroundColor: '#0d6efd' }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// ============================================================================
// 6. ROOM MANAGEMENT MODULE
// ============================================================================
window.openRoomModal = (id = null) => {
    document.getElementById('formRoom').reset();
    if (id) {
        const r = state.rooms.find(x => x.id === id);
        document.getElementById('room_id').value = r.id;
        document.getElementById('room_number').value = r.number;
        document.getElementById('room_floor').value = r.floor;
        document.getElementById('room_type').value = r.type;
        document.getElementById('room_rent').value = r.rent;
        document.getElementById('room_occupancy').value = r.occupancy;
        document.getElementById('room_meter').value = r.meter;
        document.getElementById('room_status').value = r.status;
        document.getElementById('modalRoomTitle').innerText = 'Edit Room';
    } else {
        document.getElementById('room_id').value = '';
        document.getElementById('modalRoomTitle').innerText = 'Add Room';
    }
    ui.modals.room.show();
};

document.getElementById('formRoom').addEventListener('submit', async (e) => {
    e.preventDefault();
    toggleLoader(true);
    const id = document.getElementById('room_id').value;
    const data = {
        number: document.getElementById('room_number').value,
        floor: document.getElementById('room_floor').value,
        type: document.getElementById('room_type').value,
        rent: Number(document.getElementById('room_rent').value),
        occupancy: Number(document.getElementById('room_occupancy').value),
        meter: document.getElementById('room_meter').value,
        status: document.getElementById('room_status').value,
        updatedAt: new Date().toISOString()
    };
    try {
        if (id) await updateDoc(doc(db, "rooms", id), data);
        else await addDoc(collection(db, "rooms"), { ...data, createdAt: new Date().toISOString() });
        showToast(`Room ${id ? 'updated' : 'added'} successfully.`);
        ui.modals.room.hide();
    } catch (err) { showToast(err.message, "danger"); }
    toggleLoader(false);
});

function renderRooms() {
    const tbody = document.getElementById('table-rooms');
    tbody.innerHTML = state.rooms.map(r => `
        <tr>
            <td class="fw-bold">${r.number}</td><td>${r.type}</td><td>${r.floor}</td><td>₹${r.rent}</td><td>${r.occupancy}</td>
            <td><span class="badge bg-${r.status==='Vacant'?'primary':r.status==='Occupied'?'success':'warning text-dark'}">${r.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="openRoomModal('${r.id}')"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteRecord('rooms', '${r.id}')"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('') || `<tr><td colspan="7" class="text-center text-muted py-3">No rooms found</td></tr>`;
}

// ============================================================================
// 7. TENANT & PHOTO MANAGEMENT MODULE (With Auto-Compress)
// ============================================================================
let tempPhotoBase64 = null;

// Image Compression Algorithm (< 200KB)
document.getElementById('tenant_photo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 500; // Resize to ensure small file
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // Compress heavily
            tempPhotoBase64 = canvas.toDataURL('image/jpeg', 0.6); 
            document.getElementById('tenant_photo_preview').src = tempPhotoBase64;
            showToast("Photo processed & compressed.", "success");
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

function updateRoomDropdowns() {
    const selects = [document.getElementById('tenant_room')];
    selects.forEach(select => {
        if(!select) return;
        select.innerHTML = '<option value="">Select Room...</option>' + 
            state.rooms.map(r => `<option value="${r.id}">${r.number} (${r.status})</option>`).join('');
    });
}

window.openTenantModal = (id = null) => {
    document.getElementById('formTenant').reset();
    tempPhotoBase64 = null;
    document.getElementById('tenant_photo_preview').src = "https://via.placeholder.com/100";
    if (id) {
        const t = state.tenants.find(x => x.id === id);
        document.getElementById('tenant_id').value = t.id;
        document.getElementById('tenant_name').value = t.name;
        document.getElementById('tenant_phone').value = t.phone;
        document.getElementById('tenant_aadhar').value = t.aadhar;
        document.getElementById('tenant_room').value = t.roomId;
        document.getElementById('tenant_join_date').value = t.joinDate;
        document.getElementById('tenant_deposit').value = t.deposit;
        document.getElementById('tenant_status').value = t.status;
        if(t.photoUrl) document.getElementById('tenant_photo_preview').src = t.photoUrl;
        
        // Docs
        document.getElementById('doc_aadhar').checked = t.docs?.aadhar || false;
        document.getElementById('doc_pan').checked = t.docs?.pan || false;
        document.getElementById('doc_agreement').checked = t.docs?.agreement || false;
        document.getElementById('doc_police').checked = t.docs?.police || false;
    } else {
        document.getElementById('tenant_id').value = '';
    }
    ui.modals.tenant.show();
};

document.getElementById('formTenant').addEventListener('submit', async (e) => {
    e.preventDefault();
    toggleLoader(true);
    const id = document.getElementById('tenant_id').value;
    const roomId = document.getElementById('tenant_room').value;
    
    let photoUrl = document.getElementById('tenant_photo_preview').src;
    
    try {
        // Handle Firebase Storage Upload if new photo selected
        if(tempPhotoBase64) {
            const storageRef = ref(storage, `tenants/${Date.now()}_photo.jpg`);
            await uploadString(storageRef, tempPhotoBase64, 'data_url');
            photoUrl = await getDownloadURL(storageRef);
        }

        const data = {
            name: document.getElementById('tenant_name').value,
            phone: document.getElementById('tenant_phone').value,
            aadhar: document.getElementById('tenant_aadhar').value,
            roomId: roomId,
            joinDate: document.getElementById('tenant_join_date').value,
            deposit: Number(document.getElementById('tenant_deposit').value),
            status: document.getElementById('tenant_status').value,
            photoUrl: photoUrl.startsWith('http') ? photoUrl : null,
            docs: {
                aadhar: document.getElementById('doc_aadhar').checked,
                pan: document.getElementById('doc_pan').checked,
                agreement: document.getElementById('doc_agreement').checked,
                police: document.getElementById('doc_police').checked
            },
            updatedAt: new Date().toISOString()
        };

        if (id) await updateDoc(doc(db, "tenants", id), data);
        else await addDoc(collection(db, "tenants"), { ...data, createdAt: new Date().toISOString() });

        // Auto Room Occupancy Logic
        if(roomId && data.status === 'Active') {
            await updateDoc(doc(db, "rooms", roomId), { status: 'Occupied' });
        } else if (data.status === 'Left' && roomId) {
            await updateDoc(doc(db, "rooms", roomId), { status: 'Vacant' });
        }

        showToast(`Tenant saved successfully.`);
        ui.modals.tenant.hide();
    } catch (err) { showToast(err.message, "danger"); }
    toggleLoader(false);
});

function renderTenants() {
    const tbody = document.getElementById('table-tenants');
    tbody.innerHTML = state.tenants.map(t => {
        const room = state.rooms.find(r => r.id === t.roomId);
        const docsObj = t.docs || {};
        const docCount = Object.values(docsObj).filter(v => v).length;
        const docPercent = (docCount / 4) * 100;
        const docColor = docPercent === 100 ? 'success' : docPercent > 0 ? 'warning' : 'danger';
        
        return `<tr>
            <td><img src="${t.photoUrl || 'https://via.placeholder.com/40'}" class="rounded-circle" width="40" height="40" style="object-fit:cover"></td>
            <td class="fw-bold">${t.name}</td>
            <td>${room ? room.number : 'Unassigned'}</td>
            <td>${t.phone}</td>
            <td>
                <div class="progress" style="height: 10px; width: 60px;">
                    <div class="progress-bar bg-${docColor}" style="width: ${docPercent}%"></div>
                </div>
            </td>
            <td><span class="badge bg-${t.status==='Active'?'success':t.status==='Notice Period'?'warning text-dark':'secondary'}">${t.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="openTenantModal('${t.id}')"><i class="bi bi-pencil"></i></button>
            </td>
        </tr>`;
    }).join('') || `<tr><td colspan="7" class="text-center text-muted py-3">No tenants found</td></tr>`;
    
    // Update Rent Dropdown
    const rt = document.getElementById('rent_tenant');
    rt.innerHTML = '<option value="">Select Tenant...</option>' + 
        state.tenants.filter(t => t.status === 'Active').map(t => `<option value="${t.id}">${t.name} (Room ${state.rooms.find(r=>r.id==t.roomId)?.number || 'N/A'})</option>`).join('');
}

// ============================================================================
// 8. RENT COLLECTION & RECEIPT MODULE
// ============================================================================
window.openRentModal = () => {
    document.getElementById('formRent').reset();
    document.getElementById('rent_date').valueAsDate = new Date();
    ui.modals.rent.show();
};

document.getElementById('formRent').addEventListener('submit', async (e) => {
    e.preventDefault();
    toggleLoader(true);
    const tenantId = document.getElementById('rent_tenant').value;
    const tenant = state.tenants.find(t => t.id === tenantId);
    
    const data = {
        tenantId: tenantId,
        roomId: tenant.roomId,
        amount: Number(document.getElementById('rent_amount').value),
        mode: document.getElementById('rent_mode').value,
        date: document.getElementById('rent_date').value,
        status: document.getElementById('rent_status').value,
        timestamp: new Date().toISOString()
    };

    try {
        const docRef = await addDoc(collection(db, "rent"), data);
        showToast("Rent recorded successfully.");
        ui.modals.rent.hide();
        // Generate PDF Receipt immediately
        generateReceipt(data, tenant.name, state.rooms.find(r=>r.id==tenant.roomId)?.number || 'N/A', docRef.id);
    } catch (err) { showToast(err.message, "danger"); }
    toggleLoader(false);
});

function renderRent() {
    const tbody = document.getElementById('table-rent');
    // Sort descending by date
    const sortedRent = [...state.rent].sort((a,b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sortedRent.map(r => {
        const tenant = state.tenants.find(t => t.id === r.tenantId);
        const room = state.rooms.find(rm => rm.id === r.roomId);
        return `<tr>
            <td>${formatDate(r.date)}</td>
            <td class="fw-bold">${tenant ? tenant.name : 'Unknown'}</td>
            <td>${room ? room.number : 'N/A'}</td>
            <td class="text-success fw-bold">₹${r.amount}</td>
            <td><span class="badge bg-secondary">${r.mode}</span></td>
            <td><span class="badge bg-${r.status==='Paid'?'success':'warning text-dark'}">${r.status}</span></td>
            <td><button class="btn btn-sm btn-outline-danger" onclick="deleteRecord('rent', '${r.id}')"><i class="bi bi-trash"></i></button></td>
        </tr>`;
    }).join('') || `<tr><td colspan="7" class="text-center text-muted py-3">No rent records found</td></tr>`;
}

function generateReceipt(rentData, tName, rNumber, recId) {
    document.getElementById('rec_no').innerText = recId.substring(0,8).toUpperCase();
    document.getElementById('rec_date').innerText = formatDate(rentData.date);
    document.getElementById('rec_tenant').innerText = tName;
    document.getElementById('rec_room').innerText = rNumber;
    document.getElementById('rec_amount').innerText = rentData.amount;
    document.getElementById('rec_mode').innerText = rentData.mode;

    const template = document.getElementById('receiptTemplate');
    template.classList.remove('d-none');
    
    // Use html2pdf
    html2pdf().from(template).set({
        margin: 1,
        filename: `Receipt_${tName}_${rentData.date}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).save().then(() => template.classList.add('d-none'));
}

// ============================================================================
// 9. EXPORTS & BACKUP SYSTEM
// ============================================================================
window.exportData = (collectionName, type) => {
    let data = state[collectionName];
    if(data.length === 0) { showToast("No data to export", "warning"); return; }
    
    if(type === 'excel') {
        // Format data
        const ws = XLSX.utils.json_to_sheet(data.map(d => {
            let row = {...d}; 
            delete row.id; delete row.photoUrl; // clean up
            if(row.docs) row.docs = JSON.stringify(row.docs);
            return row;
        }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, collectionName);
        XLSX.writeFile(wb, `${collectionName}_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    } else if (type === 'pdf') {
        const element = document.createElement('div');
        element.innerHTML = `<h2>${collectionName.toUpperCase()} REPORT</h2><br>
        <table border="1" style="width:100%;text-align:left;border-collapse:collapse;">
            <tr>${Object.keys(data[0]).filter(k=>k!=='id'&&k!=='photoUrl').map(k=>`<th>${k}</th>`).join('')}</tr>
            ${data.map(row => `<tr>${Object.keys(row).filter(k=>k!=='id'&&k!=='photoUrl').map(k=>`<td>${typeof row[k]==='object'?JSON.stringify(row[k]):row[k]}</td>`).join('')}</tr>`).join('')}
        </table>`;
        html2pdf().from(element).save(`${collectionName}_report.pdf`);
    }
};

window.exportBackupJSON = () => {
    const backup = { rooms: state.rooms, tenants: state.tenants, rent: state.rent, timestamp: new Date().toISOString() };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `TMS_Backup_${Date.now()}.json`);
    dlAnchorElem.click();
    showToast("Backup Downloaded");
};

// ============================================================================
// 10. SYSTEM UTILS (Delete, Theme)
// ============================================================================
window.deleteRecord = async (collectionName, id) => {
    if(confirm("Are you sure you want to delete this record permanently?")) {
        toggleLoader(true);
        try {
            await deleteDoc(doc(db, collectionName, id));
            showToast("Record deleted.");
        } catch(e) { showToast(e.message, "danger"); }
        toggleLoader(false);
    }
};

document.getElementById('btn-theme-toggle').addEventListener('click', () => {
    const html = document.documentElement;
    const isLight = html.getAttribute('data-bs-theme') === 'light';
    html.setAttribute('data-bs-theme', isLight ? 'dark' : 'light');
    document.getElementById('btn-theme-toggle').innerHTML = isLight ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon"></i>';
});

// Boot App
document.addEventListener('DOMContentLoaded', () => {
    initDataListeners();
});
