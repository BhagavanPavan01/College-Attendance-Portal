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
const dynamicModalContainer = document.getElementById('dynamicModalContainer');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Set default date for attendance date picker to today
    document.getElementById('attendanceDate')?.setAttribute('value', new Date().toISOString().split('T')[0]);
    
    checkRememberedUser();
    renderMainContent();
    setupEventListeners();
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Event Listeners
function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (addStudentForm) addStudentForm.addEventListener('submit', handleAddStudent);
    if (selectDateForm) selectDateForm.addEventListener('submit', handleSelectDate);
    
    // Dynamic event listeners for elements that might be added later
    document.addEventListener('click', function(e) {
        // Delete student
        if (e.target.closest('.delete-student')) {
            const button = e.target.closest('.delete-student');
            const studentId = button.getAttribute('data-id');
            deleteStudent(studentId);
        }
        
        // View attendance details
        if (e.target.closest('.view-attendance')) {
            const button = e.target.closest('.view-attendance');
            const recordId = button.getAttribute('data-id');
            viewAttendanceDetails(recordId);
        }
        
        // Download attendance
        if (e.target.closest('.download-attendance')) {
            const button = e.target.closest('.download-attendance');
            const recordId = button.getAttribute('data-id');
            downloadAttendance(recordId);
        }
        
        // Status buttons in attendance taking
        if (e.target.closest('.status-btn')) {
            const button = e.target.closest('.status-btn');
            toggleAttendanceStatus(button);
        }
        
        // Back to dashboard button
        if (e.target.closest('#backToDashboard')) {
            confirmLeaveAttendance();
        }
        
        // Save attendance button
        if (e.target.closest('#saveAttendance')) {
            saveCurrentAttendance();
        }
        
        // Logout button
        if (e.target.closest('#logoutBtn')) {
            handleLogout();
        }
    });
}

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        localStorage.setItem('theme', 'light');
    }
}

// Check Remembered User
function checkRememberedUser() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        currentUser = JSON.parse(rememberedUser);
    }
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    }
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
    submitButton.disabled = true;
    
    // Simulate API call with timeout
    setTimeout(() => {
        // Demo authentication (in a real app, this would be server-side)
        if ((email === 'admin@college.com' && password === 'admin123') || 
            (email === 'teacher@college.com' && password === 'teacher123')) {
            
            currentUser = {
                email,
                role: email === 'admin@college.com' ? 'admin' : 'teacher'
            };
            
            if (rememberMe) {
                localStorage.setItem('rememberedUser', JSON.stringify(currentUser));
            } else {
                localStorage.removeItem('rememberedUser');
            }
            
            // Close the modal
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            loginModal.hide();
            
            // Clear form
            loginForm.reset();
            
            // Update UI
            renderMainContent();
            
            // Show welcome toast
            showToast(`Welcome back, ${currentUser.role === 'admin' ? 'Admin' : 'Teacher'}!`, 'success');
        } else {
            showToast('Invalid credentials. Please try again.', 'danger');
        }
        
        // Reset button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }, 1000);
}

// Handle Add Student
function handleAddStudent(e) {
    e.preventDefault();
    
    const name = document.getElementById('studentName').value.trim();
    const roll = document.getElementById('studentRoll').value.trim();
    const section = document.getElementById('studentSection').value;
    
    // Validate inputs
    if (!name || !roll || !section) {
        showToast('Please fill all fields', 'warning');
        return;
    }
    
    // Check if roll number already exists
    if (students.some(student => student.roll === roll)) {
        showToast('Student with this roll number already exists!', 'danger');
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
    
    // Show success message
    showToast('Student added successfully!', 'success');
    
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
    
    if (!date || !subject) {
        showToast('Please select both date and subject', 'warning');
        return;
    }
    
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
    
    // Show instruction toast
    showToast('Click on status buttons to mark students present/absent', 'info');
}

// Delete Student
function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        students = students.filter(student => student.id !== studentId);
        saveStudents();
        renderMainContent();
        showToast('Student deleted successfully', 'success');
    }
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
        <div class="jumbotron text-center py-5 animate__animated animate__fadeIn">
            <h1 class="display-4">Welcome to Attendance System</h1>
            <p class="lead">A modern solution for managing college attendance</p>
            <hr class="my-4">
            <p>Please login to access the system features</p>
            <button class="btn btn-primary btn-lg animate-hover" data-bs-toggle="modal" data-bs-target="#loginModal">
                <i class="fas fa-sign-in-alt"></i> Login
            </button>
        </div>
    `;
}

// Render Admin Dashboard
function renderAdminDashboard() {
    mainContent.innerHTML = `
        <div class="row mb-4 animate__animated animate__fadeIn">
            <div class="col-md-6">
                <h2><i class="fas fa-tachometer-alt me-2"></i>Admin Dashboard</h2>
            </div>
            <div class="col-md-6 text-md-end">
                <button class="btn btn-success me-2 animate-hover" data-bs-toggle="modal" data-bs-target="#addStudentModal">
                    <i class="fas fa-user-plus me-1"></i> Add Student
                </button>
                <button class="btn btn-danger animate-hover" id="logoutBtn">
                    <i class="fas fa-sign-out-alt me-1"></i> Logout
                </button>
            </div>
        </div>
        
        <div class="row mb-4 animate__animated animate__fadeInUp">
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
        
        <div class="card mb-4 animate__animated animate__fadeInUp">
            <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-list me-2"></i>Student List</h5>
            </div>
            <div class="card-body">
                ${students.length > 0 ? renderStudentTable() : '<p class="text-muted">No students added yet.</p>'}
            </div>
        </div>
        
        <div class="card animate__animated animate__fadeInUp">
            <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-history me-2"></i>Recent Attendance</h5>
            </div>
            <div class="card-body">
                ${attendanceRecords.length > 0 ? renderRecentAttendance() : '<p class="text-muted">No attendance records yet.</p>'}
            </div>
        </div>
    `;
}

// Render Teacher Dashboard
function renderTeacherDashboard() {
    const teacherRecords = attendanceRecords.filter(r => r.teacher === currentUser.email);
    
    mainContent.innerHTML = `
        <div class="row mb-4 animate__animated animate__fadeIn">
            <div class="col-md-6">
                <h2><i class="fas fa-chalkboard-teacher me-2"></i>Teacher Dashboard</h2>
            </div>
            <div class="col-md-6 text-md-end">
                <button class="btn btn-primary me-2 animate-hover" data-bs-toggle="modal" data-bs-target="#selectDateModal">
                    <i class="fas fa-calendar-plus me-1"></i> Take Attendance
                </button>
                <button class="btn btn-danger animate-hover" id="logoutBtn">
                    <i class="fas fa-sign-out-alt me-1"></i> Logout
                </button>
            </div>
        </div>
        
        <div class="row mb-4 animate__animated animate__fadeInUp">
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
                        <p class="card-text display-4">${teacherRecords.length}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card animate__animated animate__fadeInUp">
            <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-history me-2"></i>Your Recent Attendance</h5>
            </div>
            <div class="card-body">
                ${teacherRecords.length > 0 ? 
                    renderRecentAttendance(currentUser.email) : 
                    '<p class="text-muted">No attendance records yet.</p>'}
            </div>
        </div>
    `;
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
                        <tr class="animate__animated animate__fadeIn">
                            <td>${student.roll}</td>
                            <td>${student.name}</td>
                            <td>${student.section}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger delete-student animate-hover" data-id="${student.id}" data-bs-toggle="tooltip" title="Delete Student">
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
                        ${teacherEmail ? '' : '<th>Teacher</th>'}
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${recordsToShow.map((record, index) => `
                        <tr class="animate__animated animate__fadeIn" style="animation-delay: ${index * 0.1}s">
                            <td>${formatDate(record.date)}</td>
                            <td>${record.subject}</td>
                            ${teacherEmail ? '' : `<td>${record.teacher}</td>`}
                            <td>${record.records.filter(r => r.status === 'present').length}</td>
                            <td>${record.records.filter(r => r.status === 'absent').length}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary view-attendance me-1 animate-hover" data-id="${record.id}" data-bs-toggle="tooltip" title="View Details">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-success download-attendance animate-hover" data-id="${record.id}" data-bs-toggle="tooltip" title="Download PDF">
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
        <div id="attendancePage" class="animate__animated animate__fadeIn">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>
                    <i class="fas fa-calendar-check me-2"></i>
                    Attendance for ${formatDate(currentAttendance.date)} - ${currentAttendance.subject}
                </h2>
                <div>
                    <button class="btn btn-secondary me-2 animate-hover" id="backToDashboard">
                        <i class="fas fa-arrow-left me-1"></i> Back
                    </button>
                    <button class="btn btn-success animate-hover" id="saveAttendance">
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
                                ${currentAttendance.records.map((record, index) => {
                                    const student = students.find(s => s.id === record.studentId);
                                    return `
                                        <tr class="animate__animated animate__fadeIn" style="animation-delay: ${index * 0.05}s">
                                            <td>${student?.roll || 'N/A'}</td>
                                            <td>${student?.name || 'Unknown Student'}</td>
                                            <td>${student?.section || 'N/A'}</td>
                                            <td>
                                                <div class="status-btn ${record.status === 'present' ? 'present' : 'absent'} animate-hover" 
                                                     data-student-id="${student?.id || ''}">
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
}

// Toggle Attendance Status
function toggleAttendanceStatus(button) {
    const studentId = button.getAttribute('data-student-id');
    const record = currentAttendance.records.find(r => r.studentId === studentId);
    
    if (!record) return;
    
    if (record.status === 'present') {
        record.status = 'absent';
        button.classList.remove('present');
        button.classList.add('absent');
        button.innerHTML = '<i class="fas fa-times"></i>';
    } else {
        record.status = 'present';
        button.classList.remove('absent');
        button.classList.add('present');
        button.innerHTML = '<i class="fas fa-check"></i>';
    }
    
    // Update counters
    const presentCount = currentAttendance.records.filter(r => r.status === 'present').length;
    const absentCount = currentAttendance.records.filter(r => r.status === 'absent').length;
    
    document.querySelector('.badge.bg-success').innerHTML = `<i class="fas fa-check"></i> Present: ${presentCount}`;
    document.querySelector('.badge.bg-danger').innerHTML = `<i class="fas fa-times"></i> Absent: ${absentCount}`;
}

// Confirm Leave Attendance
function confirmLeaveAttendance() {
    if (confirm('Are you sure you want to leave? Any unsaved changes will be lost.')) {
        renderMainContent();
    }
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
    
    showToast('Attendance saved successfully!', 'success');
    renderMainContent();
}

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
    
    const modalId = 'attendanceDetailsModal-' + recordId;
    
    const modalHTML = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="${modalId}Label">Attendance Details</h5>
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
                </div>
            </div>
        </div>
    `;
    
    // Add modal to container
    dynamicModalContainer.innerHTML = modalHTML;
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
    
    // Remove modal from DOM after it's hidden
    document.getElementById(modalId).addEventListener('hidden.bs.modal', function() {
        dynamicModalContainer.innerHTML = '';
    });
}

// Download Attendance as PDF
function downloadAttendance(recordId) {
    const record = attendanceRecords.find(r => r.id === recordId);
    if (!record) return;
    
    // Using jsPDF with autoTable plugin
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(40);
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
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
    });
    
    // Save the PDF
    doc.save(`Attendance_${record.subject}_${formatDate(record.date, 'YYYY-MM-DD')}.pdf`);
}

// Handle Logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('rememberedUser');
    renderMainContent();
    showToast('Logged out successfully', 'info');
}

// Format Date
function formatDate(dateString, format = 'long') {
    const date = new Date(dateString);
    if (format === 'YYYY-MM-DD') {
        return date.toISOString().split('T')[0];
    }
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

// Show Toast Notification
function showToast(message, type = 'info') {
    // Remove any existing toasts
    const existingToasts = document.querySelectorAll('.toast-container');
    existingToasts.forEach(toast => toast.remove());
    
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '11';
    
    const toastHTML = `
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">Attendance System</strong>
                <small>Just now</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body text-white bg-${type}">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.innerHTML = toastHTML;
    document.body.appendChild(toastContainer);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        toastContainer.remove();
    }, 5000);
}

// Initialize tooltips when new content is added
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}