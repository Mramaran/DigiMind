// DigiMind - Digital Psychological Intervention Web App
// Global Variables
let currentUser = null;
let isLoginMode = true;
let breathingInterval = null;
let sosBreathingInterval = null;
let uiConfig = null;

// Load UI Configuration
async function loadUIConfig() {
    try {
        const response = await fetch('data/ui-config.json');
        uiConfig = await response.json();
    } catch (error) {
        console.error('Error loading UI config:', error);
    }
}

// Counsellor Management Functions
function openAddCounsellorModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Add New Counsellor</h3>
            <form id="addCounsellorForm">
                <div class="form-group">
                    <input type="text" id="counsellorName" placeholder="Full Name" required>
                </div>
                <div class="form-group">
                    <input type="email" id="counsellorEmail" placeholder="Email" required>
                </div>
                <div class="form-group">
                    <input type="tel" id="counsellorPhone" placeholder="Phone Number" required>
                </div>
                <div class="form-group">
                    <input type="text" id="counsellorSpecialization" placeholder="Specialization" required>
                </div>
                <div class="form-group">
                    <input type="text" id="counsellorLanguages" placeholder="Languages (comma separated)" required>
                </div>
                <div class="form-group">
                    <input type="text" id="counsellorExperience" placeholder="Years of Experience" required>
                </div>
                <button type="submit" class="btn btn-primary">Add Counsellor</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('addCounsellorForm').addEventListener('submit', handleAddCounsellor);
}

function handleAddCounsellor(e) {
    e.preventDefault();
    const newCounsellor = {
        id: 'c' + Date.now(),
        name: document.getElementById('counsellorName').value,
        email: document.getElementById('counsellorEmail').value,
        phone: document.getElementById('counsellorPhone').value,
        specialization: document.getElementById('counsellorSpecialization').value,
        languages: document.getElementById('counsellorLanguages').value.split(',').map(lang => lang.trim()),
        experience: document.getElementById('counsellorExperience').value,
        location: 'Coimbatore',
        available: true
    };

    // In a real application, this would be an API call
    let counsellors = JSON.parse(localStorage.getItem('counsellors') || '{"counsellors": []}');
    counsellors.counsellors.push(newCounsellor);
    localStorage.setItem('counsellors', JSON.stringify(counsellors));

    closeModal();
    loadCounsellorManagement();
}

function editCounsellor(counsellorId) {
    const counsellors = JSON.parse(localStorage.getItem('counsellors') || '{"counsellors": []}');
    const counsellor = counsellors.counsellors.find(c => c.id === counsellorId);
    
    if (!counsellor) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Edit Counsellor</h3>
            <form id="editCounsellorForm">
                <input type="hidden" id="counsellorId" value="${counsellor.id}">
                <div class="form-group">
                    <input type="text" id="counsellorName" value="${counsellor.name}" required>
                </div>
                <div class="form-group">
                    <input type="email" id="counsellorEmail" value="${counsellor.email}" required>
                </div>
                <div class="form-group">
                    <input type="tel" id="counsellorPhone" value="${counsellor.phone}" required>
                </div>
                <div class="form-group">
                    <input type="text" id="counsellorSpecialization" value="${counsellor.specialization}" required>
                </div>
                <div class="form-group">
                    <input type="text" id="counsellorLanguages" value="${counsellor.languages.join(', ')}" required>
                </div>
                <div class="form-group">
                    <input type="text" id="counsellorExperience" value="${counsellor.experience}" required>
                </div>
                <button type="submit" class="btn btn-primary">Update Counsellor</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('editCounsellorForm').addEventListener('submit', handleEditCounsellor);
}

function handleEditCounsellor(e) {
    e.preventDefault();
    const counsellorId = document.getElementById('counsellorId').value;
    const updatedCounsellor = {
        id: counsellorId,
        name: document.getElementById('counsellorName').value,
        email: document.getElementById('counsellorEmail').value,
        phone: document.getElementById('counsellorPhone').value,
        specialization: document.getElementById('counsellorSpecialization').value,
        languages: document.getElementById('counsellorLanguages').value.split(',').map(lang => lang.trim()),
        experience: document.getElementById('counsellorExperience').value,
        location: 'Coimbatore',
        available: true
    };

    let counsellors = JSON.parse(localStorage.getItem('counsellors') || '{"counsellors": []}');
    const index = counsellors.counsellors.findIndex(c => c.id === counsellorId);
    if (index !== -1) {
        counsellors.counsellors[index] = updatedCounsellor;
        localStorage.setItem('counsellors', JSON.stringify(counsellors));
    }

    closeModal();
    loadCounsellorManagement();
}

function deleteCounsellor(counsellorId) {
    if (confirm('Are you sure you want to delete this counsellor?')) {
        let counsellors = JSON.parse(localStorage.getItem('counsellors') || '{"counsellors": []}');
        counsellors.counsellors = counsellors.counsellors.filter(c => c.id !== counsellorId);
        localStorage.setItem('counsellors', JSON.stringify(counsellors));
        loadCounsellorManagement();
    }
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
async function initializeApp() {
    await loadUIConfig();
    checkAuthStatus();
    loadMockData();
    setupEventListeners();
    updateDateTime();
}

// Admin Functions
function loadAdminDashboard() {
    const adminContent = document.getElementById('adminContent');
    showAdminTab('counsellors'); // Default tab
}

function showAdminTab(tab) {
    const adminContent = document.getElementById('adminContent');
    const tabButtons = document.querySelectorAll('.admin-nav-btn');
    
    // Update active tab button
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if(btn.getAttribute('onclick').includes(tab)) {
            btn.classList.add('active');
        }
    });

    switch(tab) {
        case 'counsellors':
            loadCounsellorManagement();
            break;
        case 'students':
            loadStudentManagement();
            break;
        case 'bookings':
            loadAllBookings();
            break;
        case 'reports':
            loadSystemReports();
            break;
    }
}

function loadCounsellorManagement() {
    fetch('data/counsellors.json')
        .then(response => response.json())
        .then(data => {
            const adminContent = document.getElementById('adminContent');
            adminContent.innerHTML = `
                <div class="management-section">
                    <div class="section-header">
                        <h3>Manage Counsellors</h3>
                        <button class="btn btn-primary" onclick="openAddCounsellorModal()">Add New Counsellor</button>
                    </div>
                    <div class="counsellors-list">
                        ${data.counsellors.map(counsellor => `
                            <div class="counsellor-card">
                                <div class="counsellor-info">
                                    <h4>${counsellor.name}</h4>
                                    <p>📍 ${counsellor.location}</p>
                                    <p>🔬 ${counsellor.specialization}</p>
                                    <p>🗣️ ${counsellor.languages.join(', ')}</p>
                                    <p>📞 ${counsellor.phone}</p>
                                </div>
                                <div class="counsellor-actions">
                                    <button class="btn btn-secondary" onclick="editCounsellor('${counsellor.id}')">Edit</button>
                                    <button class="btn btn-danger" onclick="deleteCounsellor('${counsellor.id}')">Delete</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
}

// Check if user is logged in
function checkAuthStatus() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        console.info(`VERIFY: User logged in - ${currentUser.email} (${currentUser.role})`);
        showDashboard();
    } else {
        console.info('VERIFY: No user logged in, showing auth section');
        showSection('auth');
    }
}

// Show specific section
function showSection(sectionName) {
    console.info(`VERIFY: Showing section - ${sectionName}`);
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update navigation visibility based on user role
    const nav = document.getElementById('mainNav');
    if (sectionName === 'auth') {
        nav.style.display = 'none';
    } else {
        nav.style.display = 'flex';
        
        // Configure navigation based on user role
        const adminBtn = document.getElementById('adminNavBtn');
        const bookingsBtn = document.querySelector('.nav-btn[onclick="showSection(\'bookings\')"]');
        const reportsBtn = document.querySelector('.nav-btn[onclick="showSection(\'reports\')"]');
        const assessmentBtn = document.querySelector('.nav-btn[onclick="showSection(\'assessment\')"]');

        if (currentUser) {
            switch(currentUser.role) {
                case 'admin':
                    adminBtn.style.display = 'inline-block';
                    bookingsBtn.style.display = 'inline-block';
                    reportsBtn.style.display = 'inline-block';
                    assessmentBtn.style.display = 'inline-block';
                    break;
                case 'counsellor':
                    adminBtn.style.display = 'none';
                    bookingsBtn.style.display = 'inline-block';
                    reportsBtn.style.display = 'inline-block';
                    assessmentBtn.style.display = 'none';
                    break;
                case 'student':
                    adminBtn.style.display = 'none';
                    bookingsBtn.style.display = 'inline-block';
                    reportsBtn.style.display = 'inline-block';
                    assessmentBtn.style.display = 'inline-block';
                    break;
            }
        }
    }

    // Load section-specific data
    switch(sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'wellness':
            loadWellnessHub();
            break;
        case 'bookings':
            loadBookings();
            break;
        case 'reports':
            loadReports();
            break;
        case 'admin':
            if (currentUser && currentUser.role === 'admin') {
                loadAdminDashboard();
            } else {
                showSection('dashboard');
            }
            break;
    }
    console.info(`VERIFY: Section ${sectionName} loaded successfully`);
}

// Setup event listeners
function setupEventListeners() {
    // Auth form submission
    const authForm = document.getElementById('authForm');
    authForm.addEventListener('submit', handleAuth);

    // Assessment form submission
    const assessmentForm = document.getElementById('assessmentForm');
    assessmentForm.addEventListener('submit', handleAssessment);

// Role-specific dashboard loaders
function loadAdminDashboard() {
    const dashboardContent = document.querySelector('.dashboard-content');
    dashboardContent.innerHTML = `
        <div class="admin-controls">
            <div class="card">
                <h3>Admin Controls 👨‍💼</h3>
                <div class="admin-actions">
                    <button onclick="showAdminSection('counsellors')" class="btn btn-primary">Manage Counsellors</button>
                    <button onclick="showAdminSection('bookings')" class="btn btn-primary">View All Bookings</button>
                    <button onclick="showAdminSection('students')" class="btn btn-primary">Manage Students</button>
                    <button onclick="showAdminSection('reports')" class="btn btn-primary">System Reports</button>
                </div>
            </div>
            <div id="adminSectionContent"></div>
        </div>
    `;
}

function loadCounsellorDashboard() {
    const dashboardContent = document.querySelector('.dashboard-content');
    dashboardContent.innerHTML = `
        <div class="counsellor-dashboard">
            <div class="card">
                <h3>Today's Appointments 📅</h3>
                <div id="todayAppointments" class="appointments-list">
                    Loading appointments...
                </div>
            </div>
            <div class="card">
                <h3>Patient Overview 👥</h3>
                <div id="patientStats" class="patient-stats">
                    Loading patient statistics...
                </div>
            </div>
        </div>
    `;
    loadCounsellorAppointments();
}

function loadStudentDashboard() {
    const dashboardContent = document.querySelector('.dashboard-content');
    dashboardContent.innerHTML = `
        <div class="student-dashboard">
            <div class="card mood-card">
                <h3>How are you feeling today? 😊</h3>
                <div class="mood-selector" id="moodSelector">
                    <button class="mood-btn" onclick="selectMood('happy')" data-mood="happy">😃</button>
                    <button class="mood-btn" onclick="selectMood('neutral')" data-mood="neutral">😐</button>
                    <button class="mood-btn" onclick="selectMood('sad')" data-mood="sad">😢</button>
                    <button class="mood-btn" onclick="selectMood('angry')" data-mood="angry">😡</button>
                </div>
                <p id="moodStatus"></p>
            </div>
            <div class="card">
                <h3>Next Counselling Session 📅</h3>
                <div id="nextSession">
                    Loading your next session...
                </div>
            </div>
            <div class="card">
                <h3>Wellness Journey 🌱</h3>
                <div id="wellnessProgress">
                    Loading your progress...
                </div>
            </div>
        </div>
    `;
}

// Authentication handling
function handleAuth(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    // Mock authentication (replace with real authentication in production)
    if (isLoginMode) {
        // Login logic
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password && u.role === role);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            console.info(`LOGIN: Success - ${email} (${role})`);
            showDashboard();
        } else {
            alert('Invalid credentials. Please try again.');
        }
    } else {
        // Signup logic
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(u => u.email === email)) {
            alert('Email already exists. Please login instead.');
            return;
        }
        
        const newUser = {
            id: Date.now().toString(),
            email,
            password,
            role,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto login after signup
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        console.info(`SIGNUP: Success - ${email} (${role})`);
        showDashboard();
    }
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if (isLoginMode) {
        // Login logic
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            showDashboard();
            showNotification('Welcome back! 🎉', 'success');
        } else {
            showNotification('Invalid credentials! 😔', 'error');
        }
    } else {
        // Signup logic
        if (!role) {
            showNotification('Please select a role! 📝', 'warning');
            return;
        }
        
        // Prevent admin self-signup for security
        if (role === 'admin') {
            showNotification('Admin accounts must be created by system administrators! 🚫', 'error');
            return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address! 📧', 'error');
            return;
        }
        
        // Basic password validation
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters long! 🔒', 'error');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            showNotification('User already exists! Please login instead. 🙋‍♂️', 'warning');
        } else {
            const newUser = {
                id: Date.now(),
                email,
                password, // In a real app, this should be hashed
                role,
                name: email.split('@')[0], // Use email prefix as default name
                joinDate: new Date().toISOString(),
                streak: 0,
                points: 0,
                badges: [],
                lastMoodCheck: null
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            // Award welcome badge
            awardBadge('welcome', '🎉 Welcome', 'Joined DigiMind community!', '🎉');
            
            showDashboard();
            showNotification('Account created successfully! Welcome to DigiMind! 🎊', 'success');
            createConfetti();
        }
    }
}

// Toggle between login and signup
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const title = document.getElementById('authTitle');
    const button = document.getElementById('authBtn');
    const switchText = document.getElementById('authSwitchText');
    const roleGroup = document.getElementById('roleGroup');
    
    if (isLoginMode) {
        title.textContent = 'Welcome Back to DigiMind 🌟';
        button.innerHTML = 'Login 🔑';
        switchText.textContent = "Don't have an account?";
        roleGroup.style.display = 'none';
    } else {
        title.textContent = 'Join DigiMind Community 🌈';
        button.innerHTML = 'Sign Up 📝';
        switchText.textContent = 'Already have an account?';
        roleGroup.style.display = 'block';
    }
}

// Show dashboard based on user role
function showDashboard() {
    if (currentUser.role === 'admin') {
        showSection('admin');
    } else {
        showSection('dashboard');
    }
}

// Load dashboard data
function loadDashboard() {
    console.info(`VERIFY: Loading dashboard for ${currentUser.email} (${currentUser.role})`);
    const welcomeMessage = document.getElementById('welcomeMessage');
    const streakCounter = document.getElementById('streakCounter');
    const badgesContainer = document.getElementById('badgesContainer');
    
    welcomeMessage.textContent = `Welcome back, ${currentUser.email.split('@')[0]}! 🌈`;
    streakCounter.textContent = `Daily streak: ${currentUser.streak} days 🔥`;
    console.info(`VERIFY: Dashboard loaded - streak: ${currentUser.streak}, badges: ${currentUser.badges ? currentUser.badges.length : 0}`);
    
    // Load badges
    loadBadges();
    
    // Check if mood was checked today
    checkDailyMoodStatus();
}

// Check daily mood status
function checkDailyMoodStatus() {
    const today = new Date().toDateString();
    const lastCheck = currentUser.lastMoodCheck;
    
    if (lastCheck && new Date(lastCheck).toDateString() === today) {
        const moodStatus = document.getElementById('moodStatus');
        const todayMood = getMoodData().find(m => new Date(m.date).toDateString() === today);
        if (todayMood) {
            moodStatus.textContent = `Today's mood: ${getMoodEmoji(todayMood.mood)} (${todayMood.mood})`;
            moodStatus.style.color = '#28a745';
        }
    }
}

// Mood selection
function selectMood(mood) {
    console.info(`VERIFY: Mood selected - ${mood} by user ${currentUser.id}`);
    const today = new Date().toDateString();
    const moodData = getMoodData();
    
    // Remove existing mood for today
    const filteredMoodData = moodData.filter(m => new Date(m.date).toDateString() !== today);
    
    // Add new mood
    filteredMoodData.push({
        date: new Date().toISOString(),
        mood: mood,
        userId: currentUser.id
    });
    
    localStorage.setItem('moodData', JSON.stringify(filteredMoodData));
    console.info(`VERIFY: Mood data saved to localStorage - total entries: ${filteredMoodData.length}`);
    
    // Update user's last mood check
    currentUser.lastMoodCheck = new Date().toISOString();
    updateCurrentUser();
    
    // Update streak
    updateStreak();
    
    // Update UI
    const moodButtons = document.querySelectorAll('.mood-btn');
    moodButtons.forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-mood="${mood}"]`).classList.add('selected');
    
    const moodStatus = document.getElementById('moodStatus');
    moodStatus.textContent = `Great! Mood logged: ${getMoodEmoji(mood)} ${mood}`;
    moodStatus.style.color = '#28a745';
    
    // Award points
    awardPoints(10, 'Daily mood check! 😊');
    
    showNotification('Mood logged successfully! 🎉', 'success');
}

// Get mood emoji
function getMoodEmoji(mood) {
    const emojis = {
        happy: '😃',
        neutral: '😐',
        sad: '😢',
        angry: '😡'
    };
    return emojis[mood] || '😊';
}

// Update streak
function updateStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const moodData = getMoodData();
    
    const todayMood = moodData.find(m => new Date(m.date).toDateString() === today && m.userId === currentUser.id);
    const yesterdayMood = moodData.find(m => new Date(m.date).toDateString() === yesterday && m.userId === currentUser.id);
    
    if (todayMood) {
        if (yesterdayMood || currentUser.streak === 0) {
            currentUser.streak += 1;
        } else {
            currentUser.streak = 1;
        }
        
        updateCurrentUser();
        
        // Award streak badges
        if (currentUser.streak === 7) {
            awardBadge('week-warrior', '🔥 Week Warrior', 'Completed 7 days in a row!');
        } else if (currentUser.streak === 30) {
            awardBadge('month-master', '🏆 Month Master', 'Completed 30 days in a row!');
        }
    }
}

// Load badges
function loadBadges() {
    const badgesContainer = document.getElementById('badgesContainer');
    badgesContainer.innerHTML = '';
    
    if (currentUser.badges && currentUser.badges.length > 0) {
        currentUser.badges.forEach(badge => {
            const badgeElement = document.createElement('div');
            badgeElement.className = 'badge';
            badgeElement.innerHTML = `${badge.icon} ${badge.name}`;
            badgeElement.title = badge.description;
            badgesContainer.appendChild(badgeElement);
        });
    } else {
        badgesContainer.innerHTML = '<p>No badges yet. Complete activities to earn them! 🏆</p>';
    }
}

// Award badge
function awardBadge(id, name, description, icon = '🏆') {
    if (!currentUser.badges) currentUser.badges = [];
    
    const existingBadge = currentUser.badges.find(b => b.id === id);
    if (!existingBadge) {
        const badge = { id, name, description, icon };
        currentUser.badges.push(badge);
        updateCurrentUser();
        
        showNotification(`Badge earned: ${icon} ${name}! 🎉`, 'success');
        createConfetti();
    }
}

// Award points
function awardPoints(points, reason) {
    currentUser.points += points;
    updateCurrentUser();
    
    // Save activity log
    const activities = getActivityData();
    activities.push({
        date: new Date().toISOString(),
        userId: currentUser.id,
        type: 'points',
        points: points,
        reason: reason
    });
    localStorage.setItem('activityData', JSON.stringify(activities));
}

// Handle assessment submission
function handleAssessment(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    let totalScore = 0;
    let answeredQuestions = 0;
    
    for (let i = 1; i <= 5; i++) {
        const answer = formData.get(`q${i}`);
        if (answer) {
            totalScore += parseInt(answer);
            answeredQuestions++;
        }
    }
    
    if (answeredQuestions < 5) {
        showNotification('Please answer all questions! 📝', 'warning');
        return;
    }
    
    const averageScore = totalScore / 5;
    let riskLevel, message, className;
    
    if (averageScore <= 2) {
        riskLevel = 'Low';
        message = 'Your stress levels appear to be manageable. Keep up the good work! 😊';
        className = 'low';
    } else if (averageScore <= 3.5) {
        riskLevel = 'Moderate';
        message = 'You\'re experiencing moderate stress. Consider trying our wellness activities. 🌱';
        className = 'moderate';
    } else {
        riskLevel = 'High';
        message = 'You might be experiencing high stress levels. Please consider reaching out to a counsellor. 💙';
        className = 'high';
    }
    
    // Save assessment result
    const assessments = getAssessmentData();
    const assessment = {
        date: new Date().toISOString(),
        userId: currentUser.id,
        score: averageScore,
        riskLevel: riskLevel,
        answers: Object.fromEntries(formData)
    };
    assessments.push(assessment);
    localStorage.setItem('assessmentData', JSON.stringify(assessments));
    
    // Show result
    const resultDiv = document.getElementById('assessmentResult');
    resultDiv.className = `assessment-result ${className}`;
    resultDiv.innerHTML = `
        <h3>Assessment Result</h3>
        <p><strong>Risk Level: ${riskLevel}</strong></p>
        <p>${message}</p>
        <p>Score: ${averageScore.toFixed(1)}/5</p>
    `;
    resultDiv.style.display = 'block';
    
    // Award points and badge
    awardPoints(20, 'Completed stress assessment! 📋');
    awardBadge('self-aware', '🧠 Self-Aware', 'Completed first assessment', '🧠');
    
    // Scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth' });
    
    showNotification('Assessment completed! 📊', 'success');
}

// Load wellness hub
function loadWellnessHub() {
    loadMusicSuggestions();
    loadJournalEntry();
}

// Start breathing exercise
function startBreathing() {
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    const btn = document.getElementById('breathingBtn');
    
    if (breathingInterval) {
        stopBreathing();
        return;
    }
    
    circle.classList.add('breathing');
    btn.textContent = 'Stop 🛑';
    
    let phase = 0; // 0: inhale, 1: hold, 2: exhale, 3: hold
    const phases = ['Breathe In', 'Hold', 'Breathe Out', 'Hold'];
    const durations = [4000, 1000, 4000, 1000]; // milliseconds
    
    function nextPhase() {
        text.textContent = phases[phase];
        setTimeout(() => {
            phase = (phase + 1) % 4;
            if (breathingInterval) {
                nextPhase();
            }
        }, durations[phase]);
    }
    
    nextPhase();
    
    // Stop after 2 minutes
    breathingInterval = setTimeout(() => {
        stopBreathing();
        awardPoints(15, 'Completed breathing exercise! 🫁');
        awardBadge('zen-master', '🧘 Zen Master', 'Practiced breathing exercises', '🧘');
        showNotification('Great job! Feel more relaxed? 😌', 'success');
        createConfetti();
    }, 120000);
}

// Stop breathing exercise
function stopBreathing() {
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    const btn = document.getElementById('breathingBtn');
    
    if (breathingInterval) {
        clearTimeout(breathingInterval);
        breathingInterval = null;
    }
    
    circle.classList.remove('breathing');
    text.textContent = 'Click to Start';
    btn.innerHTML = 'Start 🌬️';
}

// Save journal entry
function saveJournal() {
    console.info('VERIFY: Saving journal entry');
    const journalEntry = document.getElementById('journalEntry').value.trim();
    
    if (!journalEntry) {
        showNotification('Please write something first! ✍️', 'warning');
        return;
    }
    
    const journals = getJournalData();
    const newEntry = {
        date: new Date().toISOString(),
        userId: currentUser.id,
        entry: journalEntry
    };
    journals.push(newEntry);
    localStorage.setItem('journalData', JSON.stringify(journals));
    console.info(`VERIFY: Journal entry saved - total entries: ${journals.length}, user entries: ${journals.filter(j => j.userId === currentUser.id).length}`);
    
    // Clear the textarea
    document.getElementById('journalEntry').value = '';
    
    // Show success message
    const savedMsg = document.getElementById('journalSaved');
    savedMsg.style.display = 'block';
    setTimeout(() => {
        savedMsg.style.display = 'none';
    }, 3000);
    
    // Award points and badge
    awardPoints(15, 'Wrote a journal entry! 📝');
    
    const journalCount = journals.filter(j => j.userId === currentUser.id).length;
    if (journalCount === 1) {
        awardBadge('journal-starter', '📖 Journal Starter', 'Wrote first journal entry', '📖');
    } else if (journalCount === 10) {
        awardBadge('reflection-master', '✨ Reflection Master', 'Wrote 10 journal entries', '✨');
    }
    
    showNotification('Journal entry saved! 📝', 'success');
}

// Load journal entry (for editing)
function loadJournalEntry() {
    const today = new Date().toDateString();
    const journals = getJournalData();
    const todayJournal = journals.find(j => 
        j.userId === currentUser.id && 
        new Date(j.date).toDateString() === today
    );
    
    if (todayJournal) {
        document.getElementById('journalEntry').value = todayJournal.entry;
    }
}

// Load music suggestions
function loadMusicSuggestions() {
    const container = document.getElementById('musicSuggestions');
    
    // Load music data from wellness.json or use fallback
    fetch('./data/wellness.json')
        .then(response => response.json())
        .then(data => {
            const musicData = data.music_suggestions || [];
            displayMusicSuggestions(container, musicData);
        })
        .catch(() => {
            // Fallback music data
            const fallbackMusic = [
                { title: "Peaceful Piano", artist: "Calming Sounds", genre: "Instrumental", duration: "45:00", mood: "relaxing" },
                { title: "Ocean Waves", artist: "Nature Sounds", genre: "Ambient", duration: "60:00", mood: "calming" },
                { title: "Forest Rain", artist: "Relaxation Music", genre: "Nature", duration: "30:00", mood: "peaceful" },
                { title: "Meditation Bell", artist: "Zen Masters", genre: "Meditation", duration: "20:00", mood: "focused" }
            ];
            displayMusicSuggestions(container, fallbackMusic);
        });
}

// Helper function to display music suggestions
function displayMusicSuggestions(container, musicData) {
    container.innerHTML = '';
    musicData.forEach(music => {
        const musicItem = document.createElement('div');
        musicItem.className = 'music-item';
        musicItem.innerHTML = `
            <strong>🎵 ${music.title}</strong><br>
            <small>by ${music.artist} • ${music.genre}</small>
            ${music.duration ? `<br><small>⏱️ ${music.duration}</small>` : ''}
            ${music.mood ? `<br><small>😌 ${music.mood}</small>` : ''}
        `;
        musicItem.onclick = () => {
            awardPoints(5, `Listened to ${music.title}! 🎵`);
            showNotification(`Now playing: ${music.title} 🎶`, 'info');
        };
        container.appendChild(musicItem);
    });
}

// Load bookings
function loadBookings() {
    loadCounsellors();
    loadMyBookings();
}

// Load counsellors
function loadCounsellors() {
    const container = document.getElementById('counsellorsGrid');
    
    // Load counsellor data from JSON file or use fallback
    fetch('./data/counsellors.json')
        .then(response => response.json())
        .then(counsellors => {
            displayCounsellors(container, counsellors);
        })
        .catch(() => {
            // Fallback counsellor data
            const fallbackCounsellors = [
                { id: 1, name: "Dr. Sarah Johnson", specialty: "Anxiety & Depression", avatar: "👩‍⚕️", experience: "8 years", rating: 4.9 },
                { id: 2, name: "Dr. Michael Chen", specialty: "Stress Management", avatar: "👨‍⚕️", experience: "12 years", rating: 4.8 },
                { id: 3, name: "Dr. Emily Davis", specialty: "Student Counseling", avatar: "👩‍🏫", experience: "6 years", rating: 4.9 },
                { id: 4, name: "Dr. James Wilson", specialty: "Crisis Intervention", avatar: "👨‍💼", experience: "15 years", rating: 5.0 }
            ];
            displayCounsellors(container, fallbackCounsellors);
        });
}

// Helper function to display counsellors
function displayCounsellors(container, counsellors) {
    container.innerHTML = '';
    counsellors.forEach(counsellor => {
        const card = document.createElement('div');
        card.className = 'counsellor-card';
        card.innerHTML = `
            <div class="counsellor-avatar">${counsellor.avatar}</div>
            <h3>${counsellor.name}</h3>
            <p><strong>Specialty:</strong> ${counsellor.specialty}</p>
            <p><strong>Experience:</strong> ${counsellor.experience}</p>
            ${counsellor.rating ? `<p><strong>Rating:</strong> ⭐ ${counsellor.rating}/5.0</p>` : ''}
            <button class="book-btn" onclick="bookSession(${counsellor.id}, '${counsellor.name}')">
                Book Session 📅
            </button>
        `;
        container.appendChild(card);
    });
}

// Book session
function bookSession(counsellorId, counsellorName) {
    const bookings = getBookingData();
    const booking = {
        id: Date.now(),
        userId: currentUser.id,
        counsellorId: counsellorId,
        counsellorName: counsellorName,
        date: new Date().toISOString(),
        status: 'scheduled'
    };
    
    bookings.push(booking);
    localStorage.setItem('bookingData', JSON.stringify(bookings));
    
    showNotification(`Session booked with ${counsellorName}! 📅`, 'success');
    loadMyBookings();
    
    // Award points
    awardPoints(25, `Booked session with ${counsellorName}! 📅`);
    awardBadge('help-seeker', '🤝 Help Seeker', 'Booked first counselling session', '🤝');
}

// Load my bookings
function loadMyBookings() {
    const container = document.getElementById('myBookings');
    const bookings = getBookingData().filter(b => b.userId === currentUser.id && b.status === 'scheduled');
    
    if (bookings.length === 0) {
        container.innerHTML = '<p>No upcoming bookings. 📅</p>';
        return;
    }
    
    container.innerHTML = '';
    bookings.forEach(booking => {
        const bookingItem = document.createElement('div');
        bookingItem.className = 'booking-item';
        bookingItem.innerHTML = `
            <div>
                <strong>${booking.counsellorName}</strong><br>
                <small>Scheduled: ${new Date(booking.date).toLocaleDateString()}</small>
            </div>
            <button class="cancel-btn" onclick="cancelBooking(${booking.id})">Cancel</button>
        `;
        container.appendChild(bookingItem);
    });
}

// Cancel booking
function cancelBooking(bookingId) {
    const bookings = getBookingData();
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        booking.status = 'cancelled';
        localStorage.setItem('bookingData', JSON.stringify(bookings));
        showNotification('Booking cancelled! 📅', 'info');
        loadMyBookings();
    }
}

// Load reports
function loadReports() {
    loadMoodReport();
    loadAssessmentReport();
    loadActivityReport();
    loadRewardsReport();
}

// Load mood report
function loadMoodReport() {
    const container = document.getElementById('moodReport');
    const moodData = getMoodData().filter(m => m.userId === currentUser.id).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (moodData.length === 0) {
        container.innerHTML = '<p>No mood data yet. Start tracking! 😊</p>';
        return;
    }
    
    // Calculate mood statistics
    const moodCounts = moodData.reduce((acc, mood) => {
        acc[mood.mood] = (acc[mood.mood] || 0) + 1;
        return acc;
    }, {});
    
    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b);
    const last7Days = moodData.slice(0, 7);
    
    container.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <p><strong>Total Mood Entries:</strong> ${moodData.length}</p>
            <p><strong>Most Common Mood:</strong> ${getMoodEmoji(mostCommonMood)} ${mostCommonMood}</p>
        </div>
        <p><strong>Recent 7 entries:</strong></p>
        <div style="max-height: 200px; overflow-y: auto;">
            ${last7Days.map(m => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px; margin: 3px 0; background: #f8f9ff; border-radius: 6px;">
                    <span style="font-size: 0.9rem;">${new Date(m.date).toLocaleDateString()}</span>
                    <span style="font-size: 1.1rem;">${getMoodEmoji(m.mood)} ${m.mood}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// Load assessment report
function loadAssessmentReport() {
    const container = document.getElementById('assessmentReport');
    const assessments = getAssessmentData().filter(a => a.userId === currentUser.id).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (assessments.length === 0) {
        container.innerHTML = '<p>No assessments completed yet. 📋</p>';
        return;
    }
    
    const lastAssessment = assessments[0];
    const avgScore = assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length;
    
    // Calculate trend
    let trendText = '';
    let trendIcon = '';
    if (assessments.length > 1) {
        const secondLast = assessments[1];
        if (lastAssessment.score < secondLast.score) {
            trendText = 'Improving! 📈';
            trendIcon = '⬆️';
        } else if (lastAssessment.score > secondLast.score) {
            trendText = 'Needs attention 📉';
            trendIcon = '⬇️';
        } else {
            trendText = 'Stable ➡️';
            trendIcon = '➡️';
        }
    }
    
    container.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <p><strong>Total Assessments:</strong> ${assessments.length}</p>
            <p><strong>Average Score:</strong> ${avgScore.toFixed(1)}/5</p>
            ${trendText ? `<p><strong>Trend:</strong> ${trendIcon} ${trendText}</p>` : ''}
        </div>
        <p><strong>Latest Assessment:</strong></p>
        <div style="background: #f8f9ff; padding: 10px; border-radius: 6px;">
            <p>Date: ${new Date(lastAssessment.date).toLocaleDateString()}</p>
            <p>Risk Level: <strong style="color: ${lastAssessment.riskLevel === 'Low' ? '#28a745' : lastAssessment.riskLevel === 'High' ? '#dc3545' : '#ffc107'}">${lastAssessment.riskLevel}</strong></p>
            <p>Score: ${lastAssessment.score.toFixed(1)}/5</p>
        </div>
    `;
}

// Load activity report
function loadActivityReport() {
    const container = document.getElementById('activityReport');
    const activities = getActivityData().filter(a => a.userId === currentUser.id).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (activities.length === 0) {
        container.innerHTML = '<p>No activities yet. Start exploring! 🌱</p>';
        return;
    }
    
    const totalPoints = activities.reduce((sum, a) => sum + (a.points || 0), 0);
    const recentActivities = activities.slice(0, 8); // Show 8 most recent
    
    // Calculate activity breakdown
    const activityBreakdown = activities.reduce((acc, a) => {
        const type = a.reason.toLowerCase().includes('mood') ? 'Mood Tracking' :
                    a.reason.toLowerCase().includes('assessment') ? 'Assessments' :
                    a.reason.toLowerCase().includes('journal') ? 'Journaling' :
                    a.reason.toLowerCase().includes('breathing') ? 'Wellness' :
                    a.reason.toLowerCase().includes('session') ? 'Bookings' :
                    'Other';
        acc[type] = (acc[type] || 0) + (a.points || 0);
        return acc;
    }, {});
    
    container.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <p><strong>Total Points Earned:</strong> ${totalPoints} 🎖️</p>
            <p><strong>Total Activities:</strong> ${activities.length}</p>
        </div>
        
        <div style="margin-bottom: 1rem;">
            <p><strong>Points by Category:</strong></p>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                ${Object.entries(activityBreakdown).map(([type, points]) => `
                    <span style="background: var(--secondary-color); padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem;">
                        ${type}: ${points}pts
                    </span>
                `).join('')}
            </div>
        </div>
        
        <p><strong>Recent Activities:</strong></p>
        <div style="max-height: 200px; overflow-y: auto;">
            ${recentActivities.map(a => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; margin: 3px 0; background: #f8f9ff; border-radius: 6px;">
                    <div style="flex: 1;">
                        <div style="font-size: 0.9rem; font-weight: 500;">${a.reason}</div>
                        <small style="color: #666;">${new Date(a.date).toLocaleDateString()} at ${new Date(a.date).toLocaleTimeString()}</small>
                    </div>
                    <span style="background: var(--primary-color); color: white; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
                        +${a.points} pts
                    </span>
                </div>
            `).join('')}
        </div>
    `;
}

// Load rewards report
function loadRewardsReport() {
    const container = document.getElementById('rewardsReport');
    
    container.innerHTML = `
        <p><strong>Total Points:</strong> ${currentUser.points} 🎖️</p>
        <p><strong>Badges Earned:</strong> ${currentUser.badges ? currentUser.badges.length : 0} 🏆</p>
        <p><strong>Current Streak:</strong> ${currentUser.streak} days 🔥</p>
    `;
}

// Export data
function exportData() {
    const userData = {
        user: currentUser,
        moods: getMoodData().filter(m => m.userId === currentUser.id),
        assessments: getAssessmentData().filter(a => a.userId === currentUser.id),
        activities: getActivityData().filter(a => a.userId === currentUser.id),
        journals: getJournalData().filter(j => j.userId === currentUser.id),
        bookings: getBookingData().filter(b => b.userId === currentUser.id)
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `digimind-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully! 📄', 'success');
}

// Load admin dashboard
function loadAdminDashboard() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const bookings = getBookingData();
    const assessments = getAssessmentData();
    const moods = getMoodData();
    const activities = getActivityData();
    const journals = getJournalData();
    
    // Update statistics
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalBookings').textContent = bookings.length;
    document.getElementById('totalAssessments').textContent = assessments.length;
    document.getElementById('totalMoodEntries').textContent = moods.length;
    
    // Calculate additional stats
    const activeUsers = users.filter(u => {
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(u.lastMoodCheck || 0) > lastWeek;
    }).length;
    
    const highRiskAssessments = assessments.filter(a => a.riskLevel === 'High').length;
    const averagePoints = users.length > 0 ? Math.round(users.reduce((sum, u) => sum + (u.points || 0), 0) / users.length) : 0;
    
    // Create detailed admin view
    const adminContainer = document.querySelector('#admin .container');
    if (adminContainer) {
        // Add additional stats after existing stat cards
        const existingStats = adminContainer.querySelector('.admin-stats');
        if (existingStats && !adminContainer.querySelector('.admin-details')) {
            const detailsSection = document.createElement('div');
            detailsSection.className = 'admin-details';
            detailsSection.innerHTML = `
                <div class="card" style="margin-top: 2rem;">
                    <h3>Detailed Analytics 📊</h3>
                    <div class="details-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                        <div style="background: #f8f9ff; padding: 1rem; border-radius: 8px; text-align: center;">
                            <strong>${activeUsers}</strong><br>
                            <small>Active Users (last 7 days)</small>
                        </div>
                        <div style="background: #f8f9ff; padding: 1rem; border-radius: 8px; text-align: center;">
                            <strong>${highRiskAssessments}</strong><br>
                            <small>High Risk Assessments</small>
                        </div>
                        <div style="background: #f8f9ff; padding: 1rem; border-radius: 8px; text-align: center;">
                            <strong>${averagePoints}</strong><br>
                            <small>Average User Points</small>
                        </div>
                        <div style="background: #f8f9ff; padding: 1rem; border-radius: 8px; text-align: center;">
                            <strong>${journals.length}</strong><br>
                            <small>Journal Entries</small>
                        </div>
                    </div>
                    <div style="margin-top: 2rem;">
                        <h4>User Breakdown by Role:</h4>
                        <div style="margin-top: 0.5rem;">
                            ${['student', 'counsellor', 'admin'].map(role => {
                                const count = users.filter(u => u.role === role).length;
                                return `<span style="margin-right: 1rem; background: var(--primary-color); padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.9rem;">${role}: ${count}</span>`;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
            adminContainer.appendChild(detailsSection);
        }
    }
}

// SOS functions
function openSOS() {
    document.getElementById('sosModal').style.display = 'block';
}

function closeSOS() {
    document.getElementById('sosModal').style.display = 'none';
    stopSOSBreathing();
}

function startSOSBreathing() {
    const circle = document.getElementById('sosBreathingCircle');
    const text = document.getElementById('sosBreathingText');
    const btn = document.getElementById('sosBreathingBtn');
    
    if (sosBreathingInterval) {
        stopSOSBreathing();
        return;
    }
    
    circle.classList.add('breathing');
    btn.textContent = 'Stop Breathing';
    
    let phase = 0; // 0: inhale, 1: hold, 2: exhale, 3: hold
    const phases = ['Breathe In Slowly', 'Hold', 'Breathe Out Slowly', 'Hold'];
    const durations = [4000, 2000, 6000, 2000]; // 4-2-6-2 calming pattern
    
    function nextPhase() {
        if (!sosBreathingInterval) return;
        
        text.textContent = phases[phase];
        
        setTimeout(() => {
            if (sosBreathingInterval) {
                phase = (phase + 1) % 4;
                nextPhase();
            }
        }, durations[phase]);
    }
    
    nextPhase();
    
    // Auto-stop after 5 minutes for emergency sessions
    sosBreathingInterval = setTimeout(() => {
        if (sosBreathingInterval) {
            stopSOSBreathing();
            showNotification('Emergency breathing completed. You\'re safe. 💙', 'success');
        }
    }, 300000); // 5 minutes
}

function stopSOSBreathing() {
    const circle = document.getElementById('sosBreathingCircle');
    const text = document.getElementById('sosBreathingText');
    const btn = document.getElementById('sosBreathingBtn');
    
    if (sosBreathingInterval) {
        clearTimeout(sosBreathingInterval);
        sosBreathingInterval = null;
    }
    
    circle.classList.remove('breathing');
    text.textContent = 'Take a Deep Breath';
    btn.textContent = 'Start Breathing';
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showSection('auth');
    showNotification('Logged out successfully! 👋', 'info');
}

// Utility functions
function updateCurrentUser() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

function getMoodData() {
    return JSON.parse(localStorage.getItem('moodData') || '[]');
}

function getAssessmentData() {
    return JSON.parse(localStorage.getItem('assessmentData') || '[]');
}

function getActivityData() {
    return JSON.parse(localStorage.getItem('activityData') || '[]');
}

function getJournalData() {
    return JSON.parse(localStorage.getItem('journalData') || '[]');
}

function getBookingData() {
    return JSON.parse(localStorage.getItem('bookingData') || '[]');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1001;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function createConfetti() {
    const colors = ['#a8e6cf', '#ffd3a5', '#ffa8cc', '#88d8c0', '#ffc1cc'];
    const confettiContainer = document.getElementById('confetti');
    
    for (let i = 0; i < 50; i++) {
        const confettiPiece = document.createElement('div');
        confettiPiece.className = 'confetti-piece';
        confettiPiece.style.left = Math.random() * 100 + '%';
        confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confettiPiece.style.animationDelay = Math.random() * 3 + 's';
        confettiContainer.appendChild(confettiPiece);
        
        // Remove after animation
        setTimeout(() => {
            if (confettiPiece.parentNode) {
                confettiPiece.parentNode.removeChild(confettiPiece);
            }
        }, 3000);
    }
}

async function loadMockData() {
    console.info('VERIFY: Starting loadMockData()');
    
    // Initialize with JSON data or fallback data if fetch fails
    if (!localStorage.getItem('users')) {
        try {
            const response = await fetch('./data/users.json');
            const users = await response.json();
            localStorage.setItem('users', JSON.stringify(users));
            console.info(`VERIFY: Loaded ${users.length} users from users.json`);
        } catch (error) {
            console.warn('VERIFY: Failed to load users.json, using fallback data');
            // Fallback data if JSON file not accessible
            const sampleUsers = [
                {
                    id: 1,
                    email: 'admin@digimind.com',
                    password: 'admin123',
                    role: 'admin',
                    name: 'Admin User',
                    joinDate: new Date().toISOString(),
                    streak: 0,
                    points: 0,
                    badges: [],
                    lastMoodCheck: null
                },
                {
                    id: 2,
                    email: 'student@example.com',
                    password: 'student123',
                    role: 'student',
                    name: 'Student User',
                    joinDate: new Date().toISOString(),
                    streak: 0,
                    points: 0,
                    badges: [],
                    lastMoodCheck: null
                }
            ];
            localStorage.setItem('users', JSON.stringify(sampleUsers));
            console.info(`VERIFY: Loaded ${sampleUsers.length} fallback users`);
        }
    } else {
        const existingUsers = JSON.parse(localStorage.getItem('users'));
        console.info(`VERIFY: Found ${existingUsers.length} existing users in localStorage`);
    }
    
    // Load counsellors data
    if (!localStorage.getItem('counsellors')) {
        try {
            const response = await fetch('./data/counsellors.json');
            const counsellors = await response.json();
            localStorage.setItem('counsellors', JSON.stringify(counsellors));
            console.info(`VERIFY: Loaded ${counsellors.length} counsellors from counsellors.json`);
        } catch (error) {
            console.warn('VERIFY: Failed to load counsellors.json');
        }
    } else {
        const existingCounsellors = JSON.parse(localStorage.getItem('counsellors'));
        console.info(`VERIFY: Found ${existingCounsellors.length} existing counsellors in localStorage`);
    }
    
    // Load wellness data
    if (!localStorage.getItem('wellness')) {
        try {
            const response = await fetch('./data/wellness.json');
            const wellness = await response.json();
            localStorage.setItem('wellness', JSON.stringify(wellness));
            const musicCount = wellness.music_suggestions ? wellness.music_suggestions.length : 0;
            const journalCount = wellness.journal_prompts ? wellness.journal_prompts.length : 0;
            const breathingCount = wellness.breathing_exercises ? wellness.breathing_exercises.length : 0;
            console.info(`VERIFY: Loaded wellness data - ${musicCount} music tracks, ${journalCount} journal prompts, ${breathingCount} breathing exercises`);
        } catch (error) {
            console.warn('VERIFY: Failed to load wellness.json');
        }
    } else {
        const existingWellness = JSON.parse(localStorage.getItem('wellness'));
        const musicCount = existingWellness.music_suggestions ? existingWellness.music_suggestions.length : 0;
        console.info(`VERIFY: Found existing wellness data with ${musicCount} music tracks in localStorage`);
    }
    
    // Initialize other data stores if not exists
    const dataStores = ['moodData', 'assessmentData', 'bookingData', 'journalData', 'activityData'];
    let initializedCount = 0;
    dataStores.forEach(store => {
        if (!localStorage.getItem(store)) {
            localStorage.setItem(store, JSON.stringify([]));
            initializedCount++;
        }
    });
    console.info(`VERIFY: Initialized ${initializedCount} new data stores in localStorage`);
}

// Load reports section
function loadReports() {
    console.info('VERIFY: Loading reports section');
    loadMoodHistory();
    loadAssessmentSummary();
    loadActivitySummary();
    loadDataExport();
    console.info('VERIFY: Reports section loaded with mood history, assessments, and activity data');
}

// Load mood history
function loadMoodHistory() {
    console.info('VERIFY: Loading mood history');
    const container = document.getElementById('moodHistoryChart');
    const moodData = getMoodData().filter(m => m.userId === currentUser.id);
    
    if (moodData.length === 0) {
        container.innerHTML = '<p>No mood data yet. Start tracking your mood! 😊</p>';
        return;
    }
    
    // Create simple mood history display
    const last7Days = moodData.slice(-7);
    let historyHTML = '<div class="mood-history">';
    
    last7Days.forEach(mood => {
        const date = new Date(mood.date).toLocaleDateString();
        const emoji = getMoodEmoji(mood.mood);
        historyHTML += `<div class="mood-entry"><span>${date}</span> <span>${emoji} ${mood.mood}</span></div>`;
    });
    
    historyHTML += '</div>';
    container.innerHTML = historyHTML;
    console.info(`VERIFY: Mood history displayed - ${last7Days.length} recent entries`);
}

// Load assessment summary
function loadAssessmentSummary() {
    console.info('VERIFY: Loading assessment summary');
    const container = document.getElementById('assessmentSummary');
    const assessments = getAssessmentData().filter(a => a.userId === currentUser.id);
    
    if (assessments.length === 0) {
        container.innerHTML = '<p>No assessments completed yet. 📋</p>';
        return;
    }
    
    const latestAssessment = assessments[assessments.length - 1];
    const avgScore = assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length;
    
    container.innerHTML = `
        <div class="assessment-stats">
            <h4>Assessment Summary</h4>
            <p><strong>Total Assessments:</strong> ${assessments.length}</p>
            <p><strong>Latest Risk Level:</strong> ${latestAssessment.riskLevel}</p>
            <p><strong>Average Score:</strong> ${avgScore.toFixed(1)}/5</p>
            <p><strong>Latest Date:</strong> ${new Date(latestAssessment.date).toLocaleDateString()}</p>
        </div>
    `;
    console.info(`VERIFY: Assessment summary loaded - ${assessments.length} total assessments, average score: ${avgScore.toFixed(1)}`);
}

// Load activity summary
function loadActivitySummary() {
    console.info('VERIFY: Loading activity summary');
    const container = document.getElementById('activitySummary');
    const activities = getActivityData().filter(a => a.userId === currentUser.id);
    const journals = getJournalData().filter(j => j.userId === currentUser.id);
    const bookings = getBookingData().filter(b => b.userId === currentUser.id);
    
    container.innerHTML = `
        <div class="activity-stats">
            <h4>Activity Summary</h4>
            <p><strong>Total Points:</strong> ${currentUser.points || 0}</p>
            <p><strong>Current Streak:</strong> ${currentUser.streak || 0} days</p>
            <p><strong>Journal Entries:</strong> ${journals.length}</p>
            <p><strong>Counselling Sessions:</strong> ${bookings.length}</p>
            <p><strong>Badges Earned:</strong> ${currentUser.badges ? currentUser.badges.length : 0}</p>
        </div>
    `;
    console.info(`VERIFY: Activity summary loaded - ${currentUser.points || 0} points, ${journals.length} journal entries, ${bookings.length} bookings`);
}

// Load data export
function loadDataExport() {
    console.info('VERIFY: Loading data export functionality');
    const container = document.getElementById('dataExport');
    
    container.innerHTML = `
        <div class="data-export">
            <h4>Export Your Data</h4>
            <p>Download your data as JSON for backup or transfer.</p>
            <button class="btn btn-secondary" onclick="exportUserData()">Export Data 📁</button>
        </div>
    `;
    console.info('VERIFY: Data export functionality loaded');
}

// Export user data
function exportUserData() {
    console.info('VERIFY: Exporting user data');
    const userData = {
        user: currentUser,
        moods: getMoodData().filter(m => m.userId === currentUser.id),
        assessments: getAssessmentData().filter(a => a.userId === currentUser.id),
        journals: getJournalData().filter(j => j.userId === currentUser.id),
        bookings: getBookingData().filter(b => b.userId === currentUser.id),
        activities: getActivityData().filter(a => a.userId === currentUser.id)
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `digimind-data-${currentUser.email}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    console.info(`VERIFY: User data exported - ${Object.keys(userData).length} data categories`);
    showNotification('Data exported successfully! 📁', 'success');
}

// Load admin dashboard
function loadAdminDashboard() {
    console.info('VERIFY: Loading admin dashboard');
    if (currentUser.role !== 'admin') {
        console.warn('VERIFY: Non-admin user attempted to access admin dashboard');
        showSection('dashboard');
        return;
    }
    
    loadUserStats();
    loadSystemStats();
    loadUsageAnalytics();
    console.info('VERIFY: Admin dashboard loaded with user stats, system stats, and analytics');
}

// Load user statistics
function loadUserStats() {
    console.info('VERIFY: Loading user statistics for admin');
    const container = document.getElementById('userStats');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const studentCount = users.filter(u => u.role === 'student').length;
    const counsellorCount = users.filter(u => u.role === 'counsellor').length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    
    container.innerHTML = `
        <div class="admin-stats">
            <h3>User Statistics</h3>
            <div class="stat-grid">
                <div class="stat-item">
                    <h4>${users.length}</h4>
                    <p>Total Users</p>
                </div>
                <div class="stat-item">
                    <h4>${studentCount}</h4>
                    <p>Students</p>
                </div>
                <div class="stat-item">
                    <h4>${counsellorCount}</h4>
                    <p>Counsellors</p>
                </div>
                <div class="stat-item">
                    <h4>${adminCount}</h4>
                    <p>Admins</p>
                </div>
            </div>
        </div>
    `;
    console.info(`VERIFY: User stats loaded - ${users.length} total users (${studentCount} students, ${counsellorCount} counsellors, ${adminCount} admins)`);
}

// Load system statistics
function loadSystemStats() {
    console.info('VERIFY: Loading system statistics for admin');
    const container = document.getElementById('systemStats');
    const moods = getMoodData();
    const assessments = getAssessmentData();
    const journals = getJournalData();
    const bookings = getBookingData();
    
    // Calculate mood distribution
    const moodCounts = moods.reduce((acc, mood) => {
        acc[mood.mood] = (acc[mood.mood] || 0) + 1;
        return acc;
    }, {});
    
    container.innerHTML = `
        <div class="admin-stats">
            <h3>System Statistics</h3>
            <div class="stat-grid">
                <div class="stat-item">
                    <h4>${moods.length}</h4>
                    <p>Mood Entries</p>
                </div>
                <div class="stat-item">
                    <h4>${assessments.length}</h4>
                    <p>Assessments</p>
                </div>
                <div class="stat-item">
                    <h4>${journals.length}</h4>
                    <p>Journal Entries</p>
                </div>
                <div class="stat-item">
                    <h4>${bookings.length}</h4>
                    <p>Bookings</p>
                </div>
            </div>
            <div class="mood-distribution">
                <h4>Mood Distribution</h4>
                ${Object.entries(moodCounts).map(([mood, count]) => 
                    `<p>${getMoodEmoji(mood)} ${mood}: ${count} (${((count/moods.length)*100).toFixed(1)}%)</p>`
                ).join('')}
            </div>
        </div>
    `;
    console.info(`VERIFY: System stats loaded - ${moods.length} moods, ${assessments.length} assessments, ${journals.length} journals, ${bookings.length} bookings`);
}

// Load usage analytics
function loadUsageAnalytics() {
    console.info('VERIFY: Loading usage analytics for admin');
    const container = document.getElementById('usageAnalytics');
    const activities = getActivityData();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Calculate active users (users with recent activity)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = users.filter(user => 
        user.lastMoodCheck && new Date(user.lastMoodCheck) > weekAgo
    ).length;
    
    container.innerHTML = `
        <div class="admin-stats">
            <h3>Usage Analytics</h3>
            <div class="stat-grid">
                <div class="stat-item">
                    <h4>${activeUsers}</h4>
                    <p>Active Users (7 days)</p>
                </div>
                <div class="stat-item">
                    <h4>${activities.length}</h4>
                    <p>Total Activities</p>
                </div>
                <div class="stat-item">
                    <h4>${(activeUsers / users.length * 100).toFixed(1)}%</h4>
                    <p>Engagement Rate</p>
                </div>
            </div>
        </div>
    `;
    console.info(`VERIFY: Usage analytics loaded - ${activeUsers} active users, ${activities.length} total activities`);
}

// Load mindfulness activities
function loadMindfulnessActivities() {
    console.info('VERIFY: Loading mindfulness activities');
    const container = document.getElementById('mindfulnessActivities');
    const wellnessData = localStorage.getItem('wellness');
    
    if (wellnessData) {
        const data = JSON.parse(wellnessData);
        const activities = data.mindfulness_activities || [];
        
        container.innerHTML = activities.map(activity => `
            <div class="mindfulness-activity">
                <h4>${activity.name}</h4>
                <p>${activity.description}</p>
                <p><strong>Duration:</strong> ${Math.floor(activity.duration / 60)} minutes</p>
                <button class="btn btn-secondary" onclick="startMindfulness('${activity.id}', '${activity.name}')">
                    Start Activity 🧘
                </button>
            </div>
        `).join('');
        console.info(`VERIFY: Mindfulness activities loaded - ${activities.length} activities available`);
    } else {
        container.innerHTML = '<p>Loading mindfulness activities...</p>';
    }
}

// Start mindfulness activity
function startMindfulness(id, name) {
    console.info(`VERIFY: Starting mindfulness activity - ${name} (ID: ${id})`);
    awardPoints(20, `Completed mindfulness: ${name}! 🧘`);
    awardBadge('mindful', '🧘 Mindful', 'Practiced mindfulness exercises', '🧘');
    showNotification(`Great job completing ${name}! 🧘`, 'success');
}

// Load wellness tips
function loadWellnessTips() {
    console.info('VERIFY: Loading wellness tips');
    const container = document.getElementById('wellnessTips');
    const wellnessData = localStorage.getItem('wellness');
    
    if (wellnessData) {
        const data = JSON.parse(wellnessData);
        const tips = data.wellness_tips || [];
        
        // Show random tip
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        if (randomTip) {
            container.innerHTML = `
                <div class="wellness-tip">
                    <h4>💡 Wellness Tip</h4>
                    <p>${randomTip.tip}</p>
                    <small>Category: ${randomTip.category}</small>
                </div>
            `;
            console.info(`VERIFY: Wellness tip loaded - ${randomTip.category}: ${randomTip.tip.substring(0, 50)}...`);
        }
    } else {
        container.innerHTML = '<p>Loading wellness tips...</p>';
    }
}

function updateDateTime() {
    // Update any time-dependent displays immediately and then every minute
    function updateDisplay() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });
        const dateStr = now.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        
        // Update current time displays if they exist
        const timeElements = document.querySelectorAll('.current-time');
        timeElements.forEach(el => el.textContent = timeStr);
        
        const dateElements = document.querySelectorAll('.current-date');
        dateElements.forEach(el => el.textContent = dateStr);
        
        // Update welcome message with time-based greeting
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage && currentUser) {
            const hour = now.getHours();
            let greeting = 'Good evening';
            if (hour < 12) greeting = 'Good morning';
            else if (hour < 17) greeting = 'Good afternoon';
            
            const userName = currentUser.name || currentUser.email.split('@')[0];
            welcomeMessage.textContent = `${greeting}, ${userName}! 🌈`;
        }
    }
    
    updateDisplay();
    setInterval(updateDisplay, 60000); // Update every minute
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('sosModal');
    if (event.target === modal) {
        closeSOS();
    }
};