// Initialize variables
let currentUser = null;
let students = JSON.parse(localStorage.getItem('students')) || [];
let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
let currentAttendance = {
    date: '',
    subject: '',
    records: []
};

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const loginForm = document.getElementById('loginForm');
const addStudentForm = document.getElementById('addStudentForm');
const selectDateForm = document.getElementById('selectDateForm');
const mainContent = document.getElementById('mainContent');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    checkRememberedUser();
    renderMainContent();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    loginForm.addEventListener('submit', handleLogin);
    addStudentForm.addEventListener('submit', handleAddStudent);
    selectDateForm.addEventListener('submit', handleSelectDate);
}

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
}

// Check Remembered User
function checkRememberedUser() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        currentUser = JSON.parse(rememberedUser);
    }
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Demo authentication (in a real app, this would be server-side)
    if ((email === 'admin@college.com' && password === 'admin123') || 
        (email === 'teacher@college.com' && password === 'teacher123')) {
        
        currentUser = {
            email,
            role: email === 'admin@college.com' ? 'admin' : 'teacher'
        };
        
        if (rememberMe) {
            localStorage.setItem('rememberedUser', JSON.stringify(currentUser));
        }
        
        // Close the modal
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        loginModal.hide();
        
        // Clear form
        loginForm.reset();
        
        // Update UI
        renderMainContent();
    } else {
        alert('Invalid credentials. Please try again.');
    }
}

// Handle Add Student
function handleAddStudent(e) {
    e.preventDefault();
    
    const name = document.getElementById('studentName').value;
    const roll = document.getElementById('studentRoll').value;
    const section = document.getElementById('studentSection').value;
    
    // Check if roll number already exists
    if (students.some(student => student.roll === roll)) {
        alert('Student with this roll number already exists!');
        return;
    }
    
    const newStudent = {
        id: Date.now().toString(),
        name,
        roll,
        section
    };
    
    students.push(newStudent);
    saveStudents();
    
    // Close the modal
    const addStudentModal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
    addStudentModal.hide();
    
    // Clear form
    addStudentForm.reset();
    
    // Update UI
    renderMainContent();
    
    // If we're on the attendance page, refresh it
    if (document.getElementById('attendancePage')) {
        renderAttendancePage();
    }
}

// Handle Select Date
function handleSelectDate(e) {
    e.preventDefault();
    
    const date = document.getElementById('attendanceDate').value;
    const subject = document.getElementById('attendanceSubject').value;
    
    currentAttendance.date = date;
    currentAttendance.subject = subject;
    currentAttendance.records = [];
    
    // Initialize attendance records for all students
    students.forEach(student => {
        currentAttendance.records.push({
            studentId: student.id,
            status: 'present' // default to present
        });
    });
    
    // Close the modal
    const selectDateModal = bootstrap.Modal.getInstance(document.getElementById('selectDateModal'));
    selectDateModal.hide();
    
    // Clear form
    selectDateForm.reset();
    
    // Render attendance page
    renderAttendancePage();
}

// Save Students to Local Storage
function saveStudents() {
    localStorage.setItem('students', JSON.stringify(students));
}

// Save Attendance Records to Local Storage
function saveAttendanceRecords() {
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
}

// Render Main Content based on login state
function renderMainContent() {
    if (!currentUser) {
        renderLoggedOutView();
    } else if (currentUser.role === 'admin') {
        renderAdminDashboard();
    } else {
        renderTeacherDashboard();
    }
}

// Render Logged Out View
function renderLoggedOutView() {
    mainContent.innerHTML = `
        <div class="jumbotron text-center py-5">
            <h1 class="display-4">Welcome to Attendance System</h1>
            <p class="lead">A modern solution for managing college attendance</p>
            <hr class="my-4">
            <p>Please login to access the system features</p>
            <button class="btn btn-primary btn-lg" data-bs-toggle="modal" data-bs-target="#loginModal">
                <i class="fas fa-sign-in-alt"></i> Login
            </button>
        </div>
    `;
}

// Render Admin Dashboard
function renderAdminDashboard() {
    mainContent.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-6">
                <h2><i class="fas fa-tachometer-alt me-2"></i>Admin Dashboard</h2>
            </div>
            <div class="col-md-6 text-md-end">
                <button class="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#addStudentModal">
                    <i class="fas fa-user-plus me-1"></i> Add Student
                </button>
                <button class="btn btn-danger" id="logoutBtn">
                    <i class="fas fa-sign-out-alt me-1"></i> Logout
                </button>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-4 mb-3">
                <div class="card admin-card text-white bg-primary h-100">
                    <div class="card-body">
                        <h5 class="card-title"><i class="fas fa-users me-2"></i>Total Students</h5>
                        <p class="card-text display-4">${students.length}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card admin-card text-white bg-success h-100">
                    <div class="card-body">
                        <h5 class="card-title"><i class="fas fa-calendar-check me-2"></i>Attendance Records</h5>
                        <p class="card-text display-4">${attendanceRecords.length}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card admin-card text-white bg-info h-100">
                    <div class="card-body">
                        <h5 class="card-title"><i class="fas fa-chart-pie me-2"></i>Sections</h5>
                        <p class="card-text display-4">${new Set(students.map(s => s.section)).size}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-list me-2"></i>Student List</h5>
            </div>
            <div class="card-body">
                ${students.length > 0 ? renderStudentTable() : '<p class="text-muted">No students added yet.</p>'}
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-history me-2"></i>Recent Attendance</h5>
            </div>
            <div class="card-body">
                ${attendanceRecords.length > 0 ? renderRecentAttendance() : '<p class="text-muted">No attendance records yet.</p>'}
            </div>
        </div>
    `;
    
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

// Render Teacher Dashboard
function renderTeacherDashboard() {
    mainContent.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-6">
                <h2><i class="fas fa-chalkboard-teacher me-2"></i>Teacher Dashboard</h2>
            </div>
            <div class="col-md-6 text-md-end">
                <button class="btn btn-primary me-2" data-bs-toggle="modal" data-bs-target="#selectDateModal">
                    <i class="fas fa-calendar-plus me-1"></i> Take Attendance
                </button>
                <button class="btn btn-danger" id="logoutBtn">
                    <i class="fas fa-sign-out-alt me-1"></i> Logout
                </button>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-6 mb-3">
                <div class="card admin-card text-white bg-primary h-100">
                    <div class="card-body">
                        <h5 class="card-title"><i class="fas fa-users me-2"></i>Total Students</h5>
                        <p class="card-text display-4">${students.length}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="card admin-card text-white bg-success h-100">
                    <div class="card-body">
                        <h5 class="card-title"><i class="fas fa-calendar-check me-2"></i>Your Records</h5>
                        <p class="card-text display-4">${attendanceRecords.filter(r => r.teacher === currentUser.email).length}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-history me-2"></i>Your Recent Attendance</h5>
            </div>
            <div class="card-body">
                ${attendanceRecords.filter(r => r.teacher === currentUser.email).length > 0 ? 
                    renderRecentAttendance(currentUser.email) : 
                    '<p class="text-muted">No attendance records yet.</p>'}
            </div>
        </div>
    `;
    
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

// Render Student Table
function renderStudentTable() {
    return `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Roll No.</th>
                        <th>Name</th>
                        <th>Section</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map(student => `
                        <tr>
                            <td>${student.roll}</td>
                            <td>${student.name}</td>
                            <td>${student.section}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger delete-student" data-id="${student.id}">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render Recent Attendance
function renderRecentAttendance(teacherEmail = null) {
    const recordsToShow = teacherEmail ? 
        attendanceRecords.filter(r => r.teacher === teacherEmail).slice(0, 5) : 
        attendanceRecords.slice(0, 5);
    
    return `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Subject</th>
                        <th>Teacher</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${recordsToShow.map(record => `
                        <tr>
                            <td>${formatDate(record.date)}</td>
                            <td>${record.subject}</td>
                            <td>${record.teacher}</td>
                            <td>${record.records.filter(r => r.status === 'present').length}</td>
                            <td>${record.records.filter(r => r.status === 'absent').length}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary view-attendance" data-id="${record.id}">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-success download-attendance" data-id="${record.id}">
                                    <i class="fas fa-download"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render Attendance Page
function renderAttendancePage() {
    mainContent.innerHTML = `
        <div id="attendancePage">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>
                    <i class="fas fa-calendar-check me-2"></i>
                    Attendance for ${formatDate(currentAttendance.date)} - ${currentAttendance.subject}
                </h2>
                <div>
                    <button class="btn btn-secondary me-2" id="backToDashboard">
                        <i class="fas fa-arrow-left me-1"></i> Back
                    </button>
                    <button class="btn btn-success" id="saveAttendance">
                        <i class="fas fa-save me-1"></i> Save
                    </button>
                </div>
            </div>
            
            <div class="card mb-4">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Mark Attendance</h5>
                        <div>
                            <span class="badge bg-success me-2">
                                <i class="fas fa-check"></i> Present: ${currentAttendance.records.filter(r => r.status === 'present').length}
                            </span>
                            <span class="badge bg-danger">
                                <i class="fas fa-times"></i> Absent: ${currentAttendance.records.filter(r => r.status === 'absent').length}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="attendance-table">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Roll No.</th>
                                    <th>Name</th>
                                    <th>Section</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${currentAttendance.records.map(record => {
                                    const student = students.find(s => s.id === record.studentId);
                                    return `
                                        <tr>
                                            <td>${student.roll}</td>
                                            <td>${student.name}</td>
                                            <td>${student.section}</td>
                                            <td>
                                                <div class="status-btn ${record.status === 'present' ? 'present' : 'absent'}" 
                                                     data-student-id="${student.id}">
                                                    <i class="fas ${record.status === 'present' ? 'fa-check' : 'fa-times'}"></i>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners for status buttons
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const studentId = this.getAttribute('data-student-id');
            const record = currentAttendance.records.find(r => r.studentId === studentId);
            
            if (record.status === 'present') {
                record.status = 'absent';
                this.classList.remove('present');
                this.classList.add('absent');
                this.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                record.status = 'present';
                this.classList.remove('absent');
                this.classList.add('present');
                this.innerHTML = '<i class="fas fa-check"></i>';
            }
            
            // Update counters
            const presentCount = currentAttendance.records.filter(r => r.status === 'present').length;
            const absentCount = currentAttendance.records.filter(r => r.status === 'absent').length;
            
            document.querySelector('.badge.bg-success').innerHTML = `<i class="fas fa-check"></i> Present: ${presentCount}`;
            document.querySelector('.badge.bg-danger').innerHTML = `<i class="fas fa-times"></i> Absent: ${absentCount}`;
        });
    });
    
    // Back button
    document.getElementById('backToDashboard').addEventListener('click', function() {
        if (confirm('Are you sure you want to leave? Any unsaved changes will be lost.')) {
            renderMainContent();
        }
    });
    
    // Save button
    document.getElementById('saveAttendance').addEventListener('click', function() {
        saveCurrentAttendance();
    });
}

// Save Current Attendance
function saveCurrentAttendance() {
    const attendanceRecord = {
        id: Date.now().toString(),
        date: currentAttendance.date,
        subject: currentAttendance.subject,
        teacher: currentUser.email,
        records: currentAttendance.records
    };
    
    attendanceRecords.push(attendanceRecord);
    saveAttendanceRecords();
    
    alert('Attendance saved successfully!');
    renderMainContent();
    
    // In a real app, you would also save to Google Sheets here
    // For demo purposes, we're just using local storage
    console.log('Would save to Google Sheets:', attendanceRecord);
}

// Handle Logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('rememberedUser');
    renderMainContent();
}

// Format Date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// After rendering tables, set up event listeners for dynamic elements
document.addEventListener('click', function(e) {
    // Delete student
    if (e.target.classList.contains('delete-student') || e.target.closest('.delete-student')) {
        const button = e.target.classList.contains('delete-student') ? e.target : e.target.closest('.delete-student');
        const studentId = button.getAttribute('data-id');
        
        if (confirm('Are you sure you want to delete this student?')) {
            students = students.filter(student => student.id !== studentId);
            saveStudents();
            renderMainContent();
        }
    }
    
    // View attendance details
    if (e.target.classList.contains('view-attendance') || e.target.closest('.view-attendance')) {
        const button = e.target.classList.contains('view-attendance') ? e.target : e.target.closest('.view-attendance');
        const recordId = button.getAttribute('data-id');
        viewAttendanceDetails(recordId);
    }
    
    // Download attendance
    if (e.target.classList.contains('download-attendance') || e.target.closest('.download-attendance')) {
        const button = e.target.classList.contains('download-attendance') ? e.target : e.target.closest('.download-attendance');
        const recordId = button.getAttribute('data-id');
        downloadAttendance(recordId);
    }
});

// View Attendance Details
function viewAttendanceDetails(recordId) {
    const record = attendanceRecords.find(r => r.id === recordId);
    if (!record) return;
    
    const presentStudents = record.records.filter(r => r.status === 'present').map(r => {
        const student = students.find(s => s.id === r.studentId);
        return student ? `${student.name} (${student.roll})` : 'Unknown Student';
    });
    
    const absentStudents = record.records.filter(r => r.status === 'absent').map(r => {
        const student = students.find(s => s.id === r.studentId);
        return student ? `${student.name} (${student.roll})` : 'Unknown Student';
    });
    
    const modalContent = `
        <div class="modal-header">
            <h5 class="modal-title">Attendance Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <p><strong>Date:</strong> ${formatDate(record.date)}</p>
            <p><strong>Subject:</strong> ${record.subject}</p>
            <p><strong>Teacher:</strong> ${record.teacher}</p>
            
            <div class="row mt-4">
                <div class="col-md-6">
                    <h6>Present Students (${presentStudents.length})</h6>
                    <ul class="list-group">
                        ${presentStudents.map(student => `<li class="list-group-item">${student}</li>`).join('')}
                    </ul>
                </div>
                <div class="col-md-6">
                    <h6>Absent Students (${absentStudents.length})</h6>
                    <ul class="list-group">
                        ${absentStudents.map(student => `<li class="list-group-item">${student}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
    `;
    
    // Create a modal dynamically
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'attendanceDetailsModal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                ${modalContent}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    // Remove modal from DOM after it's hidden
    modal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

// Download Attendance
function downloadAttendance(recordId) {
    const record = attendanceRecords.find(r => r.id === recordId);
    if (!record) return;
    
    // Using jsPDF with autoTable plugin
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text(`Attendance Report - ${record.subject}`, 14, 20);
    
    // Details
    doc.setFontSize(12);
    doc.text(`Date: ${formatDate(record.date)}`, 14, 30);
    doc.text(`Teacher: ${record.teacher}`, 14, 36);
    
    // Prepare data for the table
    const tableData = record.records.map(r => {
        const student = students.find(s => s.id === r.studentId);
        return {
            roll: student ? student.roll : 'N/A',
            name: student ? student.name : 'Unknown Student',
            section: student ? student.section : 'N/A',
            status: r.status === 'present' ? 'Present' : 'Absent'
        };
    });
    
    // AutoTable
    doc.autoTable({
        startY: 45,
        head: [['Roll No.', 'Name', 'Section', 'Status']],
        body: tableData.map(item => [item.roll, item.name, item.section, item.status]),
        styles: {
            cellPadding: 5,
            fontSize: 10,
            valign: 'middle'
        },
        headStyles: {
            fillColor: [52, 58, 64],
            textColor: 255
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 20 },
            3: { cellWidth: 25 }
        },
        didDrawPage: function(data) {
            // Footer
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, data.settings.m