// --- AUTHENTICATION & SESSION MANAGEMENT ---
const Auth = {
  // Session Accessors
  getSession() {
    try {
      const session = sessionStorage.getItem('authSession');
      return session ? JSON.parse(session) : null;
    } catch (e) {
      console.error('Error reading authSession from sessionStorage', e);
      return null;
    }
  },

  setSession(role, data) {
    const sessionData = { role, data, timestamp: Date.now() };
    sessionStorage.setItem('authSession', JSON.stringify(sessionData));
  },

  clearSession() {
    sessionStorage.removeItem('authSession');
  },

  // Login Checks
  isLoggedIn() {
    return this.getSession() !== null;
  },

  isAdmin() {
    const session = this.getSession();
    return session && session.role === 'admin';
  },

  isStudent() {
    const session = this.getSession();
    return session && session.role === 'student';
  },

  // Auth Actions
  loginStudent(enrollment, password) {
    const student = DB.findStudent(enrollment);
    if (!student) {
      return { success: false, message: 'Student enrollment number not found.' };
    }
    if (student.password !== password) {
      return { success: false, message: 'Invalid password. Please try again.' };
    }

    // Set Session
    this.setSession('student', {
      enrollment: student.enrollment,
      name: student.name,
      department: student.department,
      email: student.email
    });
    return { success: true, message: 'Logged in successfully.' };
  },

  loginAdmin(adminId, password) {
    const admin = DB.ADMINS.find(a => a.id === adminId);
    if (!admin) {
      return { success: false, message: 'Admin ID not found.' };
    }
    if (admin.password !== password) {
      return { success: false, message: 'Invalid admin credentials.' };
    }

    // Set Session
    this.setSession('admin', {
      id: admin.id,
      name: admin.name
    });
    return { success: true, message: 'Administrator logged in successfully.' };
  },

  registerStudent(name, enrollment, department, email, password, confirmPassword) {
    // Basic Form Validations
    if (!name || !enrollment || !department || !email || !password || !confirmPassword) {
      return { success: false, message: 'Please fill in all registration fields.' };
    }

    // Check unique enrollment
    if (DB.findStudent(enrollment)) {
      return { success: false, message: 'Enrollment number already registered.' };
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match.' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    // Save student
    const newStudent = { enrollment, name, department, email, password };
    const success = DB.addStudent(newStudent);
    if (success) {
      return { success: true, message: 'Account registered successfully! Redirecting to login.' };
    } else {
      return { success: false, message: 'Database write error. Try again.' };
    }
  },

  logout() {
    this.clearSession();
    DB.showToast('Logged out successfully.', 'info');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);
  },

  // Route Guards (Call at top of HTML documents)
  guardStudentRoute() {
    if (!this.isStudent()) {
      DB.showToast('Access Denied. Student authorization required.', 'error');
      setTimeout(() => {
        window.location.href = 'student-login.html';
      }, 1000);
      document.body.style.display = 'none'; // Hide content until redirected
    }
  },

  guardAdminRoute() {
    if (!this.isAdmin()) {
      DB.showToast('Access Denied. Administrator authorization required.', 'error');
      setTimeout(() => {
        window.location.href = 'admin-login.html';
      }, 1000);
      document.body.style.display = 'none'; // Hide content until redirected
    }
  },

  guardGuestRoute() {
    if (this.isStudent()) {
      window.location.href = 'student-dashboard.html';
    } else if (this.isAdmin()) {
      window.location.href = 'admin-panel.html';
    }
  }
};
