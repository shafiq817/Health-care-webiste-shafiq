/* ============================================================
   PREMIUM HEALTHCARE MANAGEMENT SYSTEM — APPLICATION LOGIC
   Connected to Flask REST API backend at /api/*
   ============================================================ */

// ========================== DARK MODE INITIALIZATION ==========================
let darkMode = localStorage.getItem('healthcare_darkmode') === 'true';
if (darkMode) document.body.classList.add('dark-mode');

// ========================== API LAYER & CONNECTIVITY ==========================

// Dynamically connect to the hosting origin if loaded via http/https, fallback to localhost:5000
const API_BASE = window.location.protocol.startsWith('http') 
    ? window.location.origin 
    : 'http://localhost:5000';

let isOffline = false;
let reconnectInterval = null;
const originalFetch = window.fetch;

// Intercept global fetch to detect API connectivity errors
window.fetch = async function(...args) {
    try {
        const response = await originalFetch(...args);
        // If connection succeeded and is for our backend API, clear offline state
        if (args[0] && typeof args[0] === 'string' && args[0].startsWith(API_BASE)) {
            handleBackendOnline();
        }
        return response;
    } catch (error) {
        // Connection failed (network error / backend offline)
        if (args[0] && typeof args[0] === 'string' && args[0].startsWith(API_BASE)) {
            handleBackendOffline();
        }
        throw error;
    }
};

function handleBackendOffline() {
    if (isOffline) return;
    isOffline = true;
    
    // Set API URL text in warning overlay
    const apiBaseEl = document.getElementById('offlineApiBase');
    if (apiBaseEl) apiBaseEl.textContent = API_BASE;
    
    // Show the offline warning modal
    const overlay = document.getElementById('offlineOverlay');
    if (overlay) overlay.classList.add('open');
    
    // Begin auto-reconnect background checks
    startOfflinePolling();
}

function handleBackendOnline() {
    if (!isOffline) return;
    isOffline = false;
    
    // Hide the offline warning modal
    const overlay = document.getElementById('offlineOverlay');
    if (overlay) overlay.classList.remove('open');
    
    // Clear auto-reconnect polling timer
    if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
    }
    
    showToast('🚀 Connected to backend. Reloading data...', 'success');
    
    // Reload dashboard or the active tab
    const activeTabBtn = document.querySelector('.tab-btn.active');
    if (activeTabBtn) {
        const tabName = activeTabBtn.getAttribute('data-tab');
        switchTab(tabName);
    } else {
        loadDashboard();
    }
}

async function checkBackendConnectivity() {
    const retryBtn = document.getElementById('retryConnectBtn');
    if (retryBtn) {
        retryBtn.disabled = true;
        retryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    }
    
    try {
        const res = await originalFetch(`${API_BASE}/api/dashboard`);
        if (res.ok) {
            handleBackendOnline();
        } else {
            showToast('Backend reached, but returned an error.', 'warning');
        }
    } catch (err) {
        console.warn('Manual connection check failed.');
        showToast('Backend still offline. Please check that app.py is running.', 'error');
    } finally {
        if (retryBtn) {
            retryBtn.disabled = false;
            retryBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Retry Connection';
        }
    }
}

function startOfflinePolling() {
    if (reconnectInterval) clearInterval(reconnectInterval);
    reconnectInterval = setInterval(async () => {
        try {
            const res = await originalFetch(`${API_BASE}/api/dashboard`);
            if (res.ok) {
                handleBackendOnline();
            }
        } catch (err) {
            // Still offline, fail silently
        }
    }, 3000);
}

// Export connection test globally for onclick event handlers
window.checkBackendConnectivity = checkBackendConnectivity;

const API = {
    // Dashboard
    async getDashboard() {
        const res = await fetch(`${API_BASE}/api/dashboard`);
        if (!res.ok) throw new Error('Failed to load dashboard');
        return res.json();
    },

    // Patients
    async getPatients(search = '') {
        const q = search ? `?search=${encodeURIComponent(search)}` : '';
        const res = await fetch(`${API_BASE}/api/patients${q}`);
        if (!res.ok) throw new Error('Failed to load patients');
        return res.json();
    },
    async addPatient(data) {
        const res = await fetch(`${API_BASE}/api/patients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to add patient');
        return res.json();
    },
    async updatePatient(id, data) {
        const res = await fetch(`${API_BASE}/api/patients/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update patient');
        return res.json();
    },
    async deletePatient(id) {
        const res = await fetch(`${API_BASE}/api/patients/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete patient');
        return res.json();
    },

    // Doctors
    async getDoctors() {
        const res = await fetch(`${API_BASE}/api/doctors`);
        if (!res.ok) throw new Error('Failed to load doctors');
        return res.json();
    },
    async addDoctor(data) {
        const res = await fetch(`${API_BASE}/api/doctors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to add doctor');
        return res.json();
    },
    async updateDoctor(id, data) {
        const res = await fetch(`${API_BASE}/api/doctors/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update doctor');
        return res.json();
    },
    async toggleDoctor(id) {
        const res = await fetch(`${API_BASE}/api/doctors/${id}/toggle`, { method: 'PUT' });
        if (!res.ok) throw new Error('Failed to toggle doctor');
        return res.json();
    },
    async deleteDoctor(id) {
        const res = await fetch(`${API_BASE}/api/doctors/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete doctor');
        return res.json();
    },

    // Appointments
    async getAppointments() {
        const res = await fetch(`${API_BASE}/api/appointments`);
        if (!res.ok) throw new Error('Failed to load appointments');
        return res.json();
    },
    async addAppointment(data) {
        const res = await fetch(`${API_BASE}/api/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to add appointment');
        return res.json();
    },
    async updateAppointment(id, data) {
        const res = await fetch(`${API_BASE}/api/appointments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update appointment');
        return res.json();
    },

    // Bills
    async getBills() {
        const res = await fetch(`${API_BASE}/api/bills`);
        if (!res.ok) throw new Error('Failed to load bills');
        return res.json();
    },
    async addBill(data) {
        const res = await fetch(`${API_BASE}/api/bills`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to add bill');
        return res.json();
    },
    async payBill(id) {
        const res = await fetch(`${API_BASE}/api/bills/${id}/pay`, { method: 'PUT' });
        if (!res.ok) throw new Error('Failed to pay bill');
        return res.json();
    },

    // Prescriptions
    async getPrescriptions() {
        const res = await fetch(`${API_BASE}/api/prescriptions`);
        if (!res.ok) throw new Error('Failed to load prescriptions');
        return res.json();
    },
    async addPrescription(data) {
        const res = await fetch(`${API_BASE}/api/prescriptions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to add prescription');
        return res.json();
    },

    // System
    async resetSystem() {
        const res = await fetch(`${API_BASE}/api/reset`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to reset system');
        return res.json();
    }
};


// ========================== TOAST NOTIFICATIONS ==========================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle'
    };
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="${icons[type] || icons.info}"></i><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}


// ========================== STATE ==========================

let revenueChart = null;
let appointmentsChart = null;
let patientsCache = [];
let doctorsCache = [];


// ========================== INITIALIZATION ==========================

document.addEventListener('DOMContentLoaded', () => {
    // Sync dark mode icon
    const icon = document.querySelector('#darkModeBtn i');
    if (icon && darkMode) {
        icon.className = 'fas fa-sun';
    }
    loadDashboard();
});


// ========================== TAB NAVIGATION ==========================

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        }
    });

    const loaders = {
        dashboard: loadDashboard,
        patients: loadPatients,
        doctors: loadDoctors,
        appointments: loadAppointments,
        billing: loadBills,
        prescriptions: loadPrescriptions,
        liveHospital: loadLiveHospital
    };
    if (loaders[tabName]) loaders[tabName]();
}


// ========================== DASHBOARD ==========================

async function loadDashboard() {
    try {
        const data = await API.getDashboard();
        const patients = await API.getPatients();
        const doctors = await API.getDoctors();

        // Stats cards
        const statsGrid = document.getElementById('statsGrid');
        statsGrid.innerHTML = `
            <div class="stat-card card-purple stagger-item" style="--i: 0" onclick="switchTab('patients')">
                <div class="stat-label">Total Patients</div>
                <div class="stat-value">${data.totalPatients}</div>
                <div class="stat-sub">Registered patients</div>
                <i class="fas fa-users stat-icon"></i>
            </div>
            <div class="stat-card card-cyan stagger-item" style="--i: 1" onclick="switchTab('doctors')">
                <div class="stat-label">Doctors</div>
                <div class="stat-value">${data.totalDoctors}</div>
                <div class="stat-sub">Medical professionals</div>
                <i class="fas fa-user-md stat-icon"></i>
            </div>
            <div class="stat-card card-green stagger-item" style="--i: 2" onclick="switchTab('appointments')">
                <div class="stat-label">Appointments</div>
                <div class="stat-value">${data.scheduledAppointments}</div>
                <div class="stat-sub">Scheduled this period</div>
                <i class="fas fa-calendar-check stat-icon"></i>
            </div>
            <div class="stat-card card-amber stagger-item" style="--i: 3" onclick="switchTab('billing')">
                <div class="stat-label">Revenue</div>
                <div class="stat-value">$${data.totalRevenue.toLocaleString()}</div>
                <div class="stat-sub">$${data.pendingRevenue.toLocaleString()} pending</div>
                <i class="fas fa-dollar-sign stat-icon"></i>
            </div>
            <div class="stat-card card-rose stagger-item" style="--i: 4" onclick="switchTab('prescriptions')">
                <div class="stat-label">Prescriptions</div>
                <div class="stat-value">${data.activePrescriptions}</div>
                <div class="stat-sub">Active prescriptions</div>
                <i class="fas fa-prescription-bottle stat-icon"></i>
            </div>
        `;

        // Upcoming appointments table
        const tbody = document.querySelector('#upcomingAppointments tbody');
        if (!data.recentAppointments || data.recentAppointments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px;">No upcoming appointments</td></tr>';
        } else {
            tbody.innerHTML = data.recentAppointments.map((a, index) => {
                const patient = patients.find(p => p.id === a.patientId);
                const doctor = doctors.find(d => d.id === a.doctorId);
                const dt = new Date(a.dateTime);
                return `<tr class="stagger-item" style="--i: ${Math.min(index, 10)}">
                    <td><strong>${a.id}</strong></td>
                    <td>${patient ? patient.name : a.patientId}</td>
                    <td>${doctor ? doctor.name : a.doctorId}</td>
                    <td>${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td><span class="badge badge-info">Scheduled</span></td>
                </tr>`;
            }).join('');
        }

        // Charts
        renderCharts(data);
    } catch (err) {
        console.error('Dashboard load error:', err);
        showToast('Failed to load dashboard data', 'error');
    }
}

function renderCharts(data) {
    const chartColors = {
        purple: 'rgba(99, 102, 241, 0.8)',
        cyan: 'rgba(6, 182, 212, 0.8)',
        green: 'rgba(16, 185, 129, 0.8)',
        amber: 'rgba(245, 158, 11, 0.8)',
        rose: 'rgba(244, 63, 94, 0.8)'
    };

    // Revenue Chart
    const revCtx = document.getElementById('revenueChart');
    if (revCtx) {
        if (revenueChart) revenueChart.destroy();
        revenueChart = new Chart(revCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue ($)',
                    data: [
                        Math.round(data.totalRevenue * 0.6),
                        Math.round(data.totalRevenue * 0.75),
                        Math.round(data.totalRevenue * 0.85),
                        Math.round(data.totalRevenue * 0.9),
                        Math.round(data.totalRevenue * 0.95),
                        data.totalRevenue
                    ],
                    borderColor: chartColors.purple,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: chartColors.purple,
                    borderWidth: 2.5
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Inter' } } },
                    x: { grid: { display: false }, ticks: { font: { family: 'Inter' } } }
                }
            }
        });
    }

    // Appointments Chart
    const apptCtx = document.getElementById('appointmentsChart');
    if (apptCtx) {
        if (appointmentsChart) appointmentsChart.destroy();
        appointmentsChart = new Chart(apptCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Scheduled', 'Completed', 'Cancelled'],
                datasets: [{
                    data: [
                        data.scheduledAppointments,
                        Math.max(1, data.totalAppointments - data.scheduledAppointments),
                        0
                    ],
                    backgroundColor: [chartColors.cyan, chartColors.green, chartColors.rose],
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                cutout: '65%',
                plugins: {
                    legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 12 }, padding: 16 } }
                }
            }
        });
    }
}


// ========================== PATIENTS ==========================

async function loadPatients() {
    try {
        const patients = await API.getPatients();
        patientsCache = patients;
        renderPatientsTable(patients);
    } catch (err) {
        console.error('Load patients error:', err);
        showToast('Failed to load patients', 'error');
    }
}

function renderPatientsTable(patients) {
    const tbody = document.querySelector('#patientsTable tbody');
    if (patients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px;"><i class="fas fa-users" style="font-size:2em;opacity:0.3;display:block;margin-bottom:8px;"></i>No patients found</td></tr>';
        return;
    }
    tbody.innerHTML = patients.map((p, index) => `
        <tr class="stagger-item" style="--i: ${Math.min(index, 15)}">
            <td><strong>${p.id}</strong></td>
            <td>${p.name}</td>
            <td>${p.age}</td>
            <td>${p.gender}</td>
            <td>${p.contact}</td>
            <td>${p.medicalHistory || '—'}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-outline btn-sm" onclick="editPatient('${p.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-danger btn-sm" onclick="deletePatient('${p.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function searchPatients() {
    const query = document.getElementById('patientSearch').value.trim();
    try {
        const patients = await API.getPatients(query);
        patientsCache = patients;
        renderPatientsTable(patients);
    } catch (err) {
        // Fallback to client-side filtering
        const filtered = patientsCache.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.id.toLowerCase().includes(query.toLowerCase()) ||
            (p.contact || '').toLowerCase().includes(query.toLowerCase())
        );
        renderPatientsTable(filtered);
    }
}

function showAddPatientModal() {
    document.getElementById('patientModalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Add New Patient';
    document.getElementById('patientForm').reset();
    document.getElementById('patientEditId').value = '';
    openModal('patientModal');
}

function editPatient(id) {
    const p = patientsCache.find(x => x.id === id);
    if (!p) return;
    document.getElementById('patientModalTitle').innerHTML = '<i class="fas fa-user-edit"></i> Edit Patient';
    document.getElementById('patientEditId').value = p.id;
    document.getElementById('patientName').value = p.name;
    document.getElementById('patientAge').value = p.age;
    document.getElementById('patientGender').value = p.gender;
    document.getElementById('patientContact').value = p.contact;
    document.getElementById('patientAddress').value = p.address || '';
    document.getElementById('patientMedicalHistory').value = p.medicalHistory || '';
    openModal('patientModal');
}

async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    try {
        await API.deletePatient(id);
        showToast('Patient deleted successfully', 'success');
        loadPatients();
    } catch (err) {
        console.error('Delete patient error:', err);
        showToast('Failed to delete patient', 'error');
    }
}

document.getElementById('patientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('patientEditId').value;
    const data = {
        name: document.getElementById('patientName').value,
        age: parseInt(document.getElementById('patientAge').value),
        gender: document.getElementById('patientGender').value,
        contact: document.getElementById('patientContact').value,
        address: document.getElementById('patientAddress').value,
        medicalHistory: document.getElementById('patientMedicalHistory').value
    };

    try {
        if (editId) {
            await API.updatePatient(editId, data);
            showToast('Patient updated successfully', 'success');
        } else {
            await API.addPatient(data);
            showToast('Patient added successfully', 'success');
        }
        closeModal('patientModal');
        loadPatients();
    } catch (err) {
        console.error('Save patient error:', err);
        showToast('Failed to save patient', 'error');
    }
});


// ========================== DOCTORS ==========================

async function loadDoctors() {
    try {
        const doctors = await API.getDoctors();
        doctorsCache = doctors;
        const tbody = document.querySelector('#doctorsTable tbody');
        if (doctors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px;">No doctors found</td></tr>';
            return;
        }
        tbody.innerHTML = doctors.map((d, index) => `
            <tr class="stagger-item" style="--i: ${Math.min(index, 15)}">
                <td><strong>${d.id}</strong></td>
                <td>${d.name}</td>
                <td>${d.specialization}</td>
                <td>${d.contact}</td>
                <td>${d.schedule || '—'}</td>
                <td><span class="badge ${d.available ? 'badge-success' : 'badge-danger'}">${d.available ? '● Available' : '● Unavailable'}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn-outline btn-sm" onclick="editDoctor('${d.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-sm ${d.available ? 'btn-danger' : 'btn-success'}" onclick="toggleDoctorAvailability('${d.id}')">${d.available ? 'Disable' : 'Enable'}</button>
                        <button class="btn-danger btn-sm" onclick="deleteDoctor('${d.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Load doctors error:', err);
        showToast('Failed to load doctors', 'error');
    }
}

function showAddDoctorModal() {
    document.getElementById('doctorModalTitle').innerHTML = '<i class="fas fa-user-md"></i> Add New Doctor';
    document.getElementById('doctorForm').reset();
    document.getElementById('doctorEditId').value = '';
    openModal('doctorModal');
}

function editDoctor(id) {
    const d = doctorsCache.find(x => x.id === id);
    if (!d) return;
    document.getElementById('doctorModalTitle').innerHTML = '<i class="fas fa-user-md"></i> Edit Doctor';
    document.getElementById('doctorEditId').value = d.id;
    document.getElementById('doctorName').value = d.name;
    document.getElementById('doctorSpecialization').value = d.specialization;
    document.getElementById('doctorContact').value = d.contact;
    document.getElementById('doctorSchedule').value = d.schedule || '';
    openModal('doctorModal');
}

async function toggleDoctorAvailability(id) {
    try {
        const result = await API.toggleDoctor(id);
        showToast(`Doctor ${result.available ? 'enabled' : 'disabled'}`, 'success');
        loadDoctors();
    } catch (err) {
        console.error('Toggle doctor error:', err);
        showToast('Failed to toggle doctor availability', 'error');
    }
}

async function deleteDoctor(id) {
    if (!confirm('Delete this doctor?')) return;
    try {
        await API.deleteDoctor(id);
        showToast('Doctor deleted', 'success');
        loadDoctors();
    } catch (err) {
        console.error('Delete doctor error:', err);
        showToast('Failed to delete doctor', 'error');
    }
}

document.getElementById('doctorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('doctorEditId').value;
    const data = {
        name: document.getElementById('doctorName').value,
        specialization: document.getElementById('doctorSpecialization').value,
        contact: document.getElementById('doctorContact').value,
        schedule: document.getElementById('doctorSchedule').value
    };

    try {
        if (editId) {
            await API.updateDoctor(editId, data);
            showToast('Doctor updated', 'success');
        } else {
            await API.addDoctor(data);
            showToast('Doctor added', 'success');
        }
        closeModal('doctorModal');
        loadDoctors();
    } catch (err) {
        console.error('Save doctor error:', err);
        showToast('Failed to save doctor', 'error');
    }
});


// ========================== APPOINTMENTS ==========================

async function loadAppointments() {
    try {
        const appointments = await API.getAppointments();
        const patients = await API.getPatients();
        const doctors = await API.getDoctors();
        patientsCache = patients;
        doctorsCache = doctors;

        const tbody = document.querySelector('#appointmentsTable tbody');
        if (appointments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px;">No appointments found</td></tr>';
            return;
        }
        tbody.innerHTML = appointments.map((a, index) => {
            const patient = patients.find(p => p.id === a.patientId);
            const doctor = doctors.find(d => d.id === a.doctorId);
            const dt = new Date(a.dateTime);
            const badgeClass = a.status === 'Scheduled' ? 'badge-info' :
                               a.status === 'Completed' ? 'badge-success' : 'badge-danger';
            return `<tr class="stagger-item" style="--i: ${Math.min(index, 15)}">
                <td><strong>${a.id}</strong></td>
                <td>${patient ? patient.name : a.patientId}</td>
                <td>${doctor ? doctor.name : a.doctorId}</td>
                <td>${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                <td>${a.reason || '—'}</td>
                <td><span class="badge ${badgeClass}">${a.status}</span></td>
                <td>
                    <div class="action-btns">
                        ${a.status === 'Scheduled' ? `
                            <button class="btn-success btn-sm" onclick="updateAppointmentStatus('${a.id}', 'Completed')"><i class="fas fa-check"></i></button>
                            <button class="btn-danger btn-sm" onclick="updateAppointmentStatus('${a.id}', 'Cancelled')"><i class="fas fa-times"></i></button>
                        ` : '—'}
                    </div>
                </td>
            </tr>`;
        }).join('');
    } catch (err) {
        console.error('Load appointments error:', err);
        showToast('Failed to load appointments', 'error');
    }
}

async function showAddAppointmentModal() {
    try {
        const patients = await API.getPatients();
        const doctors = await API.getDoctors();

        const patientSelect = document.getElementById('appointmentPatientId');
        patientSelect.innerHTML = '<option value="">Select Patient</option>' +
            patients.map(p => `<option value="${p.id}">${p.name} (${p.id})</option>`).join('');

        const doctorSelect = document.getElementById('appointmentDoctorId');
        doctorSelect.innerHTML = '<option value="">Select Doctor</option>' +
            doctors.filter(d => d.available).map(d => `<option value="${d.id}">${d.name} — ${d.specialization}</option>`).join('');

        document.getElementById('appointmentForm').reset();
        openModal('appointmentModal');
    } catch (err) {
        console.error('Load modal data error:', err);
        showToast('Failed to load form data', 'error');
    }
}

async function updateAppointmentStatus(id, status) {
    try {
        await API.updateAppointment(id, { status });
        showToast(`Appointment ${status.toLowerCase()}`, status === 'Completed' ? 'success' : 'warning');
        loadAppointments();
    } catch (err) {
        console.error('Update appointment error:', err);
        showToast('Failed to update appointment', 'error');
    }
}

document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        patientId: document.getElementById('appointmentPatientId').value,
        doctorId: document.getElementById('appointmentDoctorId').value,
        dateTime: document.getElementById('appointmentDateTime').value,
        reason: document.getElementById('appointmentReason').value
    };

    try {
        await API.addAppointment(data);
        showToast('Appointment scheduled!', 'success');
        closeModal('appointmentModal');
        loadAppointments();
    } catch (err) {
        console.error('Add appointment error:', err);
        showToast('Failed to schedule appointment', 'error');
    }
});


// ========================== BILLING ==========================

async function loadBills() {
    try {
        const bills = await API.getBills();
        const patients = await API.getPatients();
        patientsCache = patients;

        const tbody = document.querySelector('#billsTable tbody');
        if (bills.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px;">No bills found</td></tr>';
            return;
        }
        tbody.innerHTML = bills.map((b, index) => {
            const patient = patients.find(p => p.id === b.patientId);
            return `<tr class="stagger-item" style="--i: ${Math.min(index, 15)}">
                <td><strong>${b.id}</strong></td>
                <td>${patient ? patient.name : b.patientId}</td>
                <td>${b.description}</td>
                <td><strong>$${b.amount.toLocaleString()}</strong></td>
                <td>${b.date}</td>
                <td><span class="badge ${b.paid ? 'badge-success' : 'badge-danger'}">${b.paid ? '✓ Paid' : '✗ Unpaid'}</span></td>
                <td>
                    ${!b.paid ? `<button class="btn-success btn-sm" onclick="payBill('${b.id}')"><i class="fas fa-credit-card"></i> Pay</button>` : '<span style="color:var(--text-muted);">—</span>'}
                </td>
            </tr>`;
        }).join('');
    } catch (err) {
        console.error('Load bills error:', err);
        showToast('Failed to load bills', 'error');
    }
}

async function showAddBillModal() {
    try {
        const patients = await API.getPatients();
        const select = document.getElementById('billPatientId');
        select.innerHTML = '<option value="">Select Patient</option>' +
            patients.map(p => `<option value="${p.id}">${p.name} (${p.id})</option>`).join('');
        document.getElementById('billForm').reset();
        openModal('billModal');
    } catch (err) {
        console.error('Load bill modal error:', err);
        showToast('Failed to load form data', 'error');
    }
}

async function payBill(id) {
    try {
        await API.payBill(id);
        showToast('Bill marked as paid', 'success');
        loadBills();
    } catch (err) {
        console.error('Pay bill error:', err);
        showToast('Failed to pay bill', 'error');
    }
}

document.getElementById('billForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        patientId: document.getElementById('billPatientId').value,
        description: document.getElementById('billDescription').value,
        amount: parseFloat(document.getElementById('billAmount').value)
    };

    try {
        await API.addBill(data);
        showToast('Bill generated!', 'success');
        closeModal('billModal');
        loadBills();
    } catch (err) {
        console.error('Add bill error:', err);
        showToast('Failed to generate bill', 'error');
    }
});


// ========================== PRESCRIPTIONS ==========================

async function loadPrescriptions() {
    try {
        const prescriptions = await API.getPrescriptions();
        const patients = await API.getPatients();
        const doctors = await API.getDoctors();

        const tbody = document.querySelector('#prescriptionsTable tbody');
        if (prescriptions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:30px;">No prescriptions found</td></tr>';
            return;
        }
        tbody.innerHTML = prescriptions.map((rx, index) => {
            const patient = patients.find(p => p.id === rx.patientId);
            const doctor = doctors.find(d => d.id === rx.doctorId);
            return `<tr class="stagger-item" style="--i: ${Math.min(index, 15)}">
                <td><strong>${rx.id}</strong></td>
                <td>${patient ? patient.name : rx.patientId}</td>
                <td>${doctor ? doctor.name : rx.doctorId}</td>
                <td>${rx.medication}</td>
                <td>${rx.dosage}</td>
                <td>${rx.duration || '—'}</td>
                <td>${rx.date}</td>
                <td><span class="badge ${rx.status === 'Active' ? 'badge-success' : 'badge-warning'}">${rx.status}</span></td>
            </tr>`;
        }).join('');
    } catch (err) {
        console.error('Load prescriptions error:', err);
        showToast('Failed to load prescriptions', 'error');
    }
}

async function showAddPrescriptionModal() {
    try {
        const patients = await API.getPatients();
        const doctors = await API.getDoctors();
        document.getElementById('prescriptionPatientId').innerHTML = '<option value="">Select Patient</option>' +
            patients.map(p => `<option value="${p.id}">${p.name} (${p.id})</option>`).join('');
        document.getElementById('prescriptionDoctorId').innerHTML = '<option value="">Select Doctor</option>' +
            doctors.map(d => `<option value="${d.id}">${d.name} — ${d.specialization}</option>`).join('');
        document.getElementById('prescriptionForm').reset();
        openModal('prescriptionModal');
    } catch (err) {
        console.error('Load prescription modal error:', err);
        showToast('Failed to load form data', 'error');
    }
}

document.getElementById('prescriptionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        patientId: document.getElementById('prescriptionPatientId').value,
        doctorId: document.getElementById('prescriptionDoctorId').value,
        medication: document.getElementById('prescriptionMedication').value,
        dosage: document.getElementById('prescriptionDosage').value,
        duration: document.getElementById('prescriptionDuration').value
    };

    try {
        await API.addPrescription(data);
        showToast('Prescription created!', 'success');
        closeModal('prescriptionModal');
        loadPrescriptions();
    } catch (err) {
        console.error('Add prescription error:', err);
        showToast('Failed to create prescription', 'error');
    }
});


// ========================== MODALS ==========================

function openModal(id) {
    document.getElementById(id).classList.add('open');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

// Close modal on outside click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('open');
        }
    });
});


// ========================== DARK MODE ==========================

function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('healthcare_darkmode', darkMode);
    
    const icon = document.querySelector('#darkModeBtn i');
    if (icon) {
        icon.className = darkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    showToast(darkMode ? '🌙 Dark mode enabled' : '☀️ Light mode enabled', 'info');
}


// ========================== EXPORT & PRINT ==========================

async function exportData() {
    try {
        const data = {
            patients: await API.getPatients(),
            doctors: await API.getDoctors(),
            appointments: await API.getAppointments(),
            bills: await API.getBills(),
            prescriptions: await API.getPrescriptions(),
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `healthcare_export_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Data exported successfully!', 'success');
    } catch (err) {
        console.error('Export error:', err);
        showToast('Failed to export data', 'error');
    }
}

function printReport() {
    window.print();
    showToast('Print dialog opened', 'info');
}

async function resetSystem() {
    if (!confirm('⚠️ This will reset ALL data. Are you sure?')) return;
    try {
        await API.resetSystem();
        showToast('System data reset. Reloading...', 'warning');
        setTimeout(() => location.reload(), 1500);
    } catch (err) {
        console.error('Reset error:', err);
        showToast('Failed to reset system', 'error');
    }
}


// ========================== AI CHAT ASSISTANT ==========================

function toggleAIChat() {
    const chatWindow = document.getElementById('aiChatWindow');
    chatWindow.classList.toggle('open');
}

function handleAIKeypress(event) {
    if (event.key === 'Enter') sendAIMessage();
}

function sendSuggestion(text) {
    document.getElementById('aiInput').value = text;
    sendAIMessage();
}

function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    if (!message) return;
    input.value = '';

    const messagesDiv = document.getElementById('aiMessages');

    // User message
    messagesDiv.innerHTML += `
        <div class="message user">
            <div class="message-content">${escapeHtml(message)}</div>
        </div>`;

    // Typing indicator
    messagesDiv.innerHTML += `
        <div class="message ai" id="typingIndicator">
            <div class="message-content">
                <div class="typing-indicator"><span></span><span></span><span></span></div>
            </div>
        </div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Generate response
    setTimeout(async () => {
        const response = await generateAIResponse(message);
        const typing = document.getElementById('typingIndicator');
        if (typing) typing.remove();

        messagesDiv.innerHTML += `
            <div class="message ai">
                <div class="message-content">${response}</div>
            </div>`;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 1200);
}

async function generateAIResponse(msg) {
    const lower = msg.toLowerCase();

    // Statistics query — fetch live data from backend
    if (lower.includes('statistic') || lower.includes('stats') || lower.includes('report') || lower.includes('how many')) {
        try {
            const data = await API.getDashboard();
            return `📊 <strong>System Statistics</strong><br><br>
                👥 Total Patients: <strong>${data.totalPatients}</strong><br>
                🩺 Total Doctors: <strong>${data.totalDoctors}</strong><br>
                📅 Scheduled Appointments: <strong>${data.scheduledAppointments}</strong><br>
                💰 Total Revenue: <strong>$${data.totalRevenue.toLocaleString()}</strong><br>
                ⏳ Pending Revenue: <strong>$${data.pendingRevenue.toLocaleString()}</strong><br>
                💊 Active Prescriptions: <strong>${data.activePrescriptions}</strong>`;
        } catch {
            return '📊 Unable to load statistics at this time. Please try again later.';
        }
    }

    // Medical symptoms
    if (lower.includes('flu') || lower.includes('cold') || lower.includes('fever')) {
        return `🩺 <strong>Flu/Cold Symptoms</strong><br><br>
            Common symptoms include:<br>
            • Fever (100°F / 38°C or higher)<br>
            • Body aches and chills<br>
            • Sore throat and runny nose<br>
            • Fatigue and weakness<br><br>
            <strong>Recommendations:</strong><br>
            💊 Rest and stay hydrated<br>
            🍵 Warm fluids and soups<br>
            💊 Over-the-counter pain relievers<br>
            ⚠️ See a doctor if symptoms persist beyond 7 days`;
    }

    if (lower.includes('headache') || lower.includes('migraine')) {
        return `🧠 <strong>Headache / Migraine</strong><br><br>
            Types: Tension, Cluster, Migraine<br><br>
            <strong>Relief tips:</strong><br>
            • Rest in a dark, quiet room<br>
            • Apply cold compress to forehead<br>
            • Stay hydrated<br>
            • Over-the-counter pain relief<br>
            ⚠️ Seek emergency care for sudden severe headache`;
    }

    // Scheduling
    if (lower.includes('schedule') || lower.includes('appointment') || lower.includes('book')) {
        return `📅 <strong>Scheduling an Appointment</strong><br><br>
            1. Go to the <strong>Appointments</strong> tab<br>
            2. Click <strong>"Schedule Appointment"</strong><br>
            3. Select the patient and doctor<br>
            4. Choose date & time<br>
            5. Add a reason (optional)<br>
            6. Click <strong>"Schedule"</strong><br><br>
            💡 Tip: You can also view all appointments from the Dashboard!`;
    }

    // Health tips
    if (lower.includes('health tip') || lower.includes('healthy') || lower.includes('wellness')) {
        const tips = [
            '🥗 Eat a balanced diet rich in fruits, vegetables, and whole grains',
            '🏃 Exercise at least 30 minutes daily',
            '💧 Drink 8 glasses of water daily',
            '😴 Get 7-8 hours of quality sleep',
            '🧘 Practice stress management through meditation or yoga',
            '🚫 Avoid smoking and excessive alcohol',
            '🩺 Schedule regular health checkups'
        ];
        return `💪 <strong>Daily Health Tips</strong><br><br>${tips.map(t => `• ${t}`).join('<br>')}`;
    }

    // Emergency
    if (lower.includes('emergency') || lower.includes('urgent') || lower.includes('911')) {
        return `🚨 <strong>Emergency Information</strong><br><br>
            <strong>Call 911 immediately if you experience:</strong><br>
            • Chest pain or difficulty breathing<br>
            • Stroke symptoms (face drooping, arm weakness, speech difficulty)<br>
            • Severe bleeding or injuries<br>
            • Loss of consciousness<br>
            • Severe allergic reaction<br><br>
            📞 Emergency: <strong>911</strong><br>
            📞 Poison Control: <strong>1-800-222-1222</strong>`;
    }

    // Billing
    if (lower.includes('bill') || lower.includes('payment') || lower.includes('cost') || lower.includes('price')) {
        return `💰 <strong>Billing Information</strong><br><br>
            • View all bills in the <strong>Billing</strong> tab<br>
            • Generate new bills for patients<br>
            • Mark bills as paid with one click<br>
            • Export billing data for records<br><br>
            💡 Unpaid bills are highlighted in red for easy tracking.`;
    }

    // Default
    return `I understand you're asking about "<strong>${escapeHtml(msg)}</strong>".<br><br>
        I can help with:<br>
        • 🩺 Medical symptoms & conditions<br>
        • 📅 Appointment scheduling<br>
        • 💰 Billing & payments<br>
        • 💪 Health & wellness tips<br>
        • 📊 System statistics<br>
        • 🚨 Emergency information<br><br>
        Try asking about one of these topics!`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================== LIVE REGISTRIES INTEGRATION ==========================

let currentNpiSearchResults = [];
let currentFdaSearchResults = [];

function loadLiveHospital() {
    // Initializer — no action needed
}

function capitalize(str) {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

async function handleNPISearch(event) {
    event.preventDefault();
    const firstName = document.getElementById('npiFirstName').value.trim();
    const lastName = document.getElementById('npiLastName').value.trim();
    const city = document.getElementById('npiCity').value.trim();
    const state = document.getElementById('npiState').value.trim();
    const taxonomy = document.getElementById('npiTaxonomy').value.trim();

    if (!firstName && !lastName && !city && !state && !taxonomy) {
        showToast('Please enter at least one search field', 'warning');
        return;
    }

    const loader = document.getElementById('npiLoader');
    const resultsDiv = document.getElementById('npiResults');

    resultsDiv.innerHTML = '';
    loader.classList.remove('hidden');
    currentNpiSearchResults = [];

    // Construct the NPI Registry endpoint
    let apiEndpoint = 'https://npiregistry.cms.hhs.gov/api/?version=2.1&limit=10';
    if (firstName) apiEndpoint += `&first_name=${encodeURIComponent(firstName)}`;
    if (lastName) apiEndpoint += `&last_name=${encodeURIComponent(lastName)}`;
    if (city) apiEndpoint += `&city=${encodeURIComponent(city)}`;
    if (state) apiEndpoint += `&state=${encodeURIComponent(state)}`;
    if (taxonomy) apiEndpoint += `&taxonomy_description=${encodeURIComponent(taxonomy)}`;

    try {
        let data;
        try {
            // Primary Proxy: corsproxy.io
            const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(apiEndpoint);
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error('Primary proxy failed');
            data = await response.json();
        } catch (e) {
            console.warn('Primary CORS proxy failed, attempting backup...', e);
            // Backup Proxy: AllOrigins
            const backupUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(apiEndpoint);
            const response = await fetch(backupUrl);
            if (!response.ok) throw new Error('Backup proxy failed');
            const wrapper = await response.json();
            data = JSON.parse(wrapper.contents);
        }

        loader.classList.add('hidden');

        if (!data || !data.results || data.results.length === 0) {
            resultsDiv.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>No U.S. providers found matching your search criteria.</p>
                </div>`;
            return;
        }

        currentNpiSearchResults = data.results;

        resultsDiv.innerHTML = data.results.map((r, index) => {
            const firstName = capitalize(r.basic.first_name || '');
            const lastName = capitalize(r.basic.last_name || '');
            const cred = r.basic.credential ? `, ${r.basic.credential}` : '';
            const spec = r.taxonomies?.find(t => t.primary)?.desc || r.taxonomies?.[0]?.desc || 'General Practice';
            
            const loc = r.addresses?.find(a => a.address_purpose === 'LOCATION') || r.addresses?.[0];
            const addressStr = loc ? `${capitalize(loc.address_1)}, ${capitalize(loc.city)}, ${loc.state} ${loc.postal_code}` : 'No address listing';
            const phone = loc?.telephone_number || 'N/A';
            const genderBadge = r.basic.gender === 'M' ? '<i class="fas fa-mars"></i> Male' : r.basic.gender === 'F' ? '<i class="fas fa-venus"></i> Female' : '';

            return `
                <div class="live-doctor-card stagger-item" style="--i: ${index}">
                    <h4>${firstName} ${lastName}${cred}</h4>
                    <p><strong>Specialty:</strong> ${capitalize(spec)}</p>
                    <p><strong>NPI Number:</strong> ${r.npi}</p>
                    <p><strong>Location:</strong> ${addressStr}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <div class="live-card-meta">
                        <span><i class="fas fa-id-card"></i> NPI Type 1 (Individual)</span>
                        ${genderBadge ? `<span>${genderBadge}</span>` : ''}
                    </div>
                    <div class="live-card-action">
                        <button class="btn-primary btn-sm" onclick="importNPIDoctor(${index})"><i class="fas fa-plus"></i> Import Doctor</button>
                    </div>
                </div>`;
        }).join('');

    } catch (err) {
        loader.classList.add('hidden');
        resultsDiv.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-times-circle" style="color:var(--danger);"></i>
                <p>Failed to connect to NPI registry. Check your network or search terms and try again.</p>
            </div>`;
        showToast('Error querying NPI Registry', 'error');
        console.error(err);
    }
}

function clearNPISearch() {
    document.getElementById('npiSearchForm').reset();
    currentNpiSearchResults = [];
    document.getElementById('npiResults').innerHTML = `
        <div class="empty-state">
            <i class="fas fa-search-plus"></i>
            <p>Search by provider name, specialty, or location to fetch live NPI registry details.</p>
        </div>`;
}

async function importNPIDoctor(index) {
    const provider = currentNpiSearchResults[index];
    if (!provider) return;

    const firstName = capitalize(provider.basic.first_name || '');
    const lastName = capitalize(provider.basic.last_name || '');
    const cred = provider.basic.credential ? `, ${provider.basic.credential}` : '';
    const fullName = `Dr. ${firstName} ${lastName}${cred}`;
    
    const spec = capitalize(provider.taxonomies?.find(t => t.primary)?.desc || provider.taxonomies?.[0]?.desc || 'General Practice');
    const loc = provider.addresses?.find(a => a.address_purpose === 'LOCATION') || provider.addresses?.[0];
    const phone = loc?.telephone_number || 'N/A';

    // Check duplication against backend
    try {
        const doctors = await API.getDoctors();
        if (doctors.some(d => d.name.toLowerCase() === fullName.toLowerCase() || d.contact === phone)) {
            showToast('Doctor already exists in the system', 'warning');
            return;
        }

        await API.addDoctor({
            name: fullName,
            specialization: spec,
            contact: phone,
            schedule: 'Mon-Fri 9AM-5PM'
        });
        showToast(`${fullName} imported successfully!`, 'success');
    } catch (err) {
        console.error('Import doctor error:', err);
        showToast('Failed to import doctor', 'error');
    }
}

async function handleFDASearch(event) {
    event.preventDefault();
    const drugName = document.getElementById('fdaDrugName').value.trim();

    if (!drugName) {
        showToast('Please enter a drug name', 'warning');
        return;
    }

    const loader = document.getElementById('fdaLoader');
    const resultsDiv = document.getElementById('fdaResults');

    resultsDiv.innerHTML = '';
    loader.classList.remove('hidden');
    currentFdaSearchResults = [];

    // OpenFDA API endpoint
    const url = `https://api.fda.gov/drug/label.json?search=(openfda.brand_name:"${encodeURIComponent(drugName)}"+OR+openfda.generic_name:"${encodeURIComponent(drugName)}")&limit=5`;

    try {
        const response = await fetch(url);
        loader.classList.add('hidden');

        if (!response.ok) {
            resultsDiv.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>No matching drug records found in FDA database.</p>
                </div>`;
            return;
        }

        const data = await response.json();
        if (!data || !data.results || data.results.length === 0) {
            resultsDiv.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>No matching drug records found in FDA database.</p>
                </div>`;
            return;
        }

        currentFdaSearchResults = data.results;

        resultsDiv.innerHTML = data.results.map((r, index) => {
            const brand = capitalize(r.openfda?.brand_name?.[0] || '');
            const generic = capitalize(r.openfda?.generic_name?.[0] || '');
            const manufacturer = capitalize(r.openfda?.manufacturer_name?.[0] || 'Unknown Manufacturer');
            const activeIng = r.active_ingredient?.[0] || 'Active ingredients not listed';
            
            // Clean up details
            const purpose = r.purpose?.[0] || r.indications_and_usage?.[0] || 'No specified purpose listed';
            const warnings = r.warnings?.[0] || '';

            return `
                <div class="live-drug-card stagger-item" style="--i: ${index}">
                    <h4>${brand ? brand : generic} ${brand && generic ? `(${generic})` : ''}</h4>
                    <p><strong>Manufacturer:</strong> ${manufacturer}</p>
                    
                    <div class="drug-detail-section">
                        <div class="drug-detail-title">Active Ingredients</div>
                        <div class="drug-detail-content">${activeIng}</div>
                    </div>
                    
                    <div class="drug-detail-section">
                        <div class="drug-detail-title">Purpose & Indications</div>
                        <div class="drug-detail-content">${purpose}</div>
                    </div>
                    
                    ${warnings ? `
                    <div class="drug-warning-box">
                        <div class="drug-warning-title"><i class="fas fa-exclamation-triangle"></i> FDA Warnings</div>
                        <div class="drug-warning-content">${warnings}</div>
                    </div>` : ''}

                    <div class="live-card-action">
                        <button class="btn-primary btn-sm" onclick="prescribeDrug(${index})"><i class="fas fa-prescription"></i> Use in Prescription</button>
                    </div>
                </div>`;
        }).join('');

    } catch (err) {
        loader.classList.add('hidden');
        resultsDiv.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-times-circle" style="color:var(--danger);"></i>
                <p>Failed to connect to OpenFDA. Check network and try again.</p>
            </div>`;
        showToast('Error querying FDA Database', 'error');
        console.error(err);
    }
}

function clearFDASearch() {
    document.getElementById('fdaSearchForm').reset();
    currentFdaSearchResults = [];
    document.getElementById('fdaResults').innerHTML = `
        <div class="empty-state">
            <i class="fas fa-pills"></i>
            <p>Enter a drug brand or generic name to fetch active ingredients, purpose, and warnings.</p>
        </div>`;
}

function prescribeDrug(index) {
    const drug = currentFdaSearchResults[index];
    if (!drug) return;

    const brand = capitalize(drug.openfda?.brand_name?.[0] || '');
    const generic = capitalize(drug.openfda?.generic_name?.[0] || '');
    const drugName = brand ? `${brand} (${generic})` : generic;
    
    // Get dosage limit length
    let dosage = drug.dosage_and_administration?.[0] || 'As directed by physician';
    if (dosage.length > 80) {
        dosage = dosage.slice(0, 77) + '...';
    }

    switchTab('prescriptions');
    showAddPrescriptionModal();
    
    // Wait a tick for the modal to populate
    setTimeout(() => {
        document.getElementById('prescriptionMedication').value = drugName;
        document.getElementById('prescriptionDosage').value = dosage;
    }, 300);
    
    showToast(`Pre-filled prescription with ${brand ? brand : generic}`, 'info');
}
