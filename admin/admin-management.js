// ===========================
// ADMIN MANAGEMENT JAVASCRIPT
// Student & Teacher CRUD Operations
// ===========================

const API_BASE_URL = 'http://localhost:3300/api';

// Global variables to track current operation
let currentStudentId = null;
let currentTeacherId = null;
let allStudents = [];
let allTeachers = [];

// ===========================
// STUDENT MANAGEMENT FUNCTIONS
// ===========================

// Load all students
async function loadStudents() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/students`);

    if (!response.ok) {
      throw new Error('Failed to load students');
    }

    const data = await response.json();
    allStudents = data.students;

    renderStudentsTable(allStudents);
    populateClassFilters(allStudents);

  } catch (error) {
    console.error('Error loading students:', error);
    showErrorInTable('studentsTableBody', 'Failed to load students. Make sure the server is running.');
  }
}

// Render students table
function renderStudentsTable(students) {
  const tbody = document.getElementById('studentsTableBody');

  if (!students || students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-4 text-muted">
          No students found. Click "Add Student" to create one.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = students.map(student => {
    // Only show PIN for students (not teachers/admins)
    const pinDisplay = student.role === 'student'
      ? `<span class="badge bg-success" style="font-size: 1.1em; font-family: monospace;">${student.pin_code || 'N/A'}</span>`
      : '<span class="text-muted">-</span>';

    return `
      <tr>
        <td>${student.id}</td>
        <td><strong>${student.name}</strong></td>
        <td>${student.email || 'No email'}</td>
        <td><span class="badge bg-info">${student.class_code}</span></td>
        <td>${pinDisplay}</td>
        <td>${formatDate(student.created_at)}</td>
        <td>${formatRelativeTime(student.last_active)}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="openEditStudentModal(${student.id})" title="Edit">
            ✏️
          </button>
          <button class="btn btn-sm btn-warning" onclick="openResetModal(${student.id})" title="Reset Progress">
            🔄
          </button>
          <button class="btn btn-sm btn-secondary" onclick="openResetPINModal(${student.id})" title="Reset PIN">
            🔑
          </button>
          <button class="btn btn-sm btn-danger" onclick="openDeleteStudentModal(${student.id})" title="Delete">
            🗑️
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Open modal to add new student
function openAddStudentModal() {
  document.getElementById('studentModalLabel').textContent = 'Add New Student';
  document.getElementById('studentForm').reset();
  document.getElementById('studentId').value = '';

  const modal = new bootstrap.Modal(document.getElementById('studentModal'));
  modal.show();
}

// Open modal to edit student
function openEditStudentModal(studentId) {
  const student = allStudents.find(s => s.id === studentId);

  if (!student) {
    alert('Student not found');
    return;
  }

  document.getElementById('studentModalLabel').textContent = 'Edit Student';
  document.getElementById('studentId').value = student.id;
  document.getElementById('studentName').value = student.name;
  document.getElementById('studentEmail').value = student.email;
  document.getElementById('studentClass').value = student.class_code;

  const modal = new bootstrap.Modal(document.getElementById('studentModal'));
  modal.show();
}

// Save student (create or update)
async function saveStudent() {
  const studentId = document.getElementById('studentId').value;
  const name = document.getElementById('studentName').value.trim();
  const email = document.getElementById('studentEmail').value.trim();
  const class_code = document.getElementById('studentClass').value.trim();

  if (!name || !email) {
    alert('Please fill in all required fields');
    return;
  }

  const payload = { name, email, class_code };

  try {
    let response;

    if (studentId) {
      // Update existing student
      response = await fetch(`${API_BASE_URL}/admin/student/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      // Create new student
      response = await fetch(`${API_BASE_URL}/admin/student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save student');
    }

    const result = await response.json();

    // Close modal and reload
    bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();

    // Show PIN if creating new student
    if (!studentId && result.pin) {
      showSuccessMessage(`Student created successfully! PIN: ${result.pin}`, 8000);
    } else {
      showSuccessMessage(studentId ? 'Student updated successfully' : 'Student created successfully');
    }

    loadStudents();

  } catch (error) {
    console.error('Error saving student:', error);
    alert(error.message);
  }
}

// Open delete confirmation modal
function openDeleteStudentModal(studentId) {
  const student = allStudents.find(s => s.id === studentId);

  if (!student) {
    alert('Student not found');
    return;
  }

  currentStudentId = studentId;
  document.getElementById('deleteStudentName').textContent = `${student.name} (${student.email})`;

  const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
  modal.show();
}

// Confirm delete student
async function confirmDelete() {
  if (!currentStudentId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/admin/student/${currentStudentId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete student');
    }

    // Close modal and reload
    bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
    showSuccessMessage('Student deleted successfully');
    currentStudentId = null;
    loadStudents();

  } catch (error) {
    console.error('Error deleting student:', error);
    alert(error.message);
  }
}

// Open reset progress modal
function openResetModal(studentId) {
  const student = allStudents.find(s => s.id === studentId);

  if (!student) {
    alert('Student not found');
    return;
  }

  currentStudentId = studentId;
  document.getElementById('resetStudentName').textContent = `${student.name} (${student.email})`;

  const modal = new bootstrap.Modal(document.getElementById('resetModal'));
  modal.show();
}

// Confirm reset progress
async function confirmReset() {
  if (!currentStudentId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/admin/student/${currentStudentId}/reset`, {
      method: 'POST'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reset progress');
    }

    const result = await response.json();

    // Close modal and reload
    bootstrap.Modal.getInstance(document.getElementById('resetModal')).hide();
    showSuccessMessage(`Progress reset successfully (${result.events_deleted} events deleted)`);
    currentStudentId = null;
    loadStudents();

  } catch (error) {
    console.error('Error resetting progress:', error);
    alert(error.message);
  }
}

// Open reset PIN modal
function openResetPINModal(studentId) {
  const student = allStudents.find(s => s.id === studentId);

  if (!student) {
    alert('Student not found');
    return;
  }

  currentStudentId = studentId;
  document.getElementById('resetPINStudentName').textContent = `${student.name} (${student.email})`;

  const modal = new bootstrap.Modal(document.getElementById('resetPINModal'));
  modal.show();
}

// Confirm reset PIN
async function confirmResetPIN() {
  if (!currentStudentId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/admin/student/${currentStudentId}/reset-pin`, {
      method: 'POST'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reset PIN');
    }

    const result = await response.json();

    // Close modal and reload
    bootstrap.Modal.getInstance(document.getElementById('resetPINModal')).hide();
    showSuccessMessage(`PIN reset successfully! New PIN: ${result.new_pin}`, 8000);
    currentStudentId = null;
    loadStudents();

  } catch (error) {
    console.error('Error resetting PIN:', error);
    alert(error.message);
  }
}

// ===========================
// TEACHER MANAGEMENT FUNCTIONS
// ===========================

// Load all teachers
async function loadTeachers() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/teachers`);

    if (!response.ok) {
      throw new Error('Failed to load teachers');
    }

    const data = await response.json();
    allTeachers = data.teachers;

    renderTeachersTable(allTeachers);

  } catch (error) {
    console.error('Error loading teachers:', error);
    showErrorInTable('teachersTableBody', 'Failed to load teachers. Make sure the server is running.');
  }
}

// Render teachers table
function renderTeachersTable(teachers) {
  const tbody = document.getElementById('teachersTableBody');

  if (!teachers || teachers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-4 text-muted">
          No teachers found. Click "Add Teacher" to create one.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = teachers.map(teacher => {
    const roleColor = teacher.role === 'admin' ? 'danger' : 'primary';
    const roleIcon = teacher.role === 'admin' ? '⚙️' : '👨‍🏫';

    return `
      <tr>
        <td>${teacher.id}</td>
        <td><strong>${teacher.name}</strong></td>
        <td>${teacher.email}</td>
        <td><span class="badge bg-${roleColor}">${roleIcon} ${teacher.role}</span></td>
        <td><span class="badge bg-info">${teacher.class_code || 'ALL'}</span></td>
        <td>${formatDate(teacher.created_at)}</td>
        <td>${formatRelativeTime(teacher.last_active)}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="openEditTeacherModal(${teacher.id})" title="Edit">
            ✏️
          </button>
          <button class="btn btn-sm btn-danger" onclick="openDeleteTeacherModal(${teacher.id})" title="Delete">
            🗑️
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Open modal to add new teacher
function openAddTeacherModal() {
  document.getElementById('teacherModalLabel').textContent = 'Add New Teacher';
  document.getElementById('teacherForm').reset();
  document.getElementById('teacherId').value = '';
  document.getElementById('teacherPassword').required = true;
  document.getElementById('passwordHelp').textContent = 'Required when creating new account.';

  const modal = new bootstrap.Modal(document.getElementById('teacherModal'));
  modal.show();
}

// Open modal to edit teacher
function openEditTeacherModal(teacherId) {
  const teacher = allTeachers.find(t => t.id === teacherId);

  if (!teacher) {
    alert('Teacher not found');
    return;
  }

  document.getElementById('teacherModalLabel').textContent = 'Edit Teacher';
  document.getElementById('teacherId').value = teacher.id;
  document.getElementById('teacherName').value = teacher.name;
  document.getElementById('teacherEmail').value = teacher.email;
  document.getElementById('teacherRole').value = teacher.role;
  document.getElementById('teacherClass').value = teacher.class_code || 'ALL';
  document.getElementById('teacherPassword').value = '';
  document.getElementById('teacherPassword').required = false;
  document.getElementById('passwordHelp').textContent = 'Leave blank to keep current password when editing.';

  const modal = new bootstrap.Modal(document.getElementById('teacherModal'));
  modal.show();
}

// Save teacher (create or update)
async function saveTeacher() {
  const teacherId = document.getElementById('teacherId').value;
  const name = document.getElementById('teacherName').value.trim();
  const email = document.getElementById('teacherEmail').value.trim();
  const password = document.getElementById('teacherPassword').value.trim();
  const role = document.getElementById('teacherRole').value;
  const class_code = document.getElementById('teacherClass').value.trim();

  if (!name || !email) {
    alert('Please fill in all required fields');
    return;
  }

  // Password is required for new accounts
  if (!teacherId && !password) {
    alert('Password is required when creating a new account');
    return;
  }

  const payload = { name, email, role, class_code };

  // Only include password if provided
  if (password) {
    payload.password = password;
  }

  try {
    let response;

    if (teacherId) {
      // Update existing teacher
      response = await fetch(`${API_BASE_URL}/admin/teacher/${teacherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      // Create new teacher
      response = await fetch(`${API_BASE_URL}/admin/teacher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save teacher');
    }

    // Close modal and reload
    bootstrap.Modal.getInstance(document.getElementById('teacherModal')).hide();
    showSuccessMessage(teacherId ? 'Teacher updated successfully' : 'Teacher created successfully');
    loadTeachers();

  } catch (error) {
    console.error('Error saving teacher:', error);
    alert(error.message);
  }
}

// Open delete confirmation modal for teacher
function openDeleteTeacherModal(teacherId) {
  const teacher = allTeachers.find(t => t.id === teacherId);

  if (!teacher) {
    alert('Teacher not found');
    return;
  }

  currentTeacherId = teacherId;
  document.getElementById('deleteTeacherName').textContent = `${teacher.name} (${teacher.email})`;

  const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
  modal.show();
}

// Confirm delete teacher (shares same modal as student delete)
async function confirmDeleteTeacher() {
  if (!currentTeacherId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/admin/teacher/${currentTeacherId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete teacher');
    }

    // Close modal and reload
    bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
    showSuccessMessage('Teacher deleted successfully');
    currentTeacherId = null;
    loadTeachers();

  } catch (error) {
    console.error('Error deleting teacher:', error);
    alert(error.message);
  }
}

// ===========================
// SEARCH AND FILTER FUNCTIONS
// ===========================

// Setup search and filter listeners for students page
if (document.getElementById('studentsTableBody')) {
  // Search box
  const searchBox = document.getElementById('searchBox');
  if (searchBox) {
    searchBox.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = allStudents.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query)
      );
      renderStudentsTable(filtered);
    });
  }

  // Class filter
  const classFilter = document.getElementById('classFilter');
  if (classFilter) {
    classFilter.addEventListener('change', (e) => {
      const classCode = e.target.value;
      const filtered = classCode
        ? allStudents.filter(s => s.class_code === classCode)
        : allStudents;
      renderStudentsTable(filtered);
    });
  }
}

// Setup search and filter listeners for teachers page
if (document.getElementById('teachersTableBody')) {
  // Search box
  const searchBox = document.getElementById('searchBox');
  if (searchBox) {
    searchBox.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = allTeachers.filter(teacher =>
        teacher.name.toLowerCase().includes(query) ||
        teacher.email.toLowerCase().includes(query)
      );
      renderTeachersTable(filtered);
    });
  }

  // Role filter
  const roleFilter = document.getElementById('roleFilter');
  if (roleFilter) {
    roleFilter.addEventListener('change', (e) => {
      const role = e.target.value;
      const filtered = role
        ? allTeachers.filter(t => t.role === role)
        : allTeachers;
      renderTeachersTable(filtered);
    });
  }
}

// Populate class filter dropdown
function populateClassFilters(students) {
  const classFilter = document.getElementById('classFilter');
  if (!classFilter) return;

  const classCodes = [...new Set(students.map(s => s.class_code))].sort();

  classFilter.innerHTML = '<option value="">All Classes</option>' +
    classCodes.map(code => `<option value="${code}">${code}</option>`).join('');
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

// Format date for display
function formatDate(dateString) {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Format relative time (e.g., "2h ago")
function formatRelativeTime(dateString) {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatDate(dateString);
}

// Show error message in table
function showErrorInTable(tbodyId, message) {
  const tbody = document.getElementById(tbodyId);
  const colspan = tbody.closest('table').querySelectorAll('thead th').length;

  tbody.innerHTML = `
    <tr>
      <td colspan="${colspan}" class="text-center py-5 text-danger">
        <div class="mb-2">❌ ${message}</div>
        <button class="btn btn-primary btn-sm" onclick="location.reload()">Retry</button>
      </td>
    </tr>
  `;
}

// Show success message (simple alert for now)
function showSuccessMessage(message, duration = 3000) {
  // Create a toast notification
  const toastContainer = document.createElement('div');
  toastContainer.style.position = 'fixed';
  toastContainer.style.top = '20px';
  toastContainer.style.right = '20px';
  toastContainer.style.zIndex = '9999';
  toastContainer.innerHTML = `
    <div class="alert alert-success alert-dismissible fade show" role="alert">
      <strong>✅ Success!</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;

  document.body.appendChild(toastContainer);

  // Auto remove after specified duration
  setTimeout(() => {
    toastContainer.remove();
  }, duration);
}
