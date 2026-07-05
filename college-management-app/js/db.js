// --- DATABASE UTILITIES FOR LOCALSTORAGE ---
const DB = {
  // Config
  ADMINS: [
    { id: 'ADMIN001', name: 'Admin 1', password: 'admin@123' },
    { id: 'ADMIN002', name: 'Admin 2', password: 'admin@234' },
    { id: 'ADMIN003', name: 'Admin 3', password: 'admin@345' },
    { id: 'ADMIN004', name: 'Admin 4', password: 'admin@456' },
    { id: 'ADMIN005', name: 'Admin 5', password: 'admin@567' }
  ],

  // Core Storage Access
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage`, e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Error writing ${key} to localStorage`, e);
      // Toast notification for storage limit
      DB.showToast('Storage quota exceeded! Try uploading smaller files.', 'error');
      return false;
    }
  },

  // Initialization & Seeding
  init() {
    if (!this.get('students')) this.set('students', []);
    if (!this.get('messages')) this.set('messages', []);
    if (!this.get('pdfs')) this.set('pdfs', []);
    if (!this.get('images')) this.set('images', []);

    // Seed data if database is empty
    this.seedData();
  },

  // Database Accessors
  getStudents() {
    return this.get('students') || [];
  },

  addStudent(student) {
    const students = this.getStudents();
    students.push(student);
    return this.set('students', students);
  },

  findStudent(enrollment) {
    return this.getStudents().find(s => s.enrollment === enrollment);
  },

  getMessages() {
    return this.get('messages') || [];
  },

  addMessage(msg) {
    const messages = this.getMessages();
    messages.push(msg);
    this.set('messages', messages);
    
    // Dispatch custom event for chat update
    window.dispatchEvent(new CustomEvent('chat-updated'));
    return msg;
  },

  deleteMessage(msgId) {
    let messages = this.getMessages();
    messages = messages.filter(m => m.id !== msgId);
    this.set('messages', messages);
    window.dispatchEvent(new CustomEvent('chat-updated'));
    return true;
  },

  addReply(msgId, replyText, senderName) {
    const messages = this.getMessages();
    const msgIndex = messages.findIndex(m => m.id === msgId);
    if (msgIndex !== -1) {
      if (!messages[msgIndex].replies) {
        messages[msgIndex].replies = [];
      }
      messages[msgIndex].replies.push({
        id: 'rep_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        senderName: senderName,
        text: replyText,
        timestamp: Date.now()
      });
      this.set('messages', messages);
      window.dispatchEvent(new CustomEvent('chat-updated'));
      return true;
    }
    return false;
  },

  getPDFs() {
    return this.get('pdfs') || [];
  },

  addPDF(pdf) {
    const pdfs = this.getPDFs();
    pdfs.push(pdf);
    return this.set('pdfs', pdfs);
  },

  deletePDF(pdfId) {
    let pdfs = this.getPDFs();
    pdfs = pdfs.filter(p => p.id !== pdfId);
    return this.set('pdfs', pdfs);
  },

  getImages() {
    return this.get('images') || [];
  },

  addImage(img) {
    const images = this.getImages();
    images.push(img);
    return this.set('images', images);
  },

  deleteImage(imgId) {
    let images = this.getImages();
    images = images.filter(i => i.id !== imgId);
    return this.set('images', images);
  },

  // Toast System
  showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} glass-panel`;
    
    let icon = '';
    if (type === 'success') {
      icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-success)"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-error)"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-secondary)"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      ${icon}
      <div class="toast-message">${message}</div>
      <div class="toast-close">&times;</div>
    `;

    container.appendChild(toast);

    // Event listener to close toast manually
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.style.animation = 'fadeOut 0.3s forwards';
      setTimeout(() => toast.remove(), 300);
    });

    // Auto dismiss
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  },

  // Seed default data for visual richness on load
  seedData() {
    const students = this.getStudents();
    const messages = this.getMessages();
    const pdfs = this.getPDFs();
    const images = this.getImages();

    if (students.length === 0) {
      const defaultStudents = [
        { enrollment: 'ENR202601', name: 'Jane Doe', department: 'Computer', email: 'jane.doe@college.edu', password: 'password123' },
        { enrollment: 'ENR202602', name: 'John Smith', department: 'Mechanical', email: 'john.smith@college.edu', password: 'password123' }
      ];
      this.set('students', defaultStudents);
    }

    if (messages.length === 0) {
      const defaultMessages = [
        {
          id: 'msg_1',
          senderName: 'Jane Doe',
          senderRole: 'student',
          senderId: 'ENR202601',
          senderDept: 'Computer',
          text: 'Hello everyone! Does anyone know when the computer science midterms start?',
          timestamp: Date.now() - 3600000 * 2, // 2 hours ago
          replies: [
            {
              id: 'rep_1',
              senderName: 'Admin 1',
              text: 'Hi Jane, the midterm timetable will be uploaded to the learning hub by tomorrow evening.',
              timestamp: Date.now() - 3600000 * 1.8
            }
          ]
        },
        {
          id: 'msg_2',
          senderName: 'John Smith',
          senderRole: 'student',
          senderId: 'ENR202602',
          senderDept: 'Mechanical',
          text: 'Great, thanks! Will mechanical students get their schedule too?',
          timestamp: Date.now() - 3600000 * 1.5,
          replies: [
            {
              id: 'rep_2',
              senderName: 'Admin 1',
              text: 'Yes John, mechanical, civil and electrical tables will also be published simultaneously.',
              timestamp: Date.now() - 3600000 * 1.2
            }
          ]
        }
      ];
      this.set('messages', defaultMessages);
    }

    // Generate dummy PDFs and Images using Base64
    if (pdfs.length === 0) {
      // 1-pixel transparent or tiny text content saved as base64 for download fallback
      // A raw textual data uri simulating a PDF payload
      const dummyPdfData = 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCgogID4+CmVuZG9iagoyIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2VzCiAgICAgL0tpZHMgWyAzIDAgUiBdCiAgICAgL0NvdW50IDEKICA+PgplbmRvYmoKMyAwIG9iagogIDw8IC9UeXBlIC9QYWdlCiAgICAgL1BhcmVudCAyIDAgUgogICAgIC9SZXNvdXJjZXMgPDwgL0ZvbnQgPDwgL0YxIDQgMCBSID4+ID4+CiAgICAgL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KICAgICAgL0NvbnRlbnRzIDUgMCBSCgogID4+CmVuZG9iago0IDAgb2JqCiAgPDwgL1R5cGUgL0ZvbnQKICAgICAvU3VidHlwZSAvVHlwZTEKICAgICAvQmFzZUZvbnQgL0hlbHZldGljYQogID4+CmVuZG9iago1IDAgb2JqCiAgPDwgL0xlbmd0aCA3MyA+PgpzdHJlYW0KQlQKICAvRjEgMjQgVGYKICA3MCA3MDAgVGQKICAoQWV0aGVyaXVzIENvbGxlZ2UgRG9jdW1lbnQpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNzMgMDAwMDAgbiAKMDAwMDAwMDEzNCAwMDAwMCBuIAowMDAwMDAwMjQ5IDAwMDAwIG4gCjAwMDAwMDAzMTggMDAwMDAgbiAKdHJhaWxlcgogIDw8IC9TaXplIDYKICAgICAvUm9vdCAxIDAgUgogID4+CnN0YXJ0eHJlZgogIDQ0MgolJUVPRgo=';
      
      const defaultPdfs = [
        {
          id: 'pdf_1',
          title: 'Computer Science Syllabus 2026',
          description: 'Detailed syllabus outline for Computer Engineering students detailing semesters 1 through 8 core tracks.',
          department: 'Computer',
          fileName: 'cs_syllabus_2026.pdf',
          fileData: dummyPdfData,
          uploadedBy: 'ADMIN001',
          uploadedAt: Date.now() - 3600000 * 24
        },
        {
          id: 'pdf_2',
          title: 'Engineering Mathematics Handbook',
          description: 'Mathematical formulas, calculus review theorems, and coordinate geometry tables for all branches.',
          department: 'All',
          fileName: 'engineering_math_formula_sheet.pdf',
          fileData: dummyPdfData,
          uploadedBy: 'ADMIN002',
          uploadedAt: Date.now() - 3600000 * 18
        }
      ];
      this.set('pdfs', defaultPdfs);
    }

    if (images.length === 0) {
      // Dynamic Canvas helper to generate beautiful placeholder graphic cards
      const createPlaceholderImg = (text, bgGrad1, bgGrad2) => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 450;
        const ctx = canvas.getContext('2d');
        
        // Gradient background
        const grad = ctx.createLinearGradient(0, 0, 800, 450);
        grad.addColorStop(0, bgGrad1);
        grad.addColorStop(1, bgGrad2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 800, 450);

        // Pattern overlays (Grid)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 800; i += 40) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 450);
          ctx.stroke();
        }
        for (let j = 0; j < 450; j += 40) {
          ctx.beginPath();
          ctx.moveTo(0, j);
          ctx.lineTo(800, j);
          ctx.stroke();
        }

        // Title text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Outfit, Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.fillText(text, 400, 210);

        // Subtitle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '20px Inter, sans-serif';
        ctx.shadowBlur = 0;
        ctx.fillText('Aetherius Engineering Institute Campus', 400, 260);

        return canvas.toDataURL('image/png');
      };

      const defaultImages = [
        {
          id: 'img_1',
          title: 'Advanced Robotics Lab',
          description: 'Students working in the electrical and computer engineering laboratory building model quadcopters.',
          department: 'Computer',
          fileName: 'robotics_lab.png',
          fileData: createPlaceholderImg('Robotics Lab Center', '#3b0764', '#1d4ed8'),
          uploadedBy: 'ADMIN001',
          uploadedAt: Date.now() - 3600000 * 20
        },
        {
          id: 'img_2',
          title: 'Hydraulics Modeling Lab',
          description: 'Miniature river flow dam simulations conducted by structural civil engineering research group.',
          department: 'Civil',
          fileName: 'hydraulics_dam.png',
          fileData: createPlaceholderImg('Civil Hydraulics Lab', '#0f766e', '#111827'),
          uploadedBy: 'ADMIN002',
          uploadedAt: Date.now() - 3600000 * 12
        }
      ];
      this.set('images', defaultImages);
    }
  }
};

// Initialize DB immediately
DB.init();
