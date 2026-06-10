// ============================================================================
// 1. FIREBASE CONFIGURATION & INITIALIZATION
// ============================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
// IMPORT AUTHENTICATION
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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
const auth = getAuth(app); // Init Auth

// ============================================================================
// 2. AUTHENTICATION SYSTEM & STATE
// ============================================================================
const state = { rooms: [], tenants: [], rent: [], charts: {}, unsubscribeFuncs: [] };
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
    document.getElementById('systemToast').className = `toast text-white border-0 bg-${type}`;
    document.getElementById('toastMsg').innerText = msg;
    ui.toast.show();
};

// Monitor Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in
        document.getElementById('view-login').classList.add('d-none');
        document.getElementById('main-app').classList.remove('d-none');
        document.getElementById('user-email-display').innerText = user.email;
        initDataListeners(); // Load database ONLY after successful login
    } else {
        // User is logged out
        document.getElementById('view-login').classList.remove('d-none');
        document.getElementById('main-app').classList.add('d-none');
        
        // Stop listening to database to prevent permission errors
        state.unsubscribeFuncs.forEach(unsub => unsub());
        state.unsubscribeFuncs = [];
    }
    toggleLoader(false);
});

// Login Form Submit
document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
    toggleLoader(true);
    const email = document.getElementById('login_email').value;
    const pass = document.getElementById('login_password').value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        showToast("Login Successful!", "success");
    } catch (error) {
        toggleLoader(false);
        showToast("Login Failed: " + error.message, "danger");
    }
});

// Logout Button
document.getElementById('btn-logout').addEventListener('click', () => {
    signOut(auth);
});

// ============================================================================
// 3. SPA ROUTER
// ============================================================================
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.currentTarget.dataset.target;
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.querySelectorAll('.app-view').forEach(v => v.classList.add('d-none'));
        document.getElementById(`view-${target}`).classList.remove('d-none');
        document.getElementById('topbar-title').innerText = e.currentTarget.innerText;
        document.getElementById('sidebar').classList.remove('show');
    });
});

// ============================================================================
// 4. DATA LISTENERS (Real-time Firestore)
// ============================================================================
function initDataListeners() {
    toggleLoader(true);
    
    try {
        // Listen to Rooms
        const unsubRooms = onSnapshot(collection(db, "rooms"), (snap) => {
            state.rooms = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            renderRooms(); updateDashboard();
        }, (err) => {
            console.error(err);
            if(err.code === 'permission-denied') showToast("Permission denied. Check Firestore Rules.", "danger");
            else if(err.message.includes('404')) showToast("Database not found! Please Create Firestore Database in Firebase Console.", "danger");
            else showToast("Error loading rooms", "danger");
        });

        // Listen to Tenants
        const unsubTenants = onSnapshot(collection(db, "tenants"), (snap) => {
            state.tenants = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            renderTenants(); updateDashboard(); updateRoomDropdowns();
        });

        // Listen to Rent
        const unsubRent = onSnapshot(collection(db, "rent"), (snap) => {
            state.rent = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            renderRent(); updateDashboard();
        });

        state.unsubscribeFuncs.push(unsubRooms, unsubTenants, unsubRent);
        
        // Wait briefly for data to settle, then hide loader
        setTimeout(() => toggleLoader(false), 1000);

    } catch (error) {
        toggleLoader(false);
        console.error("Initialization error:", error);
    }
}

// ============================================================================
// 5. DASHBOARD MODULE
// ============================================================================
function updateDashboard() {
    document.getElementById('dash-rooms').innerText = state.rooms.length;
    document.getElementById('dash-occupied').innerText = state.rooms.filter(r => r.status === 'Occupied').length;
    document.getElementById('dash-tenants').innerText = state.tenants.filter(t => t.status === 'Active').length;
    
    const rentCollected = state.rent.reduce((sum, r) => sum + Number(r.amount), 0);
    document.getElementById('dash-rent-pending').innerText = `₹${rentCollected}`;

    const occCtx = document.getElementById('chartOccupancy').getContext('2d');
    if(state.charts.occ) state.charts.occ.destroy();
    const vCount = state.rooms.filter(r => r.status === 'Vacant').length;
    const oCount = state.rooms.filter(r => r.status === 'Occupied').length;
    state.charts.occ = new Chart(occCtx, {
        type: 'doughnut',
        data: { labels: ['Occupied', 'Vacant'], datasets: [{ data: [oCount, vCount], backgroundColor: ['#198754', '#0d6efd'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const rentCtx = document.getElementById('chartRent').getContext('2d');
    if(state.charts.rent) state.charts.rent.destroy();
    state.charts.rent = new Chart(rentCtx, {
        type: 'bar',
        data: { labels: ['Current Mth'], datasets: [{ label: 'Rent Collection (₹)', data: [rentCollected], backgroundColor: '#0d6efd' }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// ============================================================================
// 6. ROOM MANAGEMENT
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
        status: document.getElementById('room_status').value,
    };
    try {
        if (id) await updateDoc(doc(db, "rooms", id), data);
        else await addDoc(collection(db, "rooms"), data);
        showToast("Room saved.");
        ui.modals.room.hide();
    } catch (err) { showToast(err.message, "danger"); }
    toggleLoader(false);
});

function renderRooms() {
    document.getElementById('table-rooms').innerHTML = state.rooms.map(r => `
        <tr>
            <td class="fw-bold">${r.number}</td><td>${r.type}</td><td>${r.floor}</td><td>₹${r.rent}</td>
            <td><span class="badge bg-${r.status==='Vacant'?'primary':'success'}">${r.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="openRoomModal('${r.id}')"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteRecord('rooms', '${r.id}')"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('') || `<tr><td colspan="6" class="text-center py-3">No rooms found</td></tr>`;
}

// ============================================================================
// 7. TENANTS & PHOTO
// ============================================================================
let tempPhotoBase64 = null;
document.getElementById('tenant_photo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 300; canvas.height = img.height * (300/img.width);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            tempPhotoBase64 = canvas.toDataURL('image/jpeg', 0.6); 
            document.getElementById('tenant_photo_preview').src = tempPhotoBase64;
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

function updateRoomDropdowns() {
    const sel = document.getElementById('tenant_room');
    sel.innerHTML = '<option value="">Select Room...</option>' + state.rooms.map(r => `<option value="${r.id}">${r.number} (${r.status})</option>`).join('');
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
        document.getElementById('tenant_room').value = t.roomId;
        document.getElementById('tenant_status').value = t.status;
        if(t.photoUrl) document.getElementById('tenant_photo_preview').src = t.photoUrl;
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
        if(tempPhotoBase64) {
            const storageRef = ref(storage, `tenants/${Date.now()}.jpg`);
            await uploadString(storageRef, tempPhotoBase64, 'data_url');
            photoUrl = await getDownloadURL(storageRef);
        }

        const data = {
            name: document.getElementById('tenant_name').value,
            phone: document.getElementById('tenant_phone').value,
            roomId: roomId,
            status: document.getElementById('tenant_status').value,
            photoUrl: photoUrl.startsWith('http') ? photoUrl : null
        };

        if (id) await updateDoc(doc(db, "tenants", id), data);
        else await addDoc(collection(db, "tenants"), data);

        if(roomId && data.status === 'Active') await updateDoc(doc(db, "rooms", roomId), { status: 'Occupied' });
        else if (data.status === 'Left' && roomId) await updateDoc(doc(db, "rooms", roomId), { status: 'Vacant' });

        showToast("Tenant saved.");
        ui.modals.tenant.hide();
    } catch (err) { showToast(err.message, "danger"); }
    toggleLoader(false);
});

function renderTenants() {
    document.getElementById('table-tenants').innerHTML = state.tenants.map(t => {
        const room = state.rooms.find(r => r.id === t.roomId);
        return `<tr>
            <td><img src="${t.photoUrl || 'https://via.placeholder.com/40'}" width="40" height="40" class="rounded-circle me-2" style="object-fit:cover">${t.name}</td>
            <td>${room ? room.number : 'Unassigned'}</td>
            <td>${t.phone}</td>
            <td><span class="badge bg-${t.status==='Active'?'success':'secondary'}">${t.status}</span></td>
            <td><button class="btn btn-sm btn-outline-primary" onclick="openTenantModal('${t.id}')"><i class="bi bi-pencil"></i></button></td>
        </tr>`;
    }).join('') || `<tr><td colspan="5" class="text-center py-3">No tenants found</td></tr>`;
    
    document.getElementById('rent_tenant').innerHTML = '<option value="">Select Tenant...</option>' + 
        state.tenants.filter(t => t.status === 'Active').map(t => `<option value="${t.id}">${t.name}</option>`).join('');
}

// ============================================================================
// 8. RENT COLLECTION
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
    
    try {
        await addDoc(collection(db, "rent"), {
            tenantId: tenantId, roomId: tenant.roomId,
            amount: Number(document.getElementById('rent_amount').value),
            mode: document.getElementById('rent_mode').value,
            date: document.getElementById('rent_date').value,
            status: document.getElementById('rent_status').value
        });
        showToast("Rent recorded.");
        ui.modals.rent.hide();
    } catch (err) { showToast(err.message, "danger"); }
    toggleLoader(false);
});

function renderRent() {
    document.getElementById('table-rent').innerHTML = state.rent.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(r => {
        const t = state.tenants.find(t => t.id === r.tenantId);
        const rm = state.rooms.find(rm => rm.id === r.roomId);
        return `<tr>
            <td>${new Date(r.date).toLocaleDateString()}</td>
            <td>${t ? t.name : 'N/A'}</td><td>${rm ? rm.number : 'N/A'}</td>
            <td class="text-success fw-bold">₹${r.amount}</td>
            <td>${r.mode}</td><td><span class="badge bg-success">${r.status}</span></td>
        </tr>`;
    }).join('') || `<tr><td colspan="6" class="text-center py-3">No records</td></tr>`;
}

// ============================================================================
// 9. EXPORTS & UTILS
// ============================================================================
window.deleteRecord = async (col, id) => {
    if(confirm("Delete this record permanently?")) {
        toggleLoader(true);
        try { await deleteDoc(doc(db, col, id)); showToast("Deleted."); } 
        catch(e) { showToast(e.message, "danger"); }
        toggleLoader(false);
    }
};

window.exportData = (col, type) => {
    if(state[col].length === 0) return showToast("No data", "warning");
    if(type === 'excel') {
        const ws = XLSX.utils.json_to_sheet(state[col].map(d => { let r={...d}; delete r.id; delete r.photoUrl; return r; }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, col);
        XLSX.writeFile(wb, `${col}_export.xlsx`);
    }
};

window.exportBackupJSON = () => {
    const backup = { rooms: state.rooms, tenants: state.tenants, rent: state.rent };
    const a = document.createElement('a');
    a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
    a.download = `Backup_${Date.now()}.json`;
    a.click();
};
