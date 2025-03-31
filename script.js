// script.js

// Simple login check with localStorage
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Hardcoded credentials for simplicity
    const validUsername = "admin";
    const validPassword = "admin123";

    if (username === validUsername && password === validPassword) {
        localStorage.setItem("isLoggedIn", "true");
        document.getElementById("login-section").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
    } else {
        document.getElementById("error-message").style.display = "block";
    }
}

// Check login status when page reloads
document.addEventListener("DOMContentLoaded", function() {
    if (localStorage.getItem("isLoggedIn") === "true") {
        document.getElementById("login-section").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
    }
});

// Logout function
function logout() {
    localStorage.removeItem("isLoggedIn");
    document.getElementById("login-section").style.display = "block";
    document.getElementById("dashboard").style.display = "none";
}

// Functions to show forms
function showAddSection() {
    document.getElementById("section-form").style.display = "block";
    document.getElementById("student-form").style.display = "none";
    document.getElementById("attendance-form").style.display = "none";
}

function showRegisterStudent() {
    document.getElementById("student-form").style.display = "block";
    document.getElementById("section-form").style.display = "none";
    document.getElementById("attendance-form").style.display = "none";
}

function showMarkAttendance() {
    document.getElementById("attendance-form").style.display = "block";
    document.getElementById("section-form").style.display = "none";
    document.getElementById("student-form").style.display = "none";
}

// Dummy function to add section
function addSection() {
    const sectionName = document.getElementById("sectionName").value;
    alert(`Section "${sectionName}" added successfully!`);
}

// Dummy function to register student
function registerStudent() {
    const studentName = document.getElementById("studentName").value;
    const rollNumber = document.getElementById("rollNumber").value;
    alert(`Student "${studentName}" with Roll Number "${rollNumber}" registered successfully!`);
}

// Dummy function to mark attendance
function markAttendance() {
    const studentName = document.getElementById("attName").value;
    const rollNumber = document.getElementById("attRoll").value;
    const status = document.getElementById("attStatus").value;
    alert(`Attendance for ${studentName} (Roll No: ${rollNumber}) marked as ${status}`);
}
