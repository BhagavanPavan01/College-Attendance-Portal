// Main Application
const AttendanceSystem = (function () {
    // State
    let currentUser = null;
    let students = JSON.parse(localStorage.getItem('students')) || [];
    let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    let currentAttendance = {
        date: '',
        subject: '',
        records: []
    };

    // DOM Elements
    const elements = {
        themeToggle: document.getElementById('themeToggle'),
        mainContent: document.getElementById('mainContent'),
        modalContainer: document.getElementById('modalContainer')
    };

    // Initialize the application
    function init() {
        setupEventListeners();
        checkRememberedUser();
        renderMainContent();
        setDefaultDates();
    }

    // Set default dates for date inputs
    function setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('attendanceDate')?.setAttribute('value', today);
        document.getElementById('filterDate')?.setAttribute('value', today);
    }

    // Setup event listeners
    function setupEventListeners() {
        // Theme toggle
        elements.themeToggle?.addEventListener('click', toggleTheme);

        // Form submissions
        document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
        document.getElementById('addStudentForm')?.addEventListener('submit', handleAddStudent);
        document.getElementById('selectDateForm')?.addEventListener('submit', handleSelectDate);
        document.getElementById('editStudentForm')?.addEventListener('submit', handleEditStudent);

        // Single event listener for all click events
        document.addEventListener('click', function (e) {
            // View attendance
            if (e.target.closest('.view-attendance')) {
                const recordId = e.target.closest('.view-attendance').dataset.id;
                viewAttendanceDetails(recordId);
            }

            // Download attendance
            if (e.target.closest('.download-attendance')) {
                const recordId = e.target.closest('.download-attendance').dataset.id;
                downloadAttendance(recordId);
            }

            // Status buttons
            if (e.target.closest('.status-btn')) {
                const button = e.target.closest('.status-btn');
                toggleAttendanceStatus(button);
            }

            // Back to dashboard
            if (e.target.closest('#backToDashboard')) {
                confirmLeaveAttendance();
            }

            // Save attendance
            if (e.target.closest('#saveAttendance')) {
                saveCurrentAttendance();
            }

            // Logout
            if (e.target.closest('#logoutBtn')) {
                handleLogout();
            }

            // Apply filters
            if (e.target.closest('#applyFilters')) {
                applyFilters();
            }

            // Reset filters
            if (e.target.closest('#resetFilters')) {
                resetFilters();
            }

            // View filtered attendance
            if (e.target.closest('.view-filtered-attendance')) {
                const button = e.target.closest('.view-filtered-attendance');
                viewFilteredAttendance(
                    button.dataset.date,
                    button.dataset.subject,
                    button.dataset.section
                );
            }

            // Download filtered attendance
            if (e.target.closest('.download-filtered-attendance')) {
                const button = e.target.closest('.download-filtered-attendance');
                downloadFilteredAttendance(
                    button.dataset.date,
                    button.dataset.subject,
                    button.dataset.section
                );
            }

            // Delete attendance record
            if (e.target.closest('.delete-attendance')) {
                const recordId = e.target.closest('.delete-attendance').dataset.id;
                deleteAttendanceRecord(recordId);
            }

            // Edit attendance record
            if (e.target.closest('.edit-attendance')) {
                const recordId = e.target.closest('.edit-attendance').dataset.id;
                editAttendanceRecord(recordId);
            }

            // Section card click (filter students by section)
            if (e.target.closest('.section-card')) {
                const section = e.target.closest('.section-card').dataset.section;
                document.getElementById('studentsTableContainer').innerHTML = renderStudentTable(section);

                // Highlight active card
                document.querySelectorAll('.section-card').forEach(card => {
                    card.classList.remove('active-section');
                });
                e.target.closest('.section-card').classList.add('active-section');
            }

            // Show all students button
            if (e.target.closest('#showAllStudents')) {
                document.getElementById('studentsTableContainer').innerHTML = renderStudentTable();
                document.querySelectorAll('.section-card').forEach(card => {
                    card.classList.remove('active-section');
                });
            }

            // Delete student
            if (e.target.closest('.delete-student')) {
                const studentId = e.target.closest('.delete-student').dataset.id;
                deleteStudent(studentId);
            }

            // Edit student
            if (e.target.closest('.edit-student')) {
                const studentId = e.target.closest('.edit-student').dataset.id;
                showEditStudentModal(studentId);
            }

            // Reset password
            if (e.target.closest('.reset-password')) {
                const studentId = e.target.closest('.reset-password').dataset.id;
                resetStudentPassword(studentId);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', function (e) {
            // Escape key closes modals
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal.show');
                if (modals.length > 0) {
                    bootstrap.Modal.getInstance(modals[0]).hide();
                }
            }
        });
    }

    // Theme toggle
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');

        if (document.body.classList.contains('dark-mode')) {
            elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
            localStorage.setItem('theme', 'dark');
        } else {
            elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
            localStorage.setItem('theme', 'light');
        }
    }

    // Check remembered user
    function checkRememberedUser() {
        const rememberedUser = localStorage.getItem('rememberedUser');
        if (rememberedUser) {
            currentUser = JSON.parse(rememberedUser);
        }

        // Check theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        }
    }

    // Handle login
    // Handle login
    // function handleLogin(e) {
    //     e.preventDefault();

    //     const loginType = document.querySelector('input[name="loginType"]:checked')?.value;
    //     const email = document.getElementById('loginEmail').value;
    //     const password = document.getElementById('loginPassword').value;
    //     const rememberMe = document.getElementById('rememberMe').checked;

    //     // Show loading state
    //     const submitButton = e.target.querySelector('button[type="submit"]');
    //     const originalText = submitButton.innerHTML;
    //     submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Authenticating...';
    //     submitButton.disabled = true;

    //     // Simulate API call
    //     setTimeout(() => {
    //         try {
    //             if (!loginType) {
    //                 throw new Error('Please select your role');
    //             }

    //             let isValid = false;
    //             let role = '';
    //             let userData = null;

    //             // Check credentials based on login type
    //             switch (loginType) {
    //                 case 'admin':
    //                     if (email === 'admin@college.edu' && password === 'Admin@123') {
    //                         isValid = true;
    //                         role = 'admin';
    //                         userData = {
    //                             email,
    //                             role,
    //                             name: 'Administrator'
    //                         };
    //                     }
    //                     break;
    //                 case 'teacher':
    //                     if (email === 'faculty@college.edu' && password === 'Faculty@123') {
    //                         isValid = true;
    //                         role = 'teacher';
    //                         userData = {
    //                             email,
    //                             role,
    //                             name: 'Professor',
    //                             department: 'Computer Science'
    //                         };
    //                     }
    //                     break;
    //                 case 'student':
    //                     const student = students.find(s => s.email === email);
    //                     if (student) {
    //                         // Compare hashed passwords
    //                         if (email === 'student@college.edu' && student.password === simpleHash(password)) {
    //                             isValid = true;
    //                             role = 'student';
    //                             userData = {
    //                                 email,
    //                                 role,
    //                                 studentId: student.id,
    //                                 name: student.name,
    //                                 section: student.section,
    //                                 rollNumber: student.rollNumber
    //                             };
    //                         }
    //                     }
    //                     break;
    //             }

    //             if (isValid) {
    //                 currentUser = userData;

    //                 if (rememberMe) {
    //                     localStorage.setItem('rememberedUser', JSON.stringify(currentUser));
    //                 } else {
    //                     localStorage.removeItem('rememberedUser');
    //                 }

    //                 // Close modal and reset form
    //                 const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    //                 loginModal.hide();
    //                 e.target.reset();

    //                 // Update UI
    //                 renderMainContent();
    //                 showToast(`Welcome back, ${userData.name || role.charAt(0).toUpperCase() + role.slice(1)}!`, 'success');
    //             } else {
    //                 throw new Error('Invalid institutional credentials');
    //             }
    //         } catch (error) {
    //             showToast(error.message, 'danger');
    //         } finally {
    //             submitButton.innerHTML = originalText;
    //             submitButton.disabled = false;
    //         }
    //     }, 1500);
    // }
    // In your AttendanceSystem module, update the handleLogin function:
    function handleLogin(e) {
        e.preventDefault();

        const loginType = document.querySelector('input[name="loginType"]:checked')?.value;
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Form validation
        const form = e.target;
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Authenticating...';
        submitButton.disabled = true;

        // Simulate API call
        setTimeout(() => {
            try {
                if (!loginType) {
                    throw new Error('Please select your role');
                }

                let isValid = false;
                let role = '';
                let userData = null;

                // Check credentials based on login type
                switch (loginType) {
                    case 'admin':
                        if (email === 'admin@jntugv.edu.in' && password === 'Admin@123') {
                            isValid = true;
                            role = 'admin';
                            userData = {
                                email,
                                role,
                                name: 'Administrator'
                            };
                        }
                        break;
                    case 'teacher':
                        if (email === 'faculty@jntugv.edu.in' && password === 'Faculty@123') {
                            isValid = true;
                            role = 'teacher';
                            userData = {
                                email,
                                role,
                                name: 'Professor',
                                department: 'Computer Science'
                            };
                        }
                        break;
                    case 'student':
                        const student = students.find(s => s.email === email);
                        if (student) {
                            // Compare hashed passwords
                            if (simpleHash(password) === student.password) {
                                isValid = true;
                                role = 'student';
                                userData = {
                                    email,
                                    role,
                                    studentId: student.id,
                                    name: student.name,
                                    section: student.section,
                                    rollNumber: student.roll
                                };
                            } else {
                                throw new Error('Incorrect password');
                            }
                        } else {
                            throw new Error('Student not found with this email');
                        }
                        break;
                    default:
                        throw new Error('Invalid role selected');
                }

                if (!isValid && !userData) {
                    throw new Error('Invalid credentials for selected role');
                }

                currentUser = userData;

                if (rememberMe) {
                    localStorage.setItem('rememberedUser', JSON.stringify(currentUser));
                } else {
                    localStorage.removeItem('rememberedUser');
                }

                // Hide login section and show main content
                document.getElementById('loginSection').style.display = 'none';
                document.getElementById('mainContent').style.display = 'block';

                // Update UI
                renderMainContent();
                showToast(`Welcome back, ${userData.name || role.charAt(0).toUpperCase() + role.slice(1)}!`, 'success');

                // Close modal if exists
                const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                if (loginModal) loginModal.hide();

                // Reset form
                e.target.reset();

            } catch (error) {
                showToast(error.message, 'danger');
            } finally {
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }
        }, 1500);
    }


    // Handle logout
    function handleLogout() {
        currentUser = null;
        localStorage.removeItem('rememberedUser');
        renderMainContent();
        showToast('Logged out successfully', 'info');
    }

    // Render main content based on login state
    function renderMainContent() {
        // Clear any existing modals
        elements.modalContainer.innerHTML = '';

        // Check authentication status
        if (!currentUser) {
            renderLoggedOutView();
            return;
        }

        // Add loading indicator
        elements.mainContent.innerHTML = `
        <div class="d-flex justify-content-center align-items-center" style="height: 300px;">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

        // Render appropriate dashboard after a small delay for better UX
        setTimeout(() => {
            try {
                switch (currentUser.role) {
                    case 'admin':
                        renderAdminDashboard();
                        break;
                    case 'teacher':
                        renderTeacherDashboard();
                        break;
                    case 'student':
                        renderStudentDashboard();
                        break;
                    default:
                        throw new Error('Invalid user role');
                }

                // Initialize tooltips for the new content
                const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
                tooltipTriggerList.map(function (tooltipTriggerEl) {
                    return new bootstrap.Tooltip(tooltipTriggerEl);
                });

            } catch (error) {
                console.error('Dashboard rendering error:', error);
                showToast('Failed to load dashboard', 'danger');
                handleLogout();
            }
        }, 200);
    }

    // Render logged out view
    function renderLoggedOutView() {
        elements.mainContent.innerHTML = `
        <section class="login-section" id="loginSection">
            <div class="login-container">
                <!-- Left Side with College Background -->
                <div class="login-left">
                    <div class="login-overlay"></div>
                    <div class="login-content">
                        <img src="https://jntugv.edu.in/static/media/jntugvcev.b33bb43b07b2037ab043.jpg" alt="College Logo"
                            class="college-logo">
                        <h1>JNTUGV Attendance System</h1>
                        <p>Track, manage and analyze student attendance with precision</p>
                        <div class="college-features">
                            <div class="feature">
                                <i class="fas fa-check-circle"></i>
                                <span>Real-time attendance tracking</span>
                            </div>
                            <div class="feature">
                                <i class="fas fa-check-circle"></i>
                                <span>Automated reports</span>
                            </div>
                            <div class="feature">
                                <i class="fas fa-check-circle"></i>
                                <span>Secure access</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Side with Login Form -->
                <div class="login-right">
                    <div class="login-form-container">
                        <h2>Secure Login</h2>
                        <p class="login-subtitle">Access your institutional account</p>

                        <!-- Role Selection Cards -->
                        <div class="role-selection mb-4">
                            <div class="role-options">
                                <input type="radio" class="btn-check" name="loginType" id="studentType" value="student"
                                    autocomplete="off" checked>
                                <label class="role-option" for="studentType">
                                    <i class="fas fa-user-graduate"></i>
                                    <span>Student</span>
                                </label>

                                <input type="radio" class="btn-check" name="loginType" id="teacherType" value="teacher"
                                    autocomplete="off">
                                <label class="role-option" for="teacherType">
                                    <i class="fas fa-chalkboard-teacher"></i>
                                    <span>Faculty</span>
                                </label>

                                <input type="radio" class="btn-check" name="loginType" id="adminType" value="admin"
                                    autocomplete="off">
                                <label class="role-option" for="adminType">
                                    <i class="fas fa-user-shield"></i>
                                    <span>Admin</span>
                                </label>
                            </div>
                        </div>

                        <!-- Social Login -->
                        <!-- <div class="social-login">
                            <button class="social-btn google">
                                <i class="fab fa-google"></i> Continue with Google
                            </button>
                            <button class="social-btn microsoft">
                                <i class="fab fa-microsoft"></i> Continue with Microsoft
                            </button>
                            <button class="social-btn id-card">
                                <i class="fas fa-id-card"></i> College ID Login
                            </button>
                        </div>

                        <div class="divider">
                            <span>or use institutional credentials</span>
                        </div>      -->

                        <!-- Login Form -->
                        <form id="loginForm" novalidate>
                            <div class="form-group">
                                <label for="loginEmail">Institutional Email</label>
                                <div class="input-with-icon">
                                    <i class="fas fa-envelope"></i>
                                    <input type="email" id="loginEmail" placeholder="username@jntugv.edu.in"
                                        pattern="[a-z0-9._%+-]+@jntugv\.edu\.in$"
                                        title="Please use your institutional email" required>
                                    <div class="invalid-feedback">Please enter a valid college email</div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="loginPassword">Password</label>
                                <div class="input-with-icon">
                                    <i class="fas fa-lock"></i>
                                    <input type="password" id="loginPassword" placeholder="Enter your password"
                                        minlength="8" required>
                                    <i class="fas fa-eye toggle-password position-eye"></i>
                                    <div class="invalid-feedback">Password must be at least 8 characters</div>
                                </div>
                            </div>

                            <div class="form-options">
                                <div class="remember-me">
                                    <input type="checkbox" id="rememberMe">
                                    <label for="rememberMe">Remember this device</label>
                                </div>
                                <a href="#forgot-password" class="forgot-password">Forgot password?</a>
                            </div>

                            <button type="submit" class="login-btn">
                                <i class="fas fa-sign-in-alt"></i> Secure Login
                            </button>
                        </form>

                        <!-- Help Section -->
                        <div class="help-section">
                            <p>Need help accessing your account?</p>
                            <div class="help-links">
                                <a href="#contact-support">
                                    <i class="fas fa-headset"></i> IT Support
                                </a>
                                <a href="#faq">
                                    <i class="fas fa-question-circle"></i> FAQs
                                </a>
                                <a href="#contact-admin">
                                    <i class="fas fa-user-cog"></i> Contact Admin
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;

        // Re-attach event listeners after rendering
        document.getElementById('loginForm')?.addEventListener('submit', handleLogin);

        // Add password toggle functionality
        document.querySelectorAll('.toggle-password').forEach(icon => {
            icon.addEventListener('click', function () {
                const passwordInput = this.previousElementSibling;
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.classList.toggle('fa-eye-slash');
                this.classList.toggle('fa-eye');
            });
        });
    }

    // Render admin dashboard
    // Render admin dashboard with section cards and delete options
    function renderAdminDashboard() {
        const sections = [...new Set(students.map(s => s.section))];

        elements.mainContent.innerHTML = `
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
                <div class="card text-white bg-primary h-100">
                    <div class="card-body">
                        <h5 class="card-title"><i class="fas fa-users me-2"></i>Total Students</h5>
                        <p class="card-text display-4">${students.length}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card text-white bg-success h-100">
                    <div class="card-body">
                        <h5 class="card-title"><i class="fas fa-calendar-check me-2"></i>Attendance Records</h5>
                        <p class="card-text display-4">${attendanceRecords.length}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card text-white bg-info h-100">
                    <div class="card-body">
                        <h5 class="card-title"><i class="fas fa-chart-pie me-2"></i>Sections</h5>
                        <p class="card-text display-4">${sections.length}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card mb-4 animate__animated animate__fadeInUp">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="fas fa-users me-2"></i>Students by Section</h5>
                <button class="btn btn-sm btn-outline-primary" id="showAllStudents">
                    Show All Students
                </button>
            </div>
            <div class="card-body">
                <div class="row mb-4" id="sectionCardsContainer">
                    ${sections.map(section => {
            const sectionStudents = students.filter(s => s.section === section);
            return `
                            <div class="col-md-3 mb-3">
                                <div class="card section-card animate-hover" data-section="${section}">
                                    <div class="card-body text-center">
                                        <h5 class="card-title">${section}</h5>
                                        <p class="display-6">${sectionStudents.length}</p>
                                        <p class="text-muted">Students</p>
                                    </div>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
                <div id="studentsTableContainer">
                    ${students.length > 0 ? renderStudentTable() : '<p class="text-muted">No students added yet.</p>'}
                </div>
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

        <div class="card animate__animated animate__fadeInUp mt-4">
            <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-filter me-2"></i>Filter Attendance Records</h5>
            </div>
            <div class="card-body">
                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label">Section</label>
                        <select class="form-select" id="filterSection">
                            <option value="">All Sections</option>
                            ${sections.map(section => `
                                <option value="${section}">${section}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Subject</label>
                        <select class="form-select" id="filterSubject">
                            <option value="">All Subjects</option>
                            <option value="Data Structures">Data Structures</option>
                            <option value="Database management System">DBMS</option>
                            <option value="Design and analysis and algorithm">DAA</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Java">Java</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Date</label>
                        <input type="date" class="form-control" id="filterDate">
                    </div>
                </div>
                <button id="applyFilters" class="btn btn-primary me-2">
                    <i class="fas fa-filter me-1"></i> Apply Filters
                </button>
                <button id="resetFilters" class="btn btn-outline-secondary">
                    <i class="fas fa-undo me-1"></i> Reset
                </button>
                
                <div id="filterLoading" class="text-center py-4 d-none">
                    <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Processing filters...</p>
                </div>
                
                <div id="filteredResults" class="mt-4"></div>
            </div>
        </div>
    `;
    }

    // Render student table with delete options
    function renderStudentTable(filterSection = null) {
        const filteredStudents = filterSection
            ? students.filter(s => s.section === filterSection)
            : students;

        if (filteredStudents.length === 0) {
            return '<p class="text-muted">No students found</p>';
        }

        return `
    <div class="table-responsive">
        <table class="table table-striped table-hover">
            <thead>
                <tr>
                    <th>Roll No.</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Section</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filteredStudents.map(student => `
                    <tr>
                        <td>${student.roll}</td>
                        <td>${student.name}</td>
                        <td>${student.email}</td>
                        <td>${student.section}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary edit-student me-2" 
                                    data-id="${student.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-student" 
                                    data-id="${student.id}">
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


    // Add new student
    function handleAddStudent(e) {
        e.preventDefault();

        const name = document.getElementById('studentName').value.trim();
        const roll = document.getElementById('studentRoll').value.trim();
        const section = document.getElementById('studentSection').value;
        const email = `${roll.toLowerCase()}@college.edu`;
        const password = simpleHash(roll); // Default password is roll number

        // Validate
        if (!name || !roll || !section) {
            showToast('Please fill all fields', 'warning');
            return;
        }

        if (students.some(s => s.roll === roll)) {
            showToast('Student with this roll number already exists', 'danger');
            return;
        }

        const newStudent = {
            id: Date.now().toString(),
            name,
            roll,
            section,
            email,
            password
        };

        students.push(newStudent);
        saveStudents();
        showToast('Student added successfully', 'success');
        renderAdminDashboard(); // Refresh view
    }

    // Delete student
    function deleteStudent(studentId) {
        if (confirm('Are you sure you want to delete this student?')) {
            students = students.filter(s => s.id !== studentId);
            saveStudents();
            renderAdminDashboard();
            showToast('Student deleted successfully', 'success');
        }
    }

    // Save students to localStorage
    function saveStudents() {
        localStorage.setItem('students', JSON.stringify(students));
    }


    // Delete student function
    function deleteStudent(studentId) {
        if (confirm('Are you sure you want to delete this student?')) {
            students = students.filter(student => student.id !== studentId);
            saveStudents();
            renderMainContent();
            showToast('Student deleted successfully', 'success');
        }
    }

    // Add to setupEventListeners:
    document.addEventListener('click', function (e) {
        // Section card click
        if (e.target.closest('.section-card')) {
            const section = e.target.closest('.section-card').dataset.section;
            document.getElementById('studentsTableContainer').innerHTML = renderStudentTable(section);

            // Highlight active card
            document.querySelectorAll('.section-card').forEach(card => {
                card.classList.remove('active-section');
            });
            e.target.closest('.section-card').classList.add('active-section');
        }

        // Show all students
        if (e.target.closest('#showAllStudents')) {
            document.getElementById('studentsTableContainer').innerHTML = renderStudentTable();
            document.querySelectorAll('.section-card').forEach(card => {
                card.classList.remove('active-section');
            });
        }

        // Delete student
        if (e.target.closest('.delete-student')) {
            const studentId = e.target.closest('.delete-student').dataset.id;
            deleteStudent(studentId);
        }
    });

    // Render teacher dashboard
    // Render teacher dashboard with section-wise students
    function renderTeacherDashboard() {
        const teacherRecords = attendanceRecords.filter(r => r.teacher === currentUser.email);
        const sectionsTaught = [...new Set(teacherRecords.map(r => r.section))];

        elements.mainContent.innerHTML = `
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
                <div class="card text-white bg-primary h-100">
                    <div class="card-body">
                        <h5 class="card-title"><i class="fas fa-users me-2"></i>Total Students</h5>
                        <p class="card-text display-4">${students.length}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="card text-white bg-success h-100">
                    <div class="card-body">
                        <h5 class="card-title"><i class="fas fa-calendar-check me-2"></i>Your Records</h5>
                        <p class="card-text display-4">${teacherRecords.length}</p>
                    </div>
                </div>
            </div>
        </div>
        
        ${sectionsTaught.map(section => `
            <div class="card mb-4 animate__animated animate__fadeInUp">
                <div class="card-header">
                    <h5 class="mb-0"><i class="fas fa-users me-2"></i>${section} Section Students</h5>
                </div>
                <div class="card-body">
                    ${renderSectionStudents(section)}
                </div>
            </div>
        `).join('')}
        
        <div class="card animate__animated animate__fadeInUp">
            <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-history me-2"></i>Your Recent Attendance</h5>
            </div>
            <div class="card-body">
                ${teacherRecords.length > 0 ? renderRecentAttendance(teacherRecords.slice(0, 5), false) : '<p class="text-muted">No attendance records yet.</p>'}
            </div>
        </div>
    `;
    }

    // Helper function to render students by section
    function renderSectionStudents(section) {
        const sectionStudents = students.filter(student => student.section === section);

        if (sectionStudents.length === 0) {
            return '<p class="text-muted">No students in this section.</p>';
        }

        return `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Roll No.</th>
                        <th>Name</th>
                        <th>Attendance Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${sectionStudents.map(student => {
            const studentRecords = attendanceRecords.filter(record =>
                record.section === section &&
                record.records.some(r => r.studentId === student.id)
            );

            const presentCount = studentRecords.reduce((count, record) => {
                const studentRecord = record.records.find(r => r.studentId === student.id);
                return count + (studentRecord?.status === 'present' ? 1 : 0);
            }, 0);

            const percentage = studentRecords.length > 0
                ? Math.round((presentCount / studentRecords.length) * 100)
                : 0;

            return `
                            <tr>
                                <td>${student.roll}</td>
                                <td>${student.name}</td>
                                <td>
                                    <div class="progress">
                                        <div class="progress-bar ${percentage >= 75 ? 'bg-success' : percentage >= 50 ? 'bg-warning' : 'bg-danger'}" 
                                             role="progressbar" style="width: ${percentage}%" 
                                             aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                                            ${percentage}%
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        </div>
    `;
    }

    // Render student table
    function renderStudentTable() {
        return `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Roll No.</th>
                            <th>Name</th>
                            <th>Section</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(student => `
                            <tr class="animate__animated animate__fadeIn">
                                <td>${student.roll}</td>
                                <td>${student.name}</td>
                                <td>${student.section}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    

    // Render recent attendance
    // Render recent attendance
    function renderRecentAttendance(records = attendanceRecords.slice(0, 5), showTeacher = true) {
        return `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Subject</th>
                        ${showTeacher ? '<th>Teacher</th>' : ''}
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${records.map((record, index) => `
                        <tr class="animate__animated animate__fadeIn" style="animation-delay: ${index * 0.1}s">
                            <td>${formatDate(record.date)}</td>
                            <td>${record.subject}</td>
                            ${showTeacher ? `<td>${record.teacher}</td>` : ''}
                            <td>${record.records.filter(r => r.status === 'present').length}</td>
                            <td>${record.records.filter(r => r.status === 'absent').length}</td>
                            <td>
                                <div class="d-flex">
                                    <button class="btn btn-sm btn-outline-primary view-attendance me-1 animate-hover" 
                                            data-id="${record.id}" data-bs-toggle="tooltip" title="View Details">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-warning edit-attendance me-1 animate-hover" 
                                            data-id="${record.id}" data-bs-toggle="tooltip" title="Edit Record">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger delete-attendance animate-hover" 
                                            data-id="${record.id}" data-bs-toggle="tooltip" title="Delete Record">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    }

    // Render attendance page
    function renderAttendancePage() {
        elements.mainContent.innerHTML = `
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
                        <div class="table-responsive">
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

    // Handle add student
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

        // Check if roll number exists
        if (students.some(student => student.roll === roll)) {
            showToast('Student with this roll number already exists!', 'danger');
            return;
        }

        // Generate email and password
        const email = `${roll.toLowerCase()}@college.com`;
        const password = simpleHash(roll); // Hash the roll number as default password

        const newStudent = {
            id: Date.now().toString(),
            name,
            roll,
            section,
            email,
            password // Store hashed password
        };

        students.push(newStudent);
        saveStudents();

        // Close modal and reset form
        const addStudentModal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
        addStudentModal.hide();
        e.target.reset();

        // Update UI
        renderMainContent();
        showToast(`Student added successfully! Default password: ${roll}`, 'success');

        // Refresh attendance page if open
        if (document.getElementById('attendancePage')) {
            renderAttendancePage();
        }
    }

    // Simple hash function for passwords (use bcrypt in production)
    function simpleHash(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    // Handle select date for attendance
    function handleSelectDate(e) {
        e.preventDefault();

        const date = document.getElementById('attendanceDate').value;
        const subject = document.getElementById('attendanceSubject').value;
        const section = document.getElementById('attendanceSection').value;

        if (!date || !subject || !section) {
            showToast('Please fill all fields', 'warning');
            return;
        }

        // Set up current attendance
        currentAttendance = {
            date,
            subject,
            section,
            teacher: currentUser.email,
            records: []
        };

        // Find students in this section
        const sectionStudents = students.filter(student => student.section === section);

        // Initialize attendance records for each student (default: present)
        currentAttendance.records = sectionStudents.map(student => ({
            studentId: student.id,
            status: 'present'
        }));

        // Close modal and reset form
        const selectDateModal = bootstrap.Modal.getInstance(document.getElementById('selectDateModal'));
        selectDateModal.hide();
        e.target.reset();

        // Render attendance page
        renderAttendancePage();
    }

    // Toggle attendance status
    function toggleAttendanceStatus(button) {
        const studentId = button.dataset.studentId;
        const record = currentAttendance.records.find(r => r.studentId === studentId);

        if (record) {
            record.status = record.status === 'present' ? 'absent' : 'present';
            button.classList.toggle('present');
            button.classList.toggle('absent');
            button.innerHTML = `<i class="fas ${record.status === 'present' ? 'fa-check' : 'fa-times'}"></i>`;

            // Update counts in header
            const presentCount = currentAttendance.records.filter(r => r.status === 'present').length;
            const absentCount = currentAttendance.records.filter(r => r.status === 'absent').length;

            document.querySelector('.badge.bg-success').innerHTML = `<i class="fas fa-check"></i> Present: ${presentCount}`;
            document.querySelector('.badge.bg-danger').innerHTML = `<i class="fas fa-times"></i> Absent: ${absentCount}`;
        }
    }

    // Save current attendance
    // Save current attendance
    function saveCurrentAttendance() {
        // Validate
        if (currentAttendance.records.length === 0) {
            showToast('No attendance records to save', 'warning');
            return;
        }

        // Check if this is an edit or new record
        const isEdit = attendanceRecords.some(r => r.id === currentAttendance.id);

        if (isEdit) {
            // Update existing record
            const index = attendanceRecords.findIndex(r => r.id === currentAttendance.id);
            attendanceRecords[index] = currentAttendance;
            showToast('Attendance record updated successfully!', 'success');
        } else {
            // Add new record with unique ID
            currentAttendance.id = Date.now().toString();
            attendanceRecords.push(currentAttendance);
            showToast('Attendance record saved successfully!', 'success');
        }

        saveAttendanceRecords();

        // Return to dashboard
        renderMainContent();
    }

    // Confirm leaving attendance page
    function confirmLeaveAttendance() {
        const confirmLeave = confirm('You have unsaved changes. Are you sure you want to leave?');
        if (confirmLeave) {
            renderMainContent();
        }
    }

    // View attendance details
    function viewAttendanceDetails(recordId) {
        const record = attendanceRecords.find(r => r.id === recordId);
        if (!record) return;

        const modalContent = `
            <div class="modal-header">
                <h5 class="modal-title">Attendance Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <h6>${formatDate(record.date)} - ${record.subject}</h6>
                    <p class="mb-1">Section: ${record.section}</p>
                    <p>Teacher: ${record.teacher}</p>
                </div>
                
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Roll No.</th>
                                <th>Name</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${record.records.map(r => {
            const student = students.find(s => s.id === r.studentId);
            return `
                                    <tr>
                                        <td>${student?.roll || 'N/A'}</td>
                                        <td>${student?.name || 'Unknown Student'}</td>
                                        <td>
                                            <span class="badge ${r.status === 'present' ? 'bg-success' : 'bg-danger'}">
                                                ${r.status === 'present' ? 'Present' : 'Absent'}
                                            </span>
                                        </td>
                                    </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary download-attendance" data-id="${record.id}">
                    <i class="fas fa-download me-1"></i> Download
                </button>
            </div>
        `;

        showModal(modalContent);
    }

    // Download attendance as PDF
    function downloadAttendance(recordId) {
        const record = attendanceRecords.find(r => r.id === recordId);
        if (!record) return;

        // In a real app, this would generate an actual PDF
        // For this demo, we'll just show a success message
        showToast(`Preparing download for ${record.subject} on ${formatDate(record.date)}`, 'info');

        // Simulate PDF generation delay
        setTimeout(() => {
            showToast('PDF downloaded successfully!', 'success');
        }, 1500);
    }

    // Apply filters
    function applyFilters() {
        const section = document.getElementById('filterSection').value;
        const subject = document.getElementById('filterSubject').value;
        const date = document.getElementById('filterDate').value;

        const resultsContainer = document.getElementById('filteredResults');
        const loading = document.getElementById('filterLoading');

        // Show loading
        resultsContainer.innerHTML = '';
        loading.classList.remove('d-none');

        // Simulate API delay
        setTimeout(() => {
            let filtered = [...attendanceRecords];

            if (section) {
                filtered = filtered.filter(r => r.section === section);
            }

            if (subject) {
                filtered = filtered.filter(r => r.subject === subject);
            }

            if (date) {
                filtered = filtered.filter(r => r.date === date);
            }

            // Hide loading
            loading.classList.add('d-none');

            // Show results
            if (filtered.length === 0) {
                resultsContainer.innerHTML = '<p class="text-muted">No records match your filters.</p>';
                return;
            }

            // Group by date, subject, section
            const grouped = {};
            filtered.forEach(record => {
                const key = `${record.date}-${record.subject}-${record.section}`;
                if (!grouped[key]) {
                    grouped[key] = {
                        date: record.date,
                        subject: record.subject,
                        section: record.section,
                        count: 0,
                        present: 0
                    };
                }
                grouped[key].count += record.records.length;
                grouped[key].present += record.records.filter(r => r.status === 'present').length;
            });

            const resultsHTML = `
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Subject</th>
                                <th>Section</th>
                                <th>Present</th>
                                <th>Total</th>
                                <th>Percentage</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.values(grouped).map(group => `
                                <tr>
                                    <td>${formatDate(group.date)}</td>
                                    <td>${group.subject}</td>
                                    <td>${group.section}</td>
                                    <td>${group.present}</td>
                                    <td>${group.count}</td>
                                    <td>${Math.round((group.present / group.count) * 100)}%</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary view-filtered-attendance me-1 animate-hover"
                                                data-date="${group.date}" data-subject="${group.subject}" data-section="${group.section}">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-success download-filtered-attendance animate-hover"
                                                data-date="${group.date}" data-subject="${group.subject}" data-section="${group.section}">
                                            <i class="fas fa-download"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            resultsContainer.innerHTML = resultsHTML;
        }, 1000);
    }

    // Reset filters
    function resetFilters() {
        document.getElementById('filterSection').value = '';
        document.getElementById('filterSubject').value = '';
        document.getElementById('filterDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('filteredResults').innerHTML = '';
    }

    // View filtered attendance
    function viewFilteredAttendance(date, subject, section) {
        const filtered = attendanceRecords.filter(r =>
            r.date === date &&
            r.subject === subject &&
            r.section === section
        );

        if (filtered.length === 0) return;

        // Combine all records from matching attendance
        const combinedRecords = [];
        filtered.forEach(record => {
            combinedRecords.push(...record.records);
        });

        const modalContent = `
            <div class="modal-header">
                <h5 class="modal-title">${formatDate(date)} - ${subject} (${section})</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Roll No.</th>
                                <th>Name</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${combinedRecords.map(r => {
            const student = students.find(s => s.id === r.studentId);
            return `
                                    <tr>
                                        <td>${student?.roll || 'N/A'}</td>
                                        <td>${student?.name || 'Unknown Student'}</td>
                                        <td>
                                            <span class="badge ${r.status === 'present' ? 'bg-success' : 'bg-danger'}">
                                                ${r.status === 'present' ? 'Present' : 'Absent'}
                                            </span>
                                        </td>
                                    </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary download-filtered-attendance" 
                        data-date="${date}" data-subject="${subject}" data-section="${section}">
                    <i class="fas fa-download me-1"></i> Download
                </button>
            </div>
        `;

        showModal(modalContent);
    }

    // Download filtered attendance
    function downloadFilteredAttendance(date, subject, section) {
        // In a real app, this would generate an actual PDF
        showToast(`Preparing download for ${subject} (${section}) on ${formatDate(date)}`, 'info');

        // Simulate PDF generation delay
        setTimeout(() => {
            showToast('PDF downloaded successfully!', 'success');
        }, 1500);
    }

    // Show modal with custom content
    function showModal(content) {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="modal fade" id="dynamicModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        ${content}
                    </div>
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('dynamicModal'));
        modal.show();
    }

    // Show toast notification
    function showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toastId = `toast-${Date.now()}`;

        const toastHTML = `
            <div class="toast align-items-center text-white bg-${type} border-0 animate__animated animate__fadeInUp" 
                 id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        const toast = new bootstrap.Toast(document.getElementById(toastId));
        toast.show();

        // Remove toast after it hides
        document.getElementById(toastId).addEventListener('hidden.bs.toast', () => {
            document.getElementById(toastId).remove();
        });
    }

    // Format date
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Save students to localStorage
    function saveStudents() {
        localStorage.setItem('students', JSON.stringify(students));
    }

    // Save attendance records to localStorage
    function saveAttendanceRecords() {
        localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
    }

    function renderStudentDashboard() {
        // Get current student details
        const student = students.find(s => s.id === currentUser.studentId);
        if (!student) {
            showToast('Student data not found', 'danger');
            return handleLogout(); // Log out if student data is missing
        }

        // Get and process attendance records
        const studentRecords = attendanceRecords
            .filter(record => record.records.some(r => r.studentId === currentUser.studentId))
            .map(record => {
                const studentRecord = record.records.find(r => r.studentId === currentUser.studentId);
                return {
                    ...record,
                    status: studentRecord.status,
                    teacher: record.teacher
                };
            });

        // Calculate attendance statistics
        const totalClasses = studentRecords.length;
        const presentClasses = studentRecords.filter(r => r.status === 'present').length;
        const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
        const attendanceStatus = attendancePercentage >= 75 ? 'Good' : attendancePercentage >= 50 ? 'Fair' : 'Poor';

        // Generate subject-wise breakdown
        const subjectStats = {};
        studentRecords.forEach(record => {
            if (!subjectStats[record.subject]) {
                subjectStats[record.subject] = { present: 0, total: 0 };
            }
            subjectStats[record.subject].total++;
            if (record.status === 'present') {
                subjectStats[record.subject].present++;
            }
        });

        elements.mainContent.innerHTML = `
    <div class="row mb-4 animate__animated animate__fadeIn">
        <div class="col-md-6">
            <h2><i class="fas fa-user-graduate me-2"></i>Welcome, ${student.name} (${student.roll})</h2>
            <p class="text-muted">${student.section} Section</p>
        </div>
        <div class="col-md-6 text-md-end">
            <button class="btn btn-danger animate-hover" id="logoutBtn">
                <i class="fas fa-sign-out-alt me-1"></i> Logout
            </button>
        </div>
    </div>
    
    <div class="row mb-4">
        <div class="col-md-4 mb-3">
            <div class="card text-white bg-primary h-100">
                <div class="card-body">
                    <h5 class="card-title"><i class="fas fa-calendar-check me-2"></i>Total Classes</h5>
                    <p class="card-text display-4">${totalClasses}</p>
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-3">
            <div class="card text-white bg-success h-100">
                <div class="card-body">
                    <h5 class="card-title"><i class="fas fa-check-circle me-2"></i>Present</h5>
                    <p class="card-text display-4">${presentClasses}</p>
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-3">
            <div class="card text-white ${attendancePercentage >= 75 ? 'bg-info' : attendancePercentage >= 50 ? 'bg-warning' : 'bg-danger'} h-100">
                <div class="card-body">
                    <h5 class="card-title"><i class="fas fa-chart-line me-2"></i>Attendance</h5>
                    <p class="card-text display-4">${attendancePercentage}%</p>
                    <p class="mb-0">Status: ${attendanceStatus}</p>
                </div>
            </div>
        </div>
    </div>

    <div class="card mb-4 animate__animated animate__fadeInUp">
        <div class="card-header">
            <h5 class="mb-0"><i class="fas fa-book me-2"></i>Subject-wise Performance</h5>
        </div>
        <div class="card-body">
            ${Object.keys(subjectStats).length > 0 ? `
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Present</th>
                                <th>Total</th>
                                <th>Percentage</th>
                                <th>Performance</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(subjectStats).map(([subject, stats]) => {
            const percentage = Math.round((stats.present / stats.total) * 100);
            return `
                                    <tr>
                                        <td>${subject}</td>
                                        <td>${stats.present}</td>
                                        <td>${stats.total}</td>
                                        <td>${percentage}%</td>
                                        <td>
                                            <div class="progress" style="height: 20px;">
                                                <div class="progress-bar ${percentage >= 75 ? 'bg-success' : percentage >= 50 ? 'bg-warning' : 'bg-danger'}" 
                                                     role="progressbar" style="width: ${percentage}%" 
                                                     aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<p class="text-muted">No subject data available.</p>'}
        </div>
    </div>

    <div class="card animate__animated animate__fadeInUp">
        <div class="card-header">
            <h5 class="mb-0"><i class="fas fa-history me-2"></i>Detailed Attendance Records</h5>
        </div>
        <div class="card-body">
            ${studentRecords.length > 0 ? `
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Subject</th>
                                <th>Teacher</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${studentRecords.map((record, index) => `
                                <tr class="animate__animated animate__fadeIn" style="animation-delay: ${index * 0.05}s">
                                    <td>${formatDate(record.date)}</td>
                                    <td>${record.subject}</td>
                                    <td>${record.teacher || 'N/A'}</td>
                                    <td>
                                        <span class="badge ${record.status === 'present' ? 'bg-success' : 'bg-danger'}">
                                            <i class="fas ${record.status === 'present' ? 'fa-check' : 'fa-times'} me-1"></i>
                                            ${record.status === 'present' ? 'Present' : 'Absent'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<p class="text-muted">No attendance records found.</p>'}
        </div>
    </div>
    `;
    }

    // Delete attendance record
    function deleteAttendanceRecord(recordId) {
        const confirmDelete = confirm('Are you sure you want to delete this attendance record?');
        if (confirmDelete) {
            attendanceRecords = attendanceRecords.filter(record => record.id !== recordId);
            saveAttendanceRecords();
            renderMainContent();
            showToast('Attendance record deleted successfully', 'success');
        }
    }

    // Edit attendance record
    function editAttendanceRecord(recordId) {
        const record = attendanceRecords.find(r => r.id === recordId);
        if (!record) return;

        // Set as current attendance for editing
        currentAttendance = { ...record };

        // Render the attendance page in edit mode
        renderAttendancePage();

        // Show edit mode indicator
        const attendancePage = document.getElementById('attendancePage');
        if (attendancePage) {
            const header = attendancePage.querySelector('h2');
            if (header) {
                header.innerHTML += ' <span class="badge bg-warning">Edit Mode</span>';
            }
        }
    }

    // Filter students by section
    function filterStudentsBySection(section) {
        const filteredStudents = section ? students.filter(s => s.section === section) : students;
        const tableBody = document.querySelector('.table.students tbody');

        if (tableBody) {
            tableBody.innerHTML = filteredStudents.map(student => `
            <tr>
                <td>${student.roll}</td>
                <td>${student.name}</td>
                <td>${student.section}</td>
            </tr>
        `).join('');
        }
    }


    // Render section cards
    function renderSectionCards() {
        const sections = [...new Set(students.map(s => s.section))];

        if (sections.length === 0) {
            return '<p class="text-muted">No sections available</p>';
        }

        return sections.map(section => {
            const sectionStudents = students.filter(s => s.section === section);
            return `
            <div class="col-md-3 mb-3">
                <div class="card section-card animate-hover" data-section="${section}" style="cursor: pointer;">
                    <div class="card-body text-center">
                        <h5 class="card-title">${section}</h5>
                        <p class="display-6">${sectionStudents.length}</p>
                        <p class="text-muted">Students</p>
                    </div>
                </div>
            </div>
        `;
        }).join('');
    }

    // Render student table with delete options
    function renderStudentTable(filterSection = null) {
        const filteredStudents = filterSection
            ? students.filter(s => s.section === filterSection)
            : students;

        if (filteredStudents.length === 0) {
            return '<p class="text-muted">No students in this section</p>';
        }

        return `
        <div class="table-responsive">
            <table class="table table-striped table-hover students">
                <thead>
                    <tr>
                        <th>Roll No.</th>
                        <th>Name</th>
                        <th>Section</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredStudents.map(student => `
                        <tr>
                            <td>${student.roll}</td>
                            <td>${student.name}</td>
                            <td>${student.section}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger delete-student animate-hover" 
                                        data-id="${student.id}" data-bs-toggle="tooltip" title="Delete Student">
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

    // Delete student
    function deleteStudent(studentId) {
        const confirmDelete = confirm('Are you sure you want to delete this student?');
        if (confirmDelete) {
            students = students.filter(student => student.id !== studentId);
            saveStudents();
            renderMainContent();
            showToast('Student deleted successfully', 'success');
        }
    }




    // Public API
    return {
        init
    };
})();

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', AttendanceSystem.init);

// Render student dashboard




// ---------===================================================================================

// Dark/Light mode toggle with localStorage
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const toggleText = document.getElementById('toggleText');
    const icon = themeToggleBtn.querySelector('i');

    // Load saved theme
    const savedTheme = localStorage.getItem('site-theme') || 'light';
    setTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('site-theme', newTheme);
    });

    function setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            toggleText.textContent = 'Light Mode';
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            toggleText.textContent = 'Dark Mode';
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
});

// -----------------------------------------------------------------------------------------------------------------------

//===================================== Add this to your existing JavaScript code where you're building the mainContent
const mainContent = document.getElementById('mainContent');

// Background image and slideshow HTML
mainContent.innerHTML = `
    <style>
        .background-container {
            background-image: url('https://example.com/your-background-image.jpg');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            min-height: 100vh;
            padding: 20px;
        }
        
        .slideshow-container {
            max-width: 1000px;
            position: relative;
            margin: auto;
            background-color: rgba(255,255,255,0.8);
            padding: 20px;
            border-radius: 10px;
        }
        
        .slide {
            display: none;
            text-align: center;
        }
        
        .slide img {
            max-height: 500px;
            width: auto;
            border-radius: 5px;
        }
        
        .prev, .next {
            cursor: pointer;
            position: absolute;
            top: 50%;
            width: auto;
            padding: 16px;
            margin-top: -22px;
            color: white;
            font-weight: bold;
            font-size: 18px;
            transition: 0.6s ease;
            border-radius: 0 3px 3px 0;
            user-select: none;
            background-color: rgba(0,0,0,0.5);
        }
        
        .next {
            right: 0;
            border-radius: 3px 0 0 3px;
        }
        
        .prev:hover, .next:hover {
            background-color: rgba(0,0,0,0.8);
        }
        
        .fade {
            animation-name: fade;
            animation-duration: 1.5s;
        }
        
        @keyframes fade {
            from {opacity: .4}
            to {opacity: 1}
        }
    </style>

    <div class="background-container">
        <div class="slideshow-container">
            <div class="slide fade">
                <img src="https://example.com/college1.jpg" alt="College Photo 1">
            </div>
            
            <div class="slide fade">
                <img src="https://example.com/college2.jpg" alt="College Photo 2">
            </div>
            
            <div class="slide fade">
                <img src="https://example.com/college3.jpg" alt="College Photo 3">
            </div>
            
            <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
            <a class="next" onclick="plusSlides(1)">&#10095;</a>
        </div>
    </div>

    <script>
        let slideIndex = 1;
        showSlides(slideIndex);
        
        function plusSlides(n) {
            showSlides(slideIndex += n);
        }
        
        function showSlides(n) {
            let i;
            let slides = document.getElementsByClassName("slide");
            if (n > slides.length) {slideIndex = 1}
            if (n < 1) {slideIndex = slides.length}
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
            }
            slides[slideIndex-1].style.display = "block";
        }
        
        // Auto slide change every 5 seconds
        setInterval(() => {
            plusSlides(1);
        }, 5000);
    </script>
`;

// ========================================================================================


