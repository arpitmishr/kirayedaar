// ==========================================
// 1. FIREBASE CONFIGURATION & INITIALIZATION
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyB-dS8rEXwAwfdpXQhwhLNhsQYq6ug3XWA",
    authDomain: "tenant-75f84.firebaseapp.com",
    projectId: "tenant-75f84",
    storageBucket: "tenant-75f84.firebasestorage.app",
    messagingSenderId: "882401370229",
    appId: "1:882401370229:web:85d5c82cf49c7e1c8dd83c"
};

// Connect Firebase automatically
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

console.log("Firebase connected automatically.", { db, storage });

// ==========================================
// 2. UTILITY SYSTEMS
// ==========================================

/**
 * Loading Spinner System
 * @param {boolean} show - True to display spinner, false to hide
 */
function toggleLoader(show) {
    const spinner = document.getElementById('loading-spinner');
    if (show) {
        spinner.classList.remove('d-none');
        spinner.classList.add('d-flex');
    } else {
        spinner.classList.remove('d-flex');
        spinner.classList.add('d-none');
    }
}

/**
 * Bootstrap Toast Notification System
 * @param {string} message - Notification text
 * @param {string} type - 'success', 'danger', 'warning', 'info'
 */
function showToast(message, type = 'success') {
    const toastEl = document.getElementById('system-toast');
    const toastMsg = document.getElementById('system-toast-message');
    
    // Reset classes
    toastEl.className = 'toast align-items-center text-white border-0';
    
    // Add Bootstrap color class based on type
    toastEl.classList.add(`bg-${type}`);
    
    // Set message and show
    toastMsg.textContent = message;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

/**
 * Confirmation Modal System
 * @param {string} title - Modal title
 * @param {string} message - Question/Warning message
 * @param {function} onConfirm - Callback function executed on confirm
 */
let confirmCallback = null; // Store callback globally for the modal
function showConfirmation(title, message, onConfirm) {
    document.getElementById('confirmationModalLabel').textContent = title;
    document.getElementById('confirmationModalMessage').textContent = message;
    
    confirmCallback = onConfirm;
    
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    confirmModal.show();
}

// Handle Modal Confirm Button click
document.getElementById('btn-confirm-action').addEventListener('click', () => {
    const confirmModalEl = document.getElementById('confirmationModal');
    const modalInstance = bootstrap.Modal.getInstance(confirmModalEl);
    
    if (confirmCallback) {
        confirmCallback();
        confirmCallback = null; // reset
    }
    
    modalInstance.hide();
});


// ==========================================
// 3. SINGLE PAGE APPLICATION (SPA) ROUTING
// ==========================================

/**
 * Navigate to a specific view
 * @param {string} targetView - the data-target name (e.g., 'dashboard', 'rooms')
 */
function navigateTo(targetView) {
    // 1. Hide all views
    const views = document.querySelectorAll('.app-view');
    views.forEach(view => {
        view.classList.add('d-none');
    });

    // 2. Show target view
    const viewToShow = document.getElementById(`view-${targetView}`);
    if (viewToShow) {
        viewToShow.classList.remove('d-none');
    }

    // 3. Update active state on Navigation
    const navItems = document.querySelectorAll('.nav-menu-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-target') === targetView) {
            item.classList.add('active');
        }
    });
}

// Attach click events to Navigation items
document.querySelectorAll('[data-target]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default anchor behavior
        const target = e.currentTarget.getAttribute('data-target');
        navigateTo(target);

        // Auto collapse mobile menu after click
        const navbarCollapse = document.getElementById('navbarNav');
        if (navbarCollapse.classList.contains('show')) {
            bootstrap.Collapse.getInstance(navbarCollapse).hide();
        }
    });
});

// ==========================================
// 4. APP INITIALIZATION
// ==========================================
function initApp() {
    // Start on Dashboard
    navigateTo('dashboard');
    
    // Test utility systems on load (Uncomment to test)
    // toggleLoader(true);
    // setTimeout(() => {
    //     toggleLoader(false);
    //     showToast("System loaded successfully", "success");
    // }, 1000);
}

// Run app initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
