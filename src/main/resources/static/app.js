const API_URL = '/api/students';

// DOM Elements
const studentForm = document.getElementById('student-form');
const studentIdInput = document.getElementById('student-id');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const ageInput = document.getElementById('age');
const studentsBody = document.getElementById('students-body');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');

// Initial Load
document.addEventListener('DOMContentLoaded', fetchStudents);

// Fetch all students
async function fetchStudents() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch students');
        
        const students = await response.json();
        renderStudents(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        studentsBody.innerHTML = `<tr><td colspan="4" class="empty-state">Error loading students. Please try again.</td></tr>`;
    }
}

// Render students in table
function renderStudents(students) {
    if (students.length === 0) {
        studentsBody.innerHTML = `<tr><td colspan="4" class="empty-state">No students found. Add one to get started!</td></tr>`;
        return;
    }

    studentsBody.innerHTML = '';
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHTML(student.name)}</strong></td>
            <td>${escapeHTML(student.email)}</td>
            <td>${student.age}</td>
            <td>
                <button class="btn btn-edit" onclick="editStudent(${student.id}, '${escapeHTML(student.name)}', '${escapeHTML(student.email)}', ${student.age})">Edit</button>
                <button class="btn btn-danger" onclick="deleteStudent(${student.id})">Delete</button>
            </td>
        `;
        studentsBody.appendChild(row);
    });
}

// Handle Form Submit (Add or Update)
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const student = {
        name: nameInput.value,
        email: emailInput.value,
        age: parseInt(ageInput.value)
    };

    const id = studentIdInput.value;

    try {
        if (id) {
            // Update
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(student)
            });
            if (!response.ok) throw new Error('Failed to update student');
        } else {
            // Create
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(student)
            });
            if (!response.ok) throw new Error('Failed to add student');
        }

        resetForm();
        fetchStudents();
    } catch (error) {
        console.error('Error saving student:', error);
        alert('Error saving student. Please check console for details.');
    }
});

// Delete student
async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete student');
        
        fetchStudents();
    } catch (error) {
        console.error('Error deleting student:', error);
        alert('Error deleting student.');
    }
}

// Populate form for editing
function editStudent(id, name, email, age) {
    studentIdInput.value = id;
    nameInput.value = name;
    emailInput.value = email;
    ageInput.value = age;

    formTitle.textContent = 'Update Student';
    submitBtn.textContent = 'Update Student';
    cancelBtn.style.display = 'block';
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Cancel edit and reset form
cancelBtn.addEventListener('click', resetForm);

function resetForm() {
    studentForm.reset();
    studentIdInput.value = '';
    formTitle.textContent = 'Add New Student';
    submitBtn.textContent = 'Save Student';
    cancelBtn.style.display = 'none';
}

// Utility to escape HTML and prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}
