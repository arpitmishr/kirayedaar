import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, writeBatch, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyB-dS8rEXwAwfdpXQhwhLNhsQYq6ug3XWA",
    authDomain: "tenant-75f84.firebaseapp.com",
    projectId: "tenant-75f84",
    storageBucket: "tenant-75f84.firebasestorage.app",
    messagingSenderId: "882401370229",
    appId: "1:882401370229:web:85d5c82cf49c7e1c8dd83c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

const state = {
    rooms: [],
    tenants: [],
    rent: [],
    electricity: [],
    history: [],
    alerts: [],
    activityLog: [],
    charts: {},
    currentTheme: "light",
    activeView: "dashboard",
    compressedPhotoBase64: null,
    unsubscribes: []
};

const dom = {
    sidebar: document.getElementById("sidebar"),
    sidebarToggle: document.getElementById("sidebar-toggle"),
    themeToggler: document.getElementById("theme-toggler"),
    pageHeaderTitle: document.getElementById("page-header-title"),
    viewPort: document.getElementById("view-port"),
    appSpinner: document.getElementById("app-spinner"),
    systemToast: document.getElementById("systemToast"),
    toastMsg: document.getElementById("toastMsg"),
    confirmationModal: document.getElementById("confirmationModal"),
    btnConfirmAction: document.getElementById("btn-confirm-action"),
    headerAlertCount: document.getElementById("header-alert-count"),
    headerAlertList: document.getElementById("header-alert-list"),
    dashTotalRooms: document.getElementById("dash-total-rooms"),
    dashOccupiedRooms: document.getElementById("dash-occupied-rooms"),
    dashVacantRooms: document.getElementById("dash-vacant-rooms"),
    dashMaintenanceRooms: document.getElementById("dash-maintenance-rooms"),
    dashActiveTenants: document.getElementById("dash-active-tenants"),
    dashRentPending: document.getElementById("dash-rent-pending"),
    dashElecPending: document.getElementById("dash-elec-pending"),
    dashMissingDocs: document.getElementById("dash-missing-docs"),
    dashDepositsHeld: document.getElementById("dash-deposits-held"),
    dashMonthlyIncome: document.getElementById("dash-monthly-income"),
    recentActivityContainer: document.getElementById("recent-activity-container"),
    searchRoomsInput: document.getElementById("search-rooms-input"),
    filterRoomsStatus: document.getElementById("filter-rooms-status"),
    tableRoomsBody: document.getElementById("table-rooms-body"),
    roomsEmptyState: document.getElementById("rooms-empty-state"),
    searchTenantsInput: document.getElementById("search-tenants-input"),
    filterTenantsStatus: document.getElementById("filter-tenants-status"),
    tableTenantsBody: document.getElementById("table-tenants-body"),
    tenantsEmptyState: document.getElementById("tenants-empty-state"),
    filterRentMonth: document.getElementById("filter-rent-month"),
    tableRentBody: document.getElementById("table-rent-body"),
    filterElectricityMonth: document.getElementById("filter-electricity-month"),
    tableElectricityBody: document.getElementById("table-electricity-body"),
    tableDocumentsBody: document.getElementById("table-documents-body"),
    alertsMatrixContainer: document.getElementById("alerts-matrix-container"),
    searchHistoryInput: document.getElementById("search-history-input"),
    tableHistoryBody: document.getElementById("table-history-body"),
    setPropName: document.getElementById("set-prop-name"),
    setPropAddr: document.getElementById("set-prop-addr"),
    setPropEmail: document.getElementById("set-prop-email"),
    setPropPhone: document.getElementById("set-prop-phone"),
    importBackupFile: document.getElementById("import-backup-file"),
    btnTriggerRestore: document.getElementById("btn-trigger-restore"),
    modalRoom: document.getElementById("modalRoom"),
    formRoom: document.getElementById("form-room"),
    roomEditId: document.getElementById("room-edit-id"),
    roomNumber: document.getElementById("room_number"),
    roomFloor: document.getElementById("room_floor"),
    roomBlock: document.getElementById("room_block"),
    roomType: document.getElementById("room_type"),
    roomRent: document.getElementById("room_rent"),
    roomOccupancy: document.getElementById("room_occupancy"),
    roomElecMeter: document.getElementById("room_elec_meter"),
    roomWaterMeter: document.getElementById("room_water_meter"),
    roomStatus: document.getElementById("room_status"),
    modalTenant: document.getElementById("modalTenant"),
    formTenant: document.getElementById("form-tenant"),
    tenantEditId: document.getElementById("tenant-edit-id"),
    tenantPreviewImage: document.getElementById("tenant-preview-image"),
    tenantPhotoInput: document.getElementById("tenant-photo-input"),
    btnRemovePhoto: document.getElementById("btn-remove-photo"),
    tenName: document.getElementById("ten_name"),
    tenFather: document.getElementById("ten_father"),
    tenMother: document.getElementById("ten_mother"),
    tenGender: document.getElementById("ten_gender"),
    tenDob: document.getElementById("ten_dob"),
    tenAadhar: document.getElementById("ten_aadhar"),
    tenPan: document.getElementById("ten_pan"),
    tenPassport: document.getElementById("ten_passport"),
    tenDl: document.getElementById("ten_dl"),
    tenMobile: document.getElementById("ten_mobile"),
    tenWhatsapp: document.getElementById("ten_whatsapp"),
    tenEmail: document.getElementById("ten_email"),
    tenEmergName: document.getElementById("ten_emerg_name"),
    tenEmergRel: document.getElementById("ten_emerg_rel"),
    tenOccupation: document.getElementById("ten_occupation"),
    tenPermAddr: document.getElementById("ten_perm_addr"),
    tenCurrAddr: document.getElementById("ten_curr_addr"),
    tenRoomId: document.getElementById("ten_room_id"),
    tenJoinDate: document.getElementById("ten_join_date"),
    tenStartDate: document.getElementById("ten_start_date"),
    tenEndDate: document.getElementById("ten_end_date"),
    tenRent: document.getElementById("ten_rent"),
    tenDeposit: document.getElementById("ten_deposit"),
    tenStatus: document.getElementById("ten_status"),
    tenRemarks: document.getElementById("ten_remarks"),
    chkDocAadhar: document.getElementById("chk_doc_aadhar"),
    chkDocPan: document.getElementById("chk_doc_pan"),
    chkDocAgreement: document.getElementById("chk_doc_agreement"),
    chkDocPolice: document.getElementById("chk_doc_police"),
    modalRent: document.getElementById("modalRent"),
    formRent: document.getElementById("form-rent"),
    rentTenantId: document.getElementById("rent_tenant_id"),
    rentMonth: document.getElementById("rent_month"),
    rentYear: document.getElementById("rent_year"),
    rentAmountPaid: document.getElementById("rent_amount_paid"),
    rentDiscount: document.getElementById("rent_discount"),
    rentMode: document.getElementById("rent_mode"),
    rentTransNo: document.getElementById("rent_trans_no"),
    rentRemarks: document.getElementById("rent_remarks"),
    modalElectricity: document.getElementById("modalElectricity"),
    formElectricity: document.getElementById("form-electricity"),
    elecRoomId: document.getElementById("elec_room_id"),
    elecMonth: document.getElementById("elec_month"),
    elecRate: document.getElementById("elec_rate"),
    elecPrevReading: document.getElementById("elec_prev_reading"),
    elecCurrReading: document.getElementById("elec_curr_reading"),
    calcUnitsConsumed: document.getElementById("calc-units-consumed"),
    calcBillTotal: document.getElementById("calc-bill-total"),
    modalCheckout: document.getElementById("modalCheckout"),
    formCheckout: document.getElementById("form-checkout"),
    chkoutTenantId: document.getElementById("chkout-tenant-id"),
    chkoutDate: document.getElementById("chkout_date"),
    chkoutMeterReading: document.getElementById("chkout_meter_reading"),
    chkoutDamage: document.getElementById("chkout_damage"),
    chkoutCleaning: document.getElementById("chkout_cleaning"),
    chkoutDues: document.getElementById("chkout_dues"),
    chkoutNotes: document.getElementById("chkout_notes"),
    receiptTemplate: document.getElementById("receiptTemplate"),
    loginScreen: document.getElementById("login-screen"),
    formLogin: document.getElementById("form-login"),
    loginEmail: document.getElementById("login-email"),
    loginPassword: document.getElementById("login-password"),
    btnLoginSubmit: document.getElementById("btn-login-submit"),
    btnToggleSignup: document.getElementById("btn-toggle-signup"),
    btnLogout: document.getElementById("btn-logout"),
    userDisplayEmail: document.getElementById("user-display-email"),
    duesLedgerMonth: document.getElementById("dues-ledger-month"),
    tableDuesLedgerBody: document.getElementById("table-dues-ledger-body")
};

const instances = {
    toast: new bootstrap.Toast(dom.systemToast),
    modalRoom: new bootstrap.Modal(dom.modalRoom),
    modalTenant: new bootstrap.Modal(dom.modalTenant),
    modalRent: new bootstrap.Modal(dom.modalRent),
    modalElectricity: new bootstrap.Modal(dom.modalElectricity),
    modalCheckout: new bootstrap.Modal(dom.modalCheckout),
    confirmationModal: new bootstrap.Modal(dom.confirmationModal)
};

const showLoader = (show) => {
    if (show) {
        dom.appSpinner.classList.remove("d-none");
        dom.appSpinner.classList.add("d-flex");
    } else {
        dom.appSpinner.classList.remove("d-flex");
        dom.appSpinner.classList.add("d-none");
    }
};

const showToast = (message, type = "success") => {
    dom.systemToast.className = `toast align-items-center text-white border-0 bg-${type}`;
    dom.toastMsg.innerText = message;
    instances.toast.show();
};

const logActivity = (action, description) => {
    const logItem = {
        id: Math.random().toString(36).substring(2, 11),
        action,
        description,
        timestamp: new Date().toISOString()
    };
    state.activityLog.unshift(logItem);
    if (state.activityLog.length > 50) {
        state.activityLog.pop();
    }
    localStorage.setItem("propmanager_activities", JSON.stringify(state.activityLog));
    renderActivityLog();
};

const renderActivityLog = () => {
    if (!dom.recentActivityContainer) return;
    if (state.activityLog.length === 0) {
        dom.recentActivityContainer.innerHTML = `<div class="text-center text-muted py-4"><small>No actions tracked in active session.</small></div>`;
        return;
    }
    dom.recentActivityContainer.innerHTML = state.activityLog.slice(0, 5).map(log => `
        <div class="d-flex align-items-center gap-3 mb-2 p-2 rounded bg-light" style="font-size: 12px;">
            <div class="badge bg-secondary">${log.action}</div>
            <div class="flex-grow-1 text-dark">${log.description}</div>
            <div class="text-muted" style="font-size: 10px;">${new Date(log.timestamp).toLocaleTimeString()}</div>
        </div>
    `).join("");
};

const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
};

const switchView = (targetView) => {
    const views = document.querySelectorAll(".app-view");
    views.forEach(v => v.classList.add("d-none"));
    const activeSection = document.getElementById(`view-${targetView}`);
    if (activeSection) {
        activeSection.classList.remove("d-none");
    }
    const navLinks = document.querySelectorAll(".sidebar .nav-link");
    navLinks.forEach(link => {
        if (link.getAttribute("data-view") === targetView) {
            link.classList.add("active");
            dom.pageHeaderTitle.innerText = link.innerText.trim();
        } else {
            link.classList.remove("active");
        }
    });
    state.activeView = targetView;
    dom.sidebar.classList.remove("active");
    if (targetView === "dashboard") {
        setTimeout(initCharts, 100);
    }
    if (targetView === "reports") {
        renderDuesLedger();
    }
};

const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute("data-bs-theme");
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-bs-theme", nextTheme);
    state.currentTheme = nextTheme;
    localStorage.setItem("propmanager_theme", nextTheme);
    dom.themeToggler.innerHTML = nextTheme === "light" ? `<i class="bi bi-moon-stars-fill"></i>` : `<i class="bi bi-sun-fill"></i>`;
    if (state.activeView === "dashboard") {
        initCharts();
    }
};

const compressPhoto = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                let width = img.width;
                let height = img.height;
                const maxDim = 600;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                let quality = 0.85;
                let dataUrl = canvas.toDataURL("image/jpeg", quality);
                while (dataUrl.length > 200000 && quality > 0.1) {
                    quality -= 0.05;
                    dataUrl = canvas.toDataURL("image/jpeg", quality);
                }
                if (dataUrl.length > 200000) {
                    reject(new Error("Image remains larger than 200KB after maximum downsampling compression."));
                } else {
                    resolve(dataUrl);
                }
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

const syncTenantDropdowns = () => {
    if (!dom.rentTenantId) return;
    const activeTenants = state.tenants.filter(t => t.status === "Active");
    dom.rentTenantId.innerHTML = `<option value="">Select Tenant</option>` + activeTenants.map(t => {
        const room = state.rooms.find(r => r.id === t.roomId);
        return `<option value="${t.id}">${t.name} (Room ${room ? room.number : "N/A"})</option>`;
    }).join("");
};

const syncRoomDropdowns = () => {
    if (!dom.tenRoomId || !dom.elecRoomId) return;
    const vacantRooms = state.rooms.filter(r => r.status === "Vacant");
    dom.tenRoomId.innerHTML = `<option value="">Select Vacant Room</option>` + vacantRooms.map(r => {
        return `<option value="${r.id}">Room ${r.number} (${r.type} - ₹${r.rent})</option>`;
    }).join("");
    dom.elecRoomId.innerHTML = `<option value="">Select Room</option>` + state.rooms.map(r => {
        return `<option value="${r.id}">Room ${r.number}</option>`;
    }).join("");
};

const calculateDashboardStats = () => {
    const totalRooms = state.rooms.length;
    const occupiedRooms = state.rooms.filter(r => r.status === "Occupied").length;
    const vacantRooms = state.rooms.filter(r => r.status === "Vacant").length;
    const maintenanceRooms = state.rooms.filter(r => r.status === "Maintenance").length;
    const activeTenants = state.tenants.filter(t => t.status === "Active").length;
    let rentCollected = 0;
    state.rent.forEach(r => {
        rentCollected += Number(r.amountPaid || 0);
    });
    let depositsHeld = 0;
    state.tenants.forEach(t => {
        if (t.status === "Active" && t.deposit) {
            depositsHeld += Number(t.deposit || 0);
        }
    });
    let missingDocsCount = 0;
    state.tenants.forEach(t => {
        if (t.status === "Active" && t.docs) {
            const checklist = t.docs;
            const completed = Object.values(checklist).filter(v => v === true).length;
            if (completed < 4) {
                missingDocsCount++;
            }
        }
    });

    const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    let pendingRentCount = 0;
    state.tenants.forEach(t => {
        if (t.status === "Active") {
            const hasPaid = state.rent.some(r => r.tenantId === t.id && r.month === currentMonthName && Number(r.year) === currentYear);
            if (!hasPaid) {
                pendingRentCount++;
            }
        }
    });

    const pendingElecCount = state.electricity.filter(e => e.status === "Pending").length;

    dom.dashTotalRooms.innerText = totalRooms;
    dom.dashOccupiedRooms.innerText = occupiedRooms;
    dom.dashVacantRooms.innerText = vacantRooms;
    dom.dashMaintenanceRooms.innerText = maintenanceRooms;
    dom.dashActiveTenants.innerText = activeTenants;
    dom.dashRentPending.innerText = pendingRentCount;
    dom.dashElecPending.innerText = pendingElecCount;
    dom.dashDepositsHeld.innerText = formatCurrency(depositsHeld);
    dom.dashMonthlyIncome.innerText = formatCurrency(rentCollected);
    dom.dashMissingDocs.innerText = missingDocsCount;

    state.alerts = [];
    const today = new Date();
    state.tenants.forEach(t => {
        if (t.status === "Active" && t.endDate) {
            const end = new Date(t.endDate);
            const diffTime = end - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 30 && diffDays >= 0) {
                state.alerts.push({
                    type: "warning",
                    title: "Lease Expiring Soon",
                    description: `Tenant ${t.name} (Room ${state.rooms.find(r => r.id === t.roomId)?.number || "N/A"}) lease expires in ${diffDays} days.`
                });
            } else if (diffDays < 0) {
                state.alerts.push({
                    type: "danger",
                    title: "Lease Overdue",
                    description: `Tenant ${t.name} (Room ${state.rooms.find(r => r.id === t.roomId)?.number || "N/A"}) lease expired on ${end.toLocaleDateString()}.`
                });
            }
        }
    });
    state.rooms.forEach(r => {
        if (r.status === "Maintenance") {
            state.alerts.push({
                type: "secondary",
                title: "Room Under Maintenance",
                description: `Room ${r.number} is marked as under active maintenance.`
            });
        }
    });
    dom.headerAlertCount.innerText = state.alerts.length;
    if (state.alerts.length === 0) {
        dom.headerAlertList.innerHTML = `<li class="p-2 border-bottom text-center"><small class="fw-bold">Notifications</small></li><li class="p-3 text-center text-muted"><small>No critical alerts active</small></li>`;
    } else {
        dom.headerAlertList.innerHTML = `<li class="p-2 border-bottom text-center"><small class="fw-bold">Notifications</small></li>` + state.alerts.map(a => `
            <li class="p-2 border-bottom">
                <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-${a.type}">${a.title}</span>
                    <small class="text-dark d-block text-truncate" style="max-width: 180px;">${a.description}</small>
                </div>
            </li>
        `).join("");
    }
    renderAlertsView();
};

const renderAlertsView = () => {
    if (!dom.alertsMatrixContainer) return;
    if (state.alerts.length === 0) {
        dom.alertsMatrixContainer.innerHTML = `<div class="col-12 text-center text-muted py-5"><i class="bi bi-shield-check fs-1 text-success"></i><p class="mt-2">Zero system exceptions detected. All clear.</p></div>`;
        return;
    }
    dom.alertsMatrixContainer.innerHTML = state.alerts.map(alert => `
        <div class="col-12 col-md-6 col-lg-4">
            <div class="card border-0 border-start border-${alert.type} border-4 shadow-sm p-3 bg-white">
                <h6 class="fw-bold text-${alert.type} mb-1">${alert.title}</h6>
                <p class="text-muted small m-0">${alert.description}</p>
            </div>
        </div>
    `).join("");
};

const initCharts = () => {
    if (state.activeView !== "dashboard") return;
    const ctxRent = document.getElementById("chartRentCollection");
    const ctxOccupancy = document.getElementById("chartOccupancyDistribution");
    if (!ctxRent || !ctxOccupancy) return;
    if (state.charts.rent) {
        state.charts.rent.destroy();
    }
    if (state.charts.occ) {
        state.charts.occ.destroy();
    }
    const isDark = document.documentElement.getAttribute("data-bs-theme") === "dark";
    const gridColor = isDark ? "#334155" : "#e2e8f0";
    const textColor = isDark ? "#cbd5e1" : "#1e293b";
    const collections = {};
    const monthsOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    state.rent.forEach(r => {
        const key = `${r.month} ${r.year}`;
        collections[key] = (collections[key] || 0) + Number(r.amountPaid || 0);
    });
    const rawKeys = Object.keys(collections);
    rawKeys.sort((a, b) => {
        const [m1, y1] = a.split(" ");
        const [m2, y2] = b.split(" ");
        if (y1 !== y2) {
            return Number(y1) - Number(y2);
        }
        return monthsOrder.indexOf(m1) - monthsOrder.indexOf(m2);
    });
    const rentLabels = rawKeys.slice(-6);
    const rentData = rentLabels.map(k => collections[k]);
    state.charts.rent = new Chart(ctxRent, {
        type: "line",
        data: {
            labels: rentLabels.length > 0 ? rentLabels : ["No Ledger Data"],
            datasets: [{
                label: "Monthly Collection (₹)",
                data: rentData.length > 0 ? rentData : [0],
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                borderWidth: 3,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: textColor } }
            },
            scales: {
                x: { grid: { color: gridColor }, ticks: { color: textColor } },
                y: { grid: { color: gridColor }, ticks: { color: textColor } }
            }
        }
    });
    const occupied = state.rooms.filter(r => r.status === "Occupied").length;
    const vacant = state.rooms.filter(r => r.status === "Vacant").length;
    const maintenance = state.rooms.filter(r => r.status === "Maintenance").length;
    const reserved = state.rooms.filter(r => r.status === "Reserved").length;
    state.charts.occ = new Chart(ctxOccupancy, {
        type: "doughnut",
        data: {
            labels: ["Occupied", "Vacant", "Maintenance", "Reserved"],
            datasets: [{
                data: [occupied, vacant, maintenance, reserved],
                backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#64748b"],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { color: textColor }
                }
            }
        }
    });
};

const renderRooms = (filterQuery = "", statusFilter = "") => {
    if (!dom.tableRoomsBody) return;
    let filtered = [...state.rooms];
    if (filterQuery) {
        filtered = filtered.filter(r => r.number.toLowerCase().includes(filterQuery.toLowerCase()));
    }
    if (statusFilter) {
        filtered = filtered.filter(r => r.status === statusFilter);
    }
    if (filtered.length === 0) {
        dom.tableRoomsBody.innerHTML = "";
        dom.roomsEmptyState.classList.remove("d-none");
        return;
    }
    dom.roomsEmptyState.classList.add("d-none");
    dom.tableRoomsBody.innerHTML = filtered.map(r => {
        let badgeClass = "bg-primary";
        if (r.status === "Occupied") badgeClass = "bg-success";
        else if (r.status === "Maintenance") badgeClass = "bg-warning text-dark";
        else if (r.status === "Reserved") badgeClass = "bg-secondary";
        return `
            <tr>
                <td class="ps-3 fw-bold text-dark">${r.number}</td>
                <td>${r.floor} ${r.block ? `(${r.block})` : ""}</td>
                <td>${r.type}</td>
                <td class="fw-semibold">${formatCurrency(r.rent)}</td>
                <td>${r.elecMeter || "N/A"}</td>
                <td>${r.occupancy}</td>
                <td><span class="badge ${badgeClass}">${r.status}</span></td>
                <td class="text-end pe-3">
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="editRoom('${r.id}')"><i class="bi bi-pencil-fill"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteRoom('${r.id}')"><i class="bi bi-trash-fill"></i></button>
                </td>
            </tr>
        `;
    }).join("");
};

window.editRoom = (id) => {
    const room = state.rooms.find(r => r.id === id);
    if (!room) return;
    dom.roomEditId.value = room.id;
    dom.roomNumber.value = room.number || "";
    dom.roomFloor.value = room.floor || "";
    dom.roomBlock.value = room.block || "";
    dom.roomType.value = room.type || "";
    dom.roomRent.value = room.rent || "";
    dom.roomOccupancy.value = room.occupancy || "1";
    dom.roomElecMeter.value = room.elecMeter || "";
    dom.roomWaterMeter.value = room.waterMeter || "";
    dom.roomStatus.value = room.status || "Vacant";
    document.getElementById("modalRoomLabel").innerText = "Edit Room Details";
    instances.modalRoom.show();
};

window.deleteRoom = (id) => {
    const room = state.rooms.find(r => r.id === id);
    if (!room) return;
    const associatedTenant = state.tenants.find(t => t.roomId === id && t.status === "Active");
    if (associatedTenant) {
        showToast("Cannot delete a room that currently hosts an active tenant.", "danger");
        return;
    }
    showConfirmation("Delete Room Record", `Are you sure you want to delete Room ${room.number} permanently? This cannot be undone.`, async () => {
        showLoader(true);
        try {
            await deleteDoc(doc(db, "rooms", id));
            showToast(`Room ${room.number} was deleted successfully.`);
            logActivity("DELETE", `Room ${room.number} deleted.`);
        } catch (err) {
            showToast(err.message, "danger");
        }
        showLoader(false);
    });
};

window.openRoomModal = () => {
    dom.formRoom.reset();
    dom.roomEditId.value = "";
    document.getElementById("modalRoomLabel").innerText = "Add New Room";
    instances.modalRoom.show();
};

dom.formRoom.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = dom.roomEditId.value;
    const roomNum = dom.roomNumber.value.trim();
    if (!roomNum) {
        showToast("Room number is required.", "warning");
        return;
    }
    const dup = state.rooms.find(r => r.number.toLowerCase() === roomNum.toLowerCase() && r.id !== id);
    if (dup) {
        showToast("Room number must be completely unique.", "danger");
        return;
    }
    const data = {
        number: roomNum,
        floor: dom.roomFloor.value.trim(),
        block: dom.roomBlock.value.trim(),
        type: dom.roomType.value,
        rent: Number(dom.roomRent.value || 0),
        occupancy: Number(dom.roomOccupancy.value || 1),
        elecMeter: dom.roomElecMeter.value.trim(),
        waterMeter: dom.roomWaterMeter.value.trim(),
        status: dom.roomStatus.value
    };
    showLoader(true);
    try {
        if (id) {
            await updateDoc(doc(db, "rooms", id), data);
            showToast(`Room ${roomNum} was updated successfully.`);
            logActivity("UPDATE", `Room ${roomNum} parameters updated.`);
        } else {
            await addDoc(collection(db, "rooms"), data);
            showToast(`Room ${roomNum} created in property inventory.`);
            logActivity("CREATE", `Room ${roomNum} created.`);
        }
        instances.modalRoom.hide();
    } catch (err) {
        showToast(err.message, "danger");
    }
    showLoader(false);
});

dom.searchRoomsInput.addEventListener("input", (e) => {
    renderRooms(e.target.value, dom.filterRoomsStatus.value);
});

dom.filterRoomsStatus.addEventListener("change", (e) => {
    renderRooms(dom.searchRoomsInput.value, e.target.value);
});

const renderTenants = (filterQuery = "", statusFilter = "") => {
    if (!dom.tableTenantsBody) return;
    let filtered = [...state.tenants];
    if (filterQuery) {
        filtered = filtered.filter(t => t.name.toLowerCase().includes(filterQuery.toLowerCase()) || t.phone.includes(filterQuery));
    }
    if (statusFilter) {
        filtered = filtered.filter(t => t.status === statusFilter);
    }
    if (filtered.length === 0) {
        dom.tableTenantsBody.innerHTML = "";
        dom.tenantsEmptyState.classList.remove("d-none");
        return;
    }
    dom.tenantsEmptyState.classList.add("d-none");
    dom.tableTenantsBody.innerHTML = filtered.map(t => {
        const room = state.rooms.find(r => r.id === t.roomId);
        let badgeClass = "bg-success";
        if (t.status === "Notice Period") badgeClass = "bg-warning text-dark";
        else if (t.status === "Left") badgeClass = "bg-secondary";
        const docsObj = t.docs || {};
        const docCount = Object.values(docsObj).filter(v => v === true).length;
        const percentage = Math.round((docCount / 4) * 100);
        let progressClass = "bg-danger";
        if (percentage === 100) progressClass = "bg-success";
        else if (percentage > 0) progressClass = "bg-warning";
        const endDateFormatted = t.endDate ? new Date(t.endDate).toLocaleDateString() : "N/A";
        return `
            <tr>
                <td class="ps-3">
                    <img src="${t.photoUrl || 'https://placehold.co/50'}" class="profile-thumb rounded-circle border" alt="Tenant Thumb" style="width:40px; height:40px; object-fit:cover;">
                </td>
                <td class="fw-bold text-dark">${t.name}</td>
                <td>${room ? `Room ${room.number}` : '<span class="text-muted">Unassigned</span>'}</td>
                <td>${t.phone || "N/A"}</td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="progress flex-grow-1" style="height: 6px; min-width: 60px;">
                            <div class="progress-bar ${progressClass}" style="width: ${percentage}%"></div>
                        </div>
                        <small class="text-muted fw-semibold" style="font-size: 11px;">${percentage}%</small>
                    </div>
                </td>
                <td>${endDateFormatted}</td>
                <td><span class="badge ${badgeClass}">${t.status}</span></td>
                <td class="text-end pe-3">
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="editTenant('${t.id}')"><i class="bi bi-pencil-fill"></i></button>
                    ${t.status === 'Active' || t.status === 'Notice Period' ? `<button class="btn btn-sm btn-outline-danger" onclick="checkoutTenant('${t.id}')"><i class="bi bi-box-arrow-right"></i></button>` : ""}
                </td>
            </tr>
        `;
    }).join("");
};

window.openTenantModal = () => {
    dom.formTenant.reset();
    dom.tenantEditId.value = "";
    dom.tenantPreviewImage.src = "https://placehold.co/110";
    state.compressedPhotoBase64 = null;
    syncRoomDropdowns();
    dom.tenRoomId.disabled = false;
    instances.modalTenant.show();
};

window.editTenant = (id) => {
    const t = state.tenants.find(x => x.id === id);
    if (!t) return;
    dom.formTenant.reset();
    dom.tenantEditId.value = t.id;
    dom.tenantPreviewImage.src = t.photoUrl || "https://placehold.co/110";
    state.compressedPhotoBase64 = null;
    dom.tenName.value = t.name || "";
    dom.tenFather.value = t.fatherName || "";
    dom.tenMother.value = t.motherName || "";
    dom.tenGender.value = t.gender || "";
    dom.tenDob.value = t.dob || "";
    dom.tenAadhar.value = t.aadhar || "";
    dom.tenPan.value = t.pan || "";
    dom.tenPassport.value = t.passport || "";
    dom.tenDl.value = t.dl || "";
    dom.tenMobile.value = t.phone || "";
    dom.tenWhatsapp.value = t.whatsapp || "";
    dom.tenEmail.value = t.email || "";
    dom.tenEmergName.value = t.emergName || "";
    dom.tenEmergRel.value = t.emergRel || "";
    dom.tenOccupation.value = t.occupation || "";
    dom.tenPermAddr.value = t.permAddr || "";
    dom.tenCurrAddr.value = t.currAddr || "";
    dom.tenJoinDate.value = t.joinDate || "";
    dom.tenStartDate.value = t.startDate || "";
    dom.tenEndDate.value = t.endDate || "";
    dom.tenRent.value = t.rent || "";
    dom.tenDeposit.value = t.deposit || "";
    dom.tenStatus.value = t.status || "Active";
    dom.tenRemarks.value = t.remarks || "";
    if (t.docs) {
        dom.chkDocAadhar.checked = !!t.docs.aadhar;
        dom.chkDocPan.checked = !!t.docs.pan;
        dom.chkDocAgreement.checked = !!t.docs.agreement;
        dom.chkDocPolice.checked = !!t.docs.police;
    }
    const currentRoomList = [...state.rooms];
    dom.tenRoomId.innerHTML = `<option value="">Select Room</option>` + currentRoomList.map(r => {
        const isSelfRoom = r.id === t.roomId;
        if (r.status === "Vacant" || isSelfRoom) {
            return `<option value="${r.id}" ${isSelfRoom ? 'selected' : ''}>Room ${r.number} (${r.status})</option>`;
        }
        return "";
    }).filter(v => v !== "").join("");
    instances.modalTenant.show();
};

dom.tenantPhotoInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    showLoader(true);
    try {
        const compressedBase64 = await compressPhoto(file);
        state.compressedPhotoBase64 = compressedBase64;
        dom.tenantPreviewImage.src = compressedBase64;
        showToast("Photo processed successfully.");
    } catch (err) {
        showToast(err.message, "danger");
    }
    showLoader(false);
});

dom.btnRemovePhoto.addEventListener("click", () => {
    dom.tenantPreviewImage.src = "https://placehold.co/110";
    state.compressedPhotoBase64 = null;
    dom.tenantPhotoInput.value = "";
});

dom.formTenant.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = dom.tenantEditId.value;
    const name = dom.tenName.value.trim();
    const phone = dom.tenMobile.value.trim();
    const aadhar = dom.tenAadhar.value.trim();
    const roomId = dom.tenRoomId.value;
    const joinDate = dom.tenJoinDate.value;
    const startDate = dom.tenStartDate.value || null;
    const endDate = dom.tenEndDate.value || null;
    const rent = Number(dom.tenRent.value || 0);
    const deposit = Number(dom.tenDeposit.value || 0);
    const gender = dom.tenGender.value;
    const status = dom.tenStatus.value;

    if (!name || !phone || !aadhar || !roomId || !joinDate || !rent || !gender) {
        showToast("Please fill in all mandatory fields (Name, Phone, Aadhar, Room, Joining Date, Rent, and Gender).", "warning");
        return;
    }

    const dup = state.tenants.find(t => t.aadhar === aadhar && t.id !== id);
    if (dup) {
        showToast("Aadhar number already linked with another tenant.", "danger");
        return;
    }

    showLoader(true);
    try {
        let photoUrl = null;
        if (id) {
            const currentTObj = state.tenants.find(x => x.id === id);
            photoUrl = (currentTObj && currentTObj.photoUrl) ? currentTObj.photoUrl : null;
        }

        if (state.compressedPhotoBase64) {
            photoUrl = state.compressedPhotoBase64;
        }

        const rawData = {
            name,
            fatherName: dom.tenFather.value.trim() || null,
            motherName: dom.tenMother.value.trim() || null,
            gender,
            dob: dom.tenDob.value || null,
            aadhar,
            pan: dom.tenPan.value.trim() || null,
            passport: dom.tenPassport.value.trim() || null,
            dl: dom.tenDl.value.trim() || null,
            phone,
            whatsapp: dom.tenWhatsapp.value.trim() || null,
            email: dom.tenEmail.value.trim() || null,
            emergName: dom.tenEmergName.value.trim() || null,
            emergRel: dom.tenEmergRel.value.trim() || null,
            occupation: dom.tenOccupation.value.trim() || null,
            permAddr: dom.tenPermAddr.value.trim() || null,
            currAddr: dom.tenCurrAddr.value.trim() || null,
            roomId,
            joinDate,
            startDate: startDate,
            endDate: endDate,
            rent,
            deposit,
            status,
            remarks: dom.tenRemarks.value.trim() || null,
            photoUrl: photoUrl,
            docs: {
                aadhar: dom.chkDocAadhar.checked,
                pan: dom.chkDocPan.checked,
                agreement: dom.chkDocAgreement.checked,
                police: dom.chkDocPolice.checked
            }
        };

        const cleanedData = {};
        Object.keys(rawData).forEach(key => {
            cleanedData[key] = rawData[key] === undefined ? null : rawData[key];
        });

        const batchObj = writeBatch(db);
        let tenantRef = null;

        if (id) {
            tenantRef = doc(db, "tenants", id);
            batchObj.update(tenantRef, cleanedData);
            const originalTenant = state.tenants.find(x => x.id === id);
            if (originalTenant && originalTenant.roomId !== roomId) {
                if (originalTenant.roomId) {
                    const oldRoomRef = doc(db, "rooms", originalTenant.roomId);
                    batchObj.update(oldRoomRef, { status: "Vacant" });
                }
                if (roomId) {
                    const newRoomRef = doc(db, "rooms", roomId);
                    batchObj.update(newRoomRef, { status: "Occupied" });
                }
            }
        } else {
            tenantRef = doc(collection(db, "tenants"));
            batchObj.set(tenantRef, { ...cleanedData, createdAt: new Date().toISOString() });
            if (roomId) {
                const roomRef = doc(db, "rooms", roomId);
                batchObj.update(roomRef, { status: "Occupied" });
            }
        }

        await batchObj.commit();
        showToast(`Tenant profile ${name} saved successfully.`);
        logActivity(id ? "UPDATE" : "CREATE", `Tenant ${name} processed.`);
        instances.modalTenant.hide();
    } catch (err) {
        showToast("Error saving tenant: " + err.message, "danger");
    }
    showLoader(false);
});

dom.searchTenantsInput.addEventListener("input", (e) => {
    renderTenants(e.target.value, dom.filterTenantsStatus.value);
});

dom.filterTenantsStatus.addEventListener("change", (e) => {
    renderTenants(dom.searchTenantsInput.value, e.target.value);
});

window.checkoutTenant = (id) => {
    const t = state.tenants.find(x => x.id === id);
    if (!t) return;
    dom.formCheckout.reset();
    dom.chkoutTenantId.value = t.id;
    dom.chkoutDate.valueAsDate = new Date();
    const associatedRoom = state.rooms.find(r => r.id === t.roomId);
    if (associatedRoom) {
        document.getElementById("chkout_meter_reading").placeholder = `Previous meter: ${associatedRoom.elecMeter || 0}`;
    }
    instances.modalCheckout.show();
};

dom.formCheckout.addEventListener("submit", async (e) => {
    e.preventDefault();
    const tId = dom.chkoutTenantId.value;
    const tObj = state.tenants.find(x => x.id === tId);
    if (!tObj) return;
    const finalDate = dom.chkoutDate.value;
    const damageVal = Number(dom.chkoutDamage.value || 0);
    const cleaningVal = Number(dom.chkoutCleaning.value || 0);
    const otherDuesVal = Number(dom.chkoutDues.value || 0);
    const finalReading = Number(dom.chkoutMeterReading.value || 0);
    const notes = dom.chkoutNotes.value.trim();
    if (!finalDate || !finalReading) {
        showToast("Final readings and exit date are required.", "warning");
        return;
    }
    showLoader(true);
    try {
        const batchObj = writeBatch(db);
        const tenantRef = doc(db, "tenants", tId);
        batchObj.update(tenantRef, { status: "Left", roomId: "" });
        if (tObj.roomId) {
            const roomRef = doc(db, "rooms", tObj.roomId);
            batchObj.update(roomRef, { status: "Vacant" });
        }
        const histRef = doc(collection(db, "history"));
        const checkoutRecord = {
            tenantId: tId,
            tenantName: tObj.name,
            phone: tObj.phone,
            aadhar: tObj.aadhar,
            roomId: tObj.roomId,
            roomNumber: tObj.roomId ? (state.rooms.find(r => r.id === tObj.roomId)?.number || "N/A") : "N/A",
            checkoutDate: finalDate,
            damageDeductions: damageVal,
            cleaningDeductions: cleaningVal,
            otherDues: otherDuesVal,
            finalElectricityReading: finalReading,
            notes: notes,
            timestamp: new Date().toISOString()
        };
        batchObj.set(histRef, checkoutRecord);
        await batchObj.commit();
        showToast("Checkout finalized. Room status reset and tenant records archived.");
        logActivity("CHECKOUT", `Tenant ${tObj.name} checked out from Property.`);
        instances.modalCheckout.hide();
    } catch (err) {
        showToast(err.message, "danger");
    }
    showLoader(false);
});

const renderRent = () => {
    if (!dom.tableRentBody) return;
    const filterVal = dom.filterRentMonth.value;
    let filtered = [...state.rent];
    if (filterVal) {
        const [y, m] = filterVal.split("-");
        const monthsOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const selectedMonthName = monthsOrder[parseInt(m) - 1];
        filtered = filtered.filter(r => r.month === selectedMonthName && Number(r.year) === Number(y));
    }
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    dom.tableRentBody.innerHTML = filtered.map(r => {
        const tenant = state.tenants.find(t => t.id === r.tenantId);
        const room = state.rooms.find(rm => rm.id === r.roomId);
        const dateFormatted = r.timestamp ? new Date(r.timestamp).toLocaleDateString() : "N/A";
        return `
            <tr>
                <td class="ps-3">${dateFormatted}</td>
                <td class="fw-bold text-dark">${tenant ? tenant.name : '<span class="text-muted">Deleted Tenant</span>'}</td>
                <td>${room ? `Room ${room.number}` : '<span class="text-muted">Deleted</span>'}</td>
                <td>${r.month} ${r.year}</td>
                <td class="fw-bold text-success">${formatCurrency(r.amountPaid)}</td>
                <td><span class="badge bg-secondary">${r.mode}</span></td>
                <td><code>${r.transactionNo || "N/A"}</code></td>
                <td><span class="badge bg-success">${r.status || "Paid"}</span></td>
                <td class="text-end pe-3">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="printReceipt('${r.id}')"><i class="bi bi-printer-fill"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteRentRecord('${r.id}')"><i class="bi bi-trash-fill"></i></button>
                </td>
            </tr>
        `;
    }).join("") || `<tr><td colspan="9" class="text-center py-5 text-muted">No fiscal rent payments logged in selected range.</td></tr>`;
};

window.printReceipt = (id) => {
    const rentObj = state.rent.find(r => r.id === id);
    if (!rentObj) return;
    const tenant = state.tenants.find(t => t.id === rentObj.tenantId);
    const room = state.rooms.find(rm => rm.id === rentObj.roomId);
    document.getElementById("pr-comp-name").innerText = dom.setPropName.value.toUpperCase();
    document.getElementById("pr-comp-address").innerText = dom.setPropAddr.value;
    document.getElementById("pr-comp-contact").innerText = `Phone: ${dom.setPropPhone.value} | Email: ${dom.setPropEmail.value}`;
    document.getElementById("pr-tenant-name").innerText = tenant ? tenant.name : "N/A";
    document.getElementById("pr-tenant-phone").innerText = tenant ? tenant.phone : "N/A";
    document.getElementById("pr-room-no").innerText = room ? room.number : "N/A";
    document.getElementById("pr-receipt-id").innerText = rentObj.id.toUpperCase();
    document.getElementById("pr-date").innerText = rentObj.timestamp ? new Date(rentObj.timestamp).toLocaleDateString() : "N/A";
    document.getElementById("pr-month-paid").innerText = `${rentObj.month} ${rentObj.year}`;
    document.getElementById("pr-subtotal-rent").innerText = formatCurrency(rentObj.amountPaid);
    document.getElementById("pr-subtotal-discount").innerText = formatCurrency(rentObj.discount || 0);
    document.getElementById("pr-total-paid").innerText = formatCurrency(rentObj.amountPaid);
    dom.receiptTemplate.classList.remove("d-none");
    const options = {
        margin: 0.5,
        filename: `Rent_Receipt_${tenant ? tenant.name : "tenant"}_${rentObj.month}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
    };
    html2pdf().from(dom.receiptTemplate).set(options).save().then(() => {
        dom.receiptTemplate.classList.add("d-none");
    }).catch(err => {
        showToast(err.message, "danger");
        dom.receiptTemplate.classList.add("d-none");
    });
};

window.deleteRentRecord = (id) => {
    const r = state.rent.find(x => x.id === id);
    if (!r) return;
    showConfirmation("Delete Rent Record", "Are you sure you want to delete this payment transaction? This will adjust balance states.", async () => {
        showLoader(true);
        try {
            await deleteDoc(doc(db, "rent", id));
            showToast("Fiscal payment record successfully removed.");
            logActivity("DELETE", "Rent collection record deleted.");
        } catch (err) {
            showToast(err.message, "danger");
        }
        showLoader(false);
    });
};

window.openRentModal = () => {
    dom.formRent.reset();
    syncTenantDropdowns();
    instances.modalRent.show();
};

dom.formRent.addEventListener("submit", async (e) => {
    e.preventDefault();
    const tId = dom.rentTenantId.value;
    const amt = Number(dom.rentAmountPaid.value || 0);
    const month = dom.rentMonth.value;
    const year = Number(dom.rentYear.value || 2024);
    const mode = dom.rentMode.value;
    const tx = dom.rentTransNo.value.trim();
    const notes = dom.rentRemarks.value.trim();
    const disc = Number(dom.rentDiscount.value || 0);
    if (!tId || !amt || !month || !year || !mode) {
        showToast("Please fill in all mandatory ledger options.", "warning");
        return;
    }
    const tObj = state.tenants.find(x => x.id === tId);
    if (!tObj) return;
    const payload = {
        tenantId: tId,
        roomId: tObj.roomId,
        month,
        year,
        amountPaid: amt,
        discount: disc,
        mode,
        transactionNo: tx,
        status: "Paid",
        remarks: notes,
        timestamp: new Date().toISOString()
    };
    showLoader(true);
    try {
        await addDoc(collection(db, "rent"), payload);
        showToast(`Rent payment recorded for tenant: ${tObj.name}.`);
        logActivity("REVENUE", `Collected ₹${amt} from ${tObj.name}.`);
        instances.modalRent.hide();
    } catch (err) {
        showToast(err.message, "danger");
    }
    showLoader(false);
});

dom.filterRentMonth.addEventListener("change", () => {
    renderRent();
});

const calculateElectricityValues = () => {
    const prev = Number(dom.elecPrevReading.value || 0);
    const curr = Number(dom.elecCurrReading.value || 0);
    const rate = Number(dom.elecRate.value || 8);
    if (curr < prev) {
        dom.calcUnitsConsumed.innerText = "Error";
        dom.calcBillTotal.innerText = "Reading error";
        return;
    }
    const units = curr - prev;
    const total = units * rate;
    dom.calcUnitsConsumed.innerText = units;
    dom.calcBillTotal.innerText = formatCurrency(total);
};

dom.elecPrevReading.addEventListener("input", calculateElectricityValues);
dom.elecCurrReading.addEventListener("input", calculateElectricityValues);
dom.elecRate.addEventListener("input", calculateElectricityValues);

window.openElecModal = () => {
    dom.formElectricity.reset();
    syncRoomDropdowns();
    dom.calcUnitsConsumed.innerText = "0";
    dom.calcBillTotal.innerText = "₹0.00";
    instances.modalElectricity.show();
};

dom.elecRoomId.addEventListener("change", (e) => {
    const roomId = e.target.value;
    if (!roomId) return;
    const rObj = state.rooms.find(r => r.id === roomId);
    if (rObj) {
        dom.elecPrevReading.value = rObj.elecMeter || 0;
        calculateElectricityValues();
    }
});

dom.formElectricity.addEventListener("submit", async (e) => {
    e.preventDefault();
    const rId = dom.elecRoomId.value;
    const billingMonth = dom.elecMonth.value;
    const rate = Number(dom.elecRate.value || 8);
    const prev = Number(dom.elecPrevReading.value || 0);
    const curr = Number(dom.elecCurrReading.value || 0);
    if (!rId || !billingMonth || !rate || curr < prev) {
        showToast("Ensure readings are valid and room selected.", "warning");
        return;
    }
    const consumed = curr - prev;
    const totalCost = consumed * rate;
    const payload = {
        roomId: rId,
        month: billingMonth,
        prevReading: prev,
        currReading: curr,
        unitsConsumed: consumed,
        rate,
        totalAmount: totalCost,
        status: "Pending",
        timestamp: new Date().toISOString()
    };
    showLoader(true);
    try {
        const batchObj = writeBatch(db);
        const elecRef = doc(collection(db, "electricity"));
        batchObj.set(elecRef, payload);
        const roomRef = doc(db, "rooms", rId);
        batchObj.update(roomRef, { elecMeter: curr.toString() });
        await batchObj.commit();
        showToast("Electricity bill generated and logged.");
        logActivity("BILLING", `Logged electricity for Room.`);
        instances.modalElectricity.hide();
    } catch (err) {
        showToast(err.message, "danger");
    }
    showLoader(false);
});

const renderElectricity = () => {
    if (!dom.tableElectricityBody) return;
    const filterMonthVal = dom.filterElectricityMonth.value;
    let filtered = [...state.electricity];
    if (filterMonthVal) {
        filtered = filtered.filter(e => e.month === filterMonthVal);
    }
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    dom.tableElectricityBody.innerHTML = filtered.map(e => {
        const room = state.rooms.find(r => r.id === e.roomId);
        return `
            <tr>
                <td class="ps-3">${e.month}</td>
                <td class="fw-bold">${room ? `Room ${room.number}` : 'N/A'}</td>
                <td>${e.prevReading}</td>
                <td>${e.currReading}</td>
                <td>${e.unitsConsumed} Units</td>
                <td class="fw-bold text-danger">${formatCurrency(e.totalAmount)}</td>
                <td><span class="badge bg-warning text-dark">${e.status}</span></td>
                <td class="text-end pe-3">
                    <button class="btn btn-sm btn-outline-success me-1" onclick="payElecBill('${e.id}')"><i class="bi bi-check-circle-fill"></i> Mark Paid</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteElecBill('${e.id}')"><i class="bi bi-trash-fill"></i></button>
                </td>
            </tr>
        `;
    }).join("") || `<tr><td colspan="8" class="text-center py-5 text-muted">No readings registered.</td></tr>`;
};

window.payElecBill = async (id) => {
    const eBill = state.electricity.find(x => x.id === id);
    if (!eBill) return;
    showLoader(true);
    try {
        await updateDoc(doc(db, "electricity", id), { status: "Paid" });
        showToast("Bill marked as paid.");
        logActivity("REVENUE", "Electricity utility bill settled.");
    } catch (err) {
        showToast(err.message, "danger");
    }
    showLoader(false);
};

window.deleteElecBill = (id) => {
    showConfirmation("Delete Utility Entry", "Permanently purge this utility measurement invoice?", async () => {
        showLoader(true);
        try {
            await deleteDoc(doc(db, "electricity", id));
            showToast("Bill removed successfully.");
        } catch (err) {
            showToast(err.message, "danger");
        }
        showLoader(false);
    });
};

dom.filterElectricityMonth.addEventListener("change", () => {
    renderElectricity();
});

const renderDocumentsView = () => {
    if (!dom.tableDocumentsBody) return;
    const activeTenants = state.tenants.filter(t => t.status === "Active" || t.status === "Notice Period");
    if (activeTenants.length === 0) {
        dom.tableDocumentsBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-5">No active occupants logged.</td></tr>`;
        return;
    }
    dom.tableDocumentsBody.innerHTML = activeTenants.map(t => {
        const d = t.docs || {};
        const renderBadge = (status) => status ? `<span class="badge bg-success"><i class="bi bi-check-circle"></i> Verified</span>` : `<span class="badge bg-danger"><i class="bi bi-x-circle"></i> Pending</span>`;
        const totals = Object.values(d).filter(v => v === true).length;
        const totalBadge = totals === 4 ? `<span class="badge bg-success">100% Compliant</span>` : `<span class="badge bg-warning text-dark">${totals}/4 Docs Provided</span>`;
        return `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-3">
                        <img src="${t.photoUrl || 'https://placehold.co/40'}" class="rounded-circle border" width="35" height="35" style="object-fit:cover;">
                        <span class="fw-bold">${t.name}</span>
                    </div>
                </td>
                <td>${renderBadge(d.aadhar)}</td>
                <td>${renderBadge(d.pan)}</td>
                <td>${renderBadge(d.agreement)}</td>
                <td>${renderBadge(d.police)}</td>
                <td>${totalBadge}</td>
            </tr>
        `;
    }).join("");
};

const renderHistory = (qStr = "") => {
    if (!dom.tableHistoryBody) return;
    let records = [...state.history];
    if (qStr) {
        records = records.filter(r => r.tenantName.toLowerCase().includes(qStr.toLowerCase()) || r.roomNumber.toLowerCase().includes(qStr.toLowerCase()));
    }
    records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    dom.tableHistoryBody.innerHTML = records.map(r => {
        return `
            <tr>
                <td class="ps-3 fw-bold">${r.tenantName}</td>
                <td><code>${r.aadhar}</code></td>
                <td>Room ${r.roomNumber}</td>
                <td>${new Date(r.checkoutDate).toLocaleDateString()}</td>
                <td class="fw-bold text-danger">${formatCurrency(r.damageDeductions + r.cleaningDeductions + r.otherDues)}</td>
                <td><code>${r.id ? r.id.substring(0, 10).toUpperCase() : "N/A"}</code></td>
                <td class="text-end pe-3">
                    <button class="btn btn-sm btn-outline-secondary" onclick="restoreHistoryRecord('${r.id}')"><i class="bi bi-arrow-counterclockwise"></i> Restore</button>
                </td>
            </tr>
        `;
    }).join("") || `<tr><td colspan="7" class="text-center py-5 text-muted">History archive is empty.</td></tr>`;
};

window.restoreHistoryRecord = (id) => {
    const hist = state.history.find(h => h.id === id);
    if (!hist) return;
    showConfirmation("Restore Historical Tenant", `Are you sure you want to restore ${hist.tenantName} back to active tenant list?`, async () => {
        showLoader(true);
        try {
            const batchObj = writeBatch(db);
            const tenantRef = doc(db, "tenants", hist.tenantId);
            batchObj.update(tenantRef, { status: "Active", roomId: hist.roomId });
            if (hist.roomId) {
                const roomRef = doc(db, "rooms", hist.roomId);
                batchObj.update(roomRef, { status: "Occupied" });
            }
            const histRef = doc(db, "history", id);
            batchObj.delete(histRef);
            await batchObj.commit();
            showToast(`Tenant ${hist.tenantName} successfully restored.`);
            logActivity("RESTORE", `Restored tenant ${hist.tenantName}.`);
        } catch (err) {
            showToast(err.message, "danger");
        }
        showLoader(false);
    });
};

dom.searchHistoryInput.addEventListener("input", (e) => {
    renderHistory(e.target.value);
});

window.exportData = (collectionName, type) => {
    let data = state[collectionName];
    if (data.length === 0) {
        showToast("No data to export", "warning");
        return;
    }
    if (type === "excel") {
        const ws = XLSX.utils.json_to_sheet(data.map(d => {
            let row = { ...d };
            delete row.id;
            delete row.photoUrl;
            if (row.docs) {
                row.docs = JSON.stringify(row.docs);
            }
            return row;
        }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, collectionName);
        XLSX.writeFile(wb, `${collectionName}_master_audit_${new Date().toISOString().split("T")[0]}.xlsx`);
        showToast("Excel spreadsheet ready.");
    } else if (type === "pdf") {
        const element = document.createElement("div");
        element.className = "bg-white p-4";
        element.innerHTML = `
            <h2 class="fw-bold mb-2">${collectionName.toUpperCase()} REPORT</h2>
            <p class="text-muted small">Generated on ${new Date().toLocaleDateString()}</p>
            <hr>
            <table class="table table-bordered align-middle">
                <thead>
                    <tr>${Object.keys(data[0]).filter(k => k !== "id" && k !== "photoUrl" && k !== "docs").map(k => `<th>${k.toUpperCase()}</th>`).join("")}</tr>
                </thead>
                <tbody>
                    ${data.map(row => `<tr>${Object.keys(row).filter(k => k !== "id" && k !== "photoUrl" && k !== "docs").map(k => `<td>${row[k]}</td>`).join("")}</tr>`).join("")}
                </tbody>
            </table>
        `;
        html2pdf().from(element).set({
            margin: 0.5,
            filename: `${collectionName}_pdf_export.pdf`,
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "letter", orientation: "landscape" }
        }).save();
        showToast("PDF generation initiated.");
    }
};

window.exportBackupJSON = () => {
    const backupObj = {
        rooms: state.rooms,
        tenants: state.tenants,
        rent: state.rent,
        electricity: state.electricity,
        history: state.history,
        meta: {
            exporter: "PropManager Pro Engine",
            exportTime: new Date().toISOString(),
            schema: "1.0.0"
        }
    };
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PM_SystemBackup_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("JSON cloud system backup generated successfully.");
};

dom.btnTriggerRestore.addEventListener("click", async () => {
    const file = dom.importBackupFile.files[0];
    if (!file) {
        showToast("Select a valid backup JSON file first.", "warning");
        return;
    }
    const confirmRestore = confirm("A database restoration will completely erase existing property clusters. Proceed with disaster recovery?");
    if (!confirmRestore) return;
    showLoader(true);
    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const recoveryObj = JSON.parse(e.target.result);
                if (!recoveryObj.rooms || !recoveryObj.tenants) {
                    showToast("Malformed backup file architecture. Restore aborted.", "danger");
                    showLoader(false);
                    return;
                }
                const collectionsToClean = ["rooms", "tenants", "rent", "electricity", "history"];
                for (const colName of collectionsToClean) {
                    const snap = await getDocs(collection(db, colName));
                    const cleanBatch = writeBatch(db);
                    snap.forEach(docObj => {
                        cleanBatch.delete(docObj.ref);
                    });
                    await cleanBatch.commit();
                }
                for (const colName of collectionsToClean) {
                    const rawList = recoveryObj[colName] || [];
                    if (rawList.length === 0) continue;
                    let batchObj = writeBatch(db);
                    let counter = 0;
                    for (const item of rawList) {
                        const originalId = item.id;
                        const dataCopy = { ...item };
                        delete dataCopy.id;
                        const docRef = doc(db, colName, originalId);
                        batchObj.set(docRef, dataCopy);
                        counter++;
                        if (counter === 400) {
                            await batchObj.commit();
                            batchObj = writeBatch(db);
                            counter = 0;
                        }
                    }
                    if (counter > 0) {
                        await batchObj.commit();
                    }
                }
                showToast("Data restoration finalized. Inventory reset complete.");
                logActivity("RECOVER", "Complete cloud database restore triggered.");
                setTimeout(() => location.reload(), 1500);
            } catch (err) {
                showToast(err.message, "danger");
                showLoader(false);
            }
        };
        reader.readAsText(file);
    } catch (err) {
        showToast(err.message, "danger");
        showLoader(false);
    }
});

let confirmationCallbackFn = null;
const showConfirmation = (title, msg, callback) => {
    document.getElementById("confirmationModalLabel").innerText = title;
    document.getElementById("confirmationModalMessage").innerText = msg;
    confirmationCallbackFn = callback;
    instances.confirmationModal.show();
};

dom.btnConfirmAction.addEventListener("click", () => {
    if (confirmationCallbackFn) {
        confirmationCallbackFn();
        confirmationCallbackFn = null;
    }
    instances.confirmationModal.hide();
});

const initializeDatabaseSubscriptions = () => {
    showLoader(true);
    let loadedWeight = 0;
    
    state.unsubscribes.forEach(unsub => unsub());
    state.unsubscribes = [];

    const checkSyncStatus = () => {
        loadedWeight++;
        if (loadedWeight >= 5) {
            showLoader(false);
            calculateDashboardStats();
            initCharts();
            renderDuesLedger();
        }
    };

    const unsubRooms = onSnapshot(collection(db, "rooms"), (snap) => {
        state.rooms = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderRooms();
        syncRoomDropdowns();
        checkSyncStatus();
    }, (err) => {
        showToast("Error synchronizing rooms: " + err.message, "danger");
        checkSyncStatus();
    });
    state.unsubscribes.push(unsubRooms);

    const unsubTenants = onSnapshot(collection(db, "tenants"), (snap) => {
        state.tenants = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderTenants();
        renderDocumentsView();
        syncTenantDropdowns();
        checkSyncStatus();
    }, (err) => {
        showToast("Error synchronizing tenants: " + err.message, "danger");
        checkSyncStatus();
    });
    state.unsubscribes.push(unsubTenants);

    const unsubRent = onSnapshot(collection(db, "rent"), (snap) => {
        state.rent = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderRent();
        checkSyncStatus();
    }, (err) => {
        showToast("Error synchronizing rent: " + err.message, "danger");
        checkSyncStatus();
    });
    state.unsubscribes.push(unsubRent);

    const unsubElec = onSnapshot(collection(db, "electricity"), (snap) => {
        state.electricity = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderElectricity();
        checkSyncStatus();
    }, (err) => {
        showToast("Error synchronizing utilities: " + err.message, "danger");
        checkSyncStatus();
    });
    state.unsubscribes.push(unsubElec);

    const unsubHistory = onSnapshot(collection(db, "history"), (snap) => {
        state.history = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderHistory();
        checkSyncStatus();
    }, (err) => {
        showToast("Error synchronizing history: " + err.message, "danger");
        checkSyncStatus();
    });
    state.unsubscribes.push(unsubHistory);
};

function renderDuesLedger() {
    if (!dom.tableDuesLedgerBody || !dom.duesLedgerMonth) return;
    const selectedMonthVal = dom.duesLedgerMonth.value;
    if (!selectedMonthVal) return;

    const [yearStr, monthStr] = selectedMonthVal.split("-");
    const selectedYear = Number(yearStr);
    const monthsOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const selectedMonthName = monthsOrder[parseInt(monthStr) - 1];

    const activeTenants = state.tenants.filter(t => t.status === "Active" || t.status === "Notice Period");

    if (activeTenants.length === 0) {
        dom.tableDuesLedgerBody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No active tenant profiles loaded.</td></tr>`;
        return;
    }

    dom.tableDuesLedgerBody.innerHTML = activeTenants.map(t => {
        const room = state.rooms.find(r => r.id === t.roomId);
        const expectedRent = Number(t.rent || 0);

        const paidRentRecords = state.rent.filter(r => r.tenantId === t.id && r.month === selectedMonthName && Number(r.year) === selectedYear);
        const paidRent = paidRentRecords.reduce((sum, r) => sum + Number(r.amountPaid || 0), 0);

        const rentDue = Math.max(0, expectedRent - paidRent);

        const elecBill = state.electricity.find(e => e.roomId === t.roomId && e.month === selectedMonthVal);
        
        let elecAmount = 0;
        let elecStatusBadge = `<span class="badge bg-secondary bg-opacity-10 text-secondary">No Meter Bill</span>`;
        let elecOutstanding = 0;

        if (elecBill) {
            elecAmount = Number(elecBill.totalAmount || 0);
            if (elecBill.status === "Paid") {
                elecStatusBadge = `<span class="badge bg-success bg-opacity-10 text-success">Paid</span>`;
            } else {
                elecStatusBadge = `<span class="badge bg-warning bg-opacity-10 text-warning">Pending</span>`;
                elecOutstanding = elecAmount;
            }
        }

        const combinedDues = rentDue + elecOutstanding;
        const duesBadgeClass = combinedDues > 0 ? "text-danger fw-bold" : "text-success fw-bold";

        return `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <img src="${t.photoUrl || 'https://placehold.co/40'}" class="rounded-circle border" width="30" height="30" style="object-fit:cover;">
                        <span class="fw-bold text-dark">${t.name}</span>
                    </div>
                </td>
                <td>${room ? `Room ${room.number}` : '<span class="text-muted">Unassigned</span>'}</td>
                <td>${formatCurrency(expectedRent)}</td>
                <td class="text-success">${formatCurrency(paidRent)}</td>
                <td class="${rentDue > 0 ? 'text-danger fw-bold' : 'text-muted'}">${formatCurrency(rentDue)}</td>
                <td>${elecBill ? formatCurrency(elecAmount) : '<span class="text-muted">N/A</span>'}</td>
                <td>${elecStatusBadge}</td>
                <td class="${duesBadgeClass}">${formatCurrency(combinedDues)}</td>
            </tr>
        `;
    }).join("");
}

function setupNavigationEngine() {
    const triggers = document.querySelectorAll(".sidebar .nav-link, .sidebar-brand");
    triggers.forEach(trig => {
        trig.addEventListener("click", (e) => {
            e.preventDefault();
            const targetView = trig.getAttribute("data-view");
            if (targetView) {
                switchView(targetView);
            }
        });
    });

    if (dom.sidebarToggle) {
        dom.sidebarToggle.addEventListener("click", () => {
            dom.sidebar.classList.add("active");
        });
    }
}

function initializeApplicationSettings() {
    const savedTheme = localStorage.getItem("propmanager_theme") || "light";
    document.documentElement.setAttribute("data-bs-theme", savedTheme);
    state.currentTheme = savedTheme;
    dom.themeToggler.innerHTML = savedTheme === "light" ? `<i class="bi bi-moon-stars-fill"></i>` : `<i class="bi bi-sun-fill"></i>`;
    dom.themeToggler.addEventListener("click", toggleTheme);
    const cachedLogs = localStorage.getItem("propmanager_activities");
    if (cachedLogs) {
        state.activityLog = JSON.parse(cachedLogs);
        renderActivityLog();
    }
    if (dom.duesLedgerMonth) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        dom.duesLedgerMonth.value = `${year}-${month}`;
        dom.duesLedgerMonth.addEventListener("change", renderDuesLedger);
    }
}

let isSignUpMode = false;

dom.btnToggleSignup.addEventListener("click", () => {
    isSignUpMode = !isSignUpMode;
    if (isSignUpMode) {
        document.querySelector("#login-screen h3 + p").innerText = "Create an administrator account";
        dom.btnLoginSubmit.innerText = "Register Administrator";
        dom.btnToggleSignup.innerText = "Have an account? Sign In";
    } else {
        document.querySelector("#login-screen h3 + p").innerText = "Please sign in to access your portfolio";
        dom.btnLoginSubmit.innerText = "Sign In";
        dom.btnToggleSignup.innerText = "Don't have an account? Sign Up";
    }
});

dom.formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = dom.loginEmail.value.trim();
    const password = dom.loginPassword;
    
    showLoader(true);
    try {
        if (isSignUpMode) {
            await createUserWithEmailAndPassword(auth, email, password.value);
            showToast("Administrator registered successfully.");
        } else {
            await signInWithEmailAndPassword(auth, email, password.value);
            showToast("Successfully authenticated.");
        }
    } catch (err) {
        showToast(err.message, "danger");
    }
    showLoader(false);
});

dom.btnLogout.addEventListener("click", async () => {
    showLoader(true);
    try {
        state.unsubscribes.forEach(unsub => unsub());
        state.unsubscribes = [];
        await signOut(auth);
        showToast("Logged out safely.");
    } catch (err) {
        showToast(err.message, "danger");
    }
    showLoader(false);
});

function setupAuthObserver() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            dom.loginScreen.classList.add("d-none");
            dom.userDisplayEmail.innerText = user.email;
            initializeDatabaseSubscriptions();
        } else {
            dom.loginScreen.classList.remove("d-none");
            state.rooms = [];
            state.tenants = [];
            state.rent = [];
            state.electricity = [];
            state.history = [];
            renderRooms();
            renderTenants();
            renderRent();
            renderElectricity();
            renderHistory();
        }
    });
}

function mainAppBootloader() {
    initializeApplicationSettings();
    setupNavigationEngine();
    setupAuthObserver();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mainAppBootloader);
} else {
    mainAppBootloader();
}
