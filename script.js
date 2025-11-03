// Database with persistent storage
// Firebase-based database functions
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDUW5mcDLVSU7V2kdE3nJ1L-sy4AA4T5jM",
    authDomain: "database-of-user.firebaseapp.com",
    databaseURL: "https://database-of-user-default-rtdb.firebaseio.com",
    projectId: "database-of-user",
    storageBucket: "database-of-user.firebasestorage.app",
    messagingSenderId: "550599351455",
    appId: "1:550599351455:web:60cc81091c24dfd8b9d6aa",
    measurementId: "G-QXL7N8MV6Z"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

const DB = {
    async init() {
        this.users = {};
    },

    async saveUser(email, name, pass) {
        try {
            const cleanEmail = email.replace(/\./g, "_");
            await db.ref('fitness_users/' + cleanEmail).set({ name, pass });
            return true;
        } catch (error) {
            console.error("Error saving user:", error);
            return false;
        }
    },

    async getUser(email) {
        try {
            const cleanEmail = email.replace(/\./g, "_");
            const snapshot = await db.ref('fitness_users/' + cleanEmail).once('value');
            return snapshot.exists() ? snapshot.val() : null;
        } catch (error) {
            console.error("Error getting user:", error);
            return null;
        }
    },

    async savePlan(email, plan) {
        try {
            const cleanEmail = email.replace(/\./g, "_");
            await db.ref('plans/' + cleanEmail).set(plan);
            return true;
        } catch (error) {
            console.error("Error saving plan:", error);
            return false;
        }
    },

    async getPlan(email) {
        try {
            const cleanEmail = email.replace(/\./g, "_");
            const snapshot = await db.ref('plans/' + cleanEmail).once('value');
            return snapshot.exists() ? snapshot.val() : null;
        } catch (error) {
            console.error("Error fetching plan:", error);
            return null;
        }
    }
};


let isLogin = true;
let currentUser = null;

const workouts = {
    loss: {
        beginner: [
            {day: 'Day 1 - Cardio & Lower Body', ex: [
                {n: 'Brisk Walking', s: '25-30 min', r: 'Continuous', d: 'Warm-up cardio to burn calories'},
                {n: 'Bodyweight Squats', s: '3 sets × 12-15 reps', r: '60s rest', d: 'Build leg strength and boost metabolism'},
                {n: 'Lunges', s: '3 sets × 10 each leg', r: '60s rest', d: 'Leg toning and balance'},
                {n: 'Plank Hold', s: '3 sets × 20-30s', r: '45s rest', d: 'Core stability'}
            ]},
            {day: 'Day 2 - Upper Body & Core', ex: [
                {n: 'Light Jogging', s: '20 min', r: 'Moderate pace', d: 'Cardio for fat loss'},
                {n: 'Incline Push-ups', s: '3 sets × 10-12 reps', r: '60s rest', d: 'Upper body strength'},
                {n: 'Bicycle Crunches', s: '3 sets × 15-20 reps', r: '45s rest', d: 'Ab definition'},
                {n: 'Mountain Climbers', s: '3 sets × 20s', r: '45s rest', d: 'Cardio and core'}
            ]},
            {day: 'Day 3 - Active Recovery', ex: [
                {n: 'Walking or Cycling', s: '30 min', r: 'Easy pace', d: 'Low impact recovery cardio'}
            ]}
        ],
        intermediate: [
            {day: 'Day 1 - HIIT Training', ex: [
                {n: 'HIIT Running', s: '25 min', r: '30s sprint/30s walk', d: 'High intensity fat burning'},
                {n: 'Burpees', s: '4 sets × 10-15 reps', r: '45s rest', d: 'Full body explosive movement'},
                {n: 'Jump Squats', s: '4 sets × 12-15 reps', r: '45s rest', d: 'Explosive leg power'}
            ]},
            {day: 'Day 2 - Strength & Cardio', ex: [
                {n: 'Jump Rope', s: '20 min', r: 'Intervals', d: 'Intense cardio workout'},
                {n: 'Bulgarian Split Squats', s: '4 sets × 10 each', r: '60s rest', d: 'Advanced leg sculpting'},
                {n: 'Diamond Push-ups', s: '4 sets × 8-12 reps', r: '60s rest', d: 'Tricep focus'}
            ]},
            {day: 'Day 3 - Recovery', ex: [
                {n: 'Swimming or Cycling', s: '30-40 min', r: 'Moderate', d: 'Active recovery'}
            ]}
        ],
        advanced: [
            {day: 'Day 1 - High Intensity', ex: [
                {n: 'Sprint Intervals', s: '30 min', r: '45s sprint/15s rest', d: 'Maximum calorie burn'},
                {n: 'Burpee Box Jumps', s: '5 sets × 12-15 reps', r: '30s rest', d: 'Explosive full body'},
                {n: 'Pistol Squats', s: '4 sets × 8-10 each', r: '45s rest', d: 'Advanced leg strength'}
            ]},
            {day: 'Day 2 - Metabolic Conditioning', ex: [
                {n: 'Tabata Training', s: '20 min', r: '20s work/10s rest', d: 'Ultra high intensity'},
                {n: 'Single Leg Burpees', s: '5 sets × 8 each', r: '45s rest', d: 'Unilateral power'},
                {n: 'V-ups', s: '4 sets × 15-20 reps', r: '30s rest', d: 'Advanced core'}
            ]},
            {day: 'Day 3 - Recovery', ex: [
                {n: 'Mixed Cardio', s: '45 min', r: 'Varied intensity', d: 'Endurance building'}
            ]}
        ]
    },
    gain: {
        beginner: [
            {day: 'Day 1 - Push & Legs', ex: [
                {n: 'Push-ups', s: '4 sets × 8-12 reps', r: '90s rest', d: 'Build chest and triceps'},
                {n: 'Bodyweight Squats', s: '4 sets × 12-15 reps', r: '90s rest', d: 'Leg mass foundation'},
                {n: 'Pike Push-ups', s: '3 sets × 8-10 reps', r: '90s rest', d: 'Shoulder development'}
            ]},
            {day: 'Day 2 - Pull & Core', ex: [
                {n: 'Inverted Rows', s: '4 sets × 8-10 reps', r: '90s rest', d: 'Back thickness'},
                {n: 'Lunges', s: '3 sets × 10 each leg', r: '90s rest', d: 'Leg development'},
                {n: 'Tricep Dips', s: '3 sets × 8-12 reps', r: '90s rest', d: 'Arm mass building'}
            ]},
            {day: 'Day 3 - Recovery', ex: [
                {n: 'Light Walking', s: '20-30 min', r: 'Easy pace', d: 'Active recovery'}
            ]}
        ],
        intermediate: [
            {day: 'Day 1 - Upper Body', ex: [
                {n: 'Weighted Push-ups', s: '4 sets × 10-12 reps', r: '90s rest', d: 'Progressive overload'},
                {n: 'Pull-ups', s: '4 sets × 8-10 reps', r: '120s rest', d: 'Back width'},
                {n: 'Pike Push-ups', s: '4 sets × 12-15 reps', r: '90s rest', d: 'Shoulder mass'}
            ]},
            {day: 'Day 2 - Lower Body', ex: [
                {n: 'Bulgarian Split Squats', s: '4 sets × 10 each', r: '90s rest', d: 'Leg growth'},
                {n: 'Nordic Curls', s: '3 sets × 6-8 reps', r: '120s rest', d: 'Hamstring hypertrophy'},
                {n: 'Calf Raises', s: '4 sets × 15-20 reps', r: '60s rest', d: 'Calf development'}
            ]},
            {day: 'Day 3 - Recovery', ex: [
                {n: 'Light Cardio', s: '25-30 min', r: 'Low intensity', d: 'Recovery work'}
            ]}
        ],
        advanced: [
            {day: 'Day 1 - Heavy Push', ex: [
                {n: 'Weighted Dips', s: '5 sets × 8-10 reps', r: '120s rest', d: 'Chest and tricep mass'},
                {n: 'Handstand Push-ups', s: '4 sets × 8-12 reps', r: '120s rest', d: 'Shoulder power'},
                {n: 'Diamond Push-ups', s: '4 sets × 12-15 reps', r: '90s rest', d: 'Tricep focus'}
            ]},
            {day: 'Day 2 - Heavy Pull & Legs', ex: [
                {n: 'Weighted Pull-ups', s: '5 sets × 6-8 reps', r: '150s rest', d: 'Back mass'},
                {n: 'Pistol Squats', s: '4 sets × 10 each', r: '120s rest', d: 'Leg strength'},
                {n: 'Single Leg RDL', s: '4 sets × 12 each', r: '90s rest', d: 'Hamstring focus'}
            ]},
            {day: 'Day 3 - Recovery', ex: [
                {n: 'Mobility Work', s: '30 min', r: 'Various', d: 'Flexibility and recovery'}
            ]}
        ]
    },
    tone: {
        beginner: [
            {day: 'Day 1 - Full Body Circuit', ex: [
                {n: 'Jumping Jacks', s: '3 sets × 1 min', r: '45s rest', d: 'Cardio warm-up'},
                {n: 'Bodyweight Squats', s: '3 sets × 15 reps', r: '60s rest', d: 'Lower body toning'},
                {n: 'Push-ups', s: '3 sets × 10-12 reps', r: '60s rest', d: 'Upper body definition'},
                {n: 'Plank', s: '3 sets × 30s', r: '45s rest', d: 'Core stability'}
            ]},
            {day: 'Day 2 - Cardio & Abs', ex: [
                {n: 'Mountain Climbers', s: '3 sets × 30s', r: '45s rest', d: 'Cardio and core'},
                {n: 'Lunges', s: '3 sets × 12 each', r: '60s rest', d: 'Leg sculpting'},
                {n: 'Bicycle Crunches', s: '3 sets × 20 reps', r: '45s rest', d: 'Ab definition'},
                {n: 'Burpees', s: '3 sets × 10 reps', r: '60s rest', d: 'Full body burn'}
            ]},
            {day: 'Day 3 - Active Recovery', ex: [
                {n: 'Yoga or Stretching', s: '30 min', r: 'Flow', d: 'Flexibility and recovery'}
            ]}
        ],
        intermediate: [
            {day: 'Day 1 - HIIT Circuit', ex: [
                {n: 'Burpees', s: '4 sets × 15 reps', r: '45s rest', d: 'Full body conditioning'},
                {n: 'Jump Squats', s: '4 sets × 12 reps', r: '45s rest', d: 'Explosive leg work'},
                {n: 'Diamond Push-ups', s: '4 sets × 10 reps', r: '60s rest', d: 'Upper body definition'},
                {n: 'Russian Twists', s: '4 sets × 20 reps', r: '30s rest', d: 'Oblique sculpting'}
            ]},
            {day: 'Day 2 - Strength & Cardio', ex: [
                {n: 'High Knees', s: '4 sets × 45s', r: '30s rest', d: 'Cardio blast'},
                {n: 'Bulgarian Split Squats', s: '4 sets × 10 each', r: '60s rest', d: 'Leg definition'},
                {n: 'Pike Push-ups', s: '3 sets × 12 reps', r: '60s rest', d: 'Shoulder toning'},
                {n: 'Plank to Push-up', s: '3 sets × 10 reps', r: '45s rest', d: 'Core and arms'}
            ]},
            {day: 'Day 3 - Recovery', ex: [
                {n: 'Light Cardio + Stretch', s: '30 min', r: 'Easy', d: 'Active recovery'}
            ]}
        ],
        advanced: [
            {day: 'Day 1 - Intense Circuit', ex: [
                {n: 'Burpee Box Jumps', s: '5 sets × 12 reps', r: '30s rest', d: 'Explosive power'},
                {n: 'Pistol Squats', s: '4 sets × 8 each', r: '60s rest', d: 'Unilateral leg work'},
                {n: 'Plyometric Push-ups', s: '4 sets × 10 reps', r: '60s rest', d: 'Explosive upper body'},
                {n: 'V-ups', s: '4 sets × 15 reps', r: '30s rest', d: 'Advanced abs'}
            ]},
            {day: 'Day 2 - Metabolic', ex: [
                {n: 'Tabata Sprints', s: '20 min', r: '20s/10s protocol', d: 'Maximum intensity'},
                {n: 'Single Leg Burpees', s: '4 sets × 8 each', r: '45s rest', d: 'Unilateral power'},
                {n: 'Archer Push-ups', s: '4 sets × 10 reps', r: '60s rest', d: 'Advanced chest work'},
                {n: 'Dragon Flags', s: '3 sets × 6-8 reps', r: '90s rest', d: 'Elite core'}
            ]},
            {day: 'Day 3 - Recovery', ex: [
                {n: 'Mobility & Stretch', s: '40 min', r: 'Various', d: 'Full recovery session'}
            ]}
        ]
    }
};

function showAlert(msg, type = 'success') {
    const box = document.getElementById('alertBox');
    box.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
    setTimeout(() => box.innerHTML = '', 4000);
}

function toggleAuthMode() {
    isLogin = !isLogin;
    const title = document.getElementById('authTitle');
    const btn = document.getElementById('authBtn');
    const nameGrp = document.getElementById('nameGroup');
    const toggleSpan = document.querySelector('.toggle-auth span');
    
    if (isLogin) {
        title.textContent = 'Welcome Back!';
        btn.textContent = 'Login';
        toggleSpan.innerHTML = "Don't have an account? <a id='toggleLink'>Sign Up</a>";
        nameGrp.style.display = 'none';
        document.getElementById('userName').removeAttribute('required');
    } else {
        title.textContent = 'Join Fitness nGo';
        btn.textContent = 'Sign Up';
        toggleSpan.innerHTML = "Already have an account? <a id='toggleLink'>Login</a>";
        nameGrp.style.display = 'block';
        document.getElementById('userName').setAttribute('required', '');
    }
    
    document.getElementById('alertBox').innerHTML = '';
    document.getElementById('toggleLink').addEventListener('click', toggleAuthMode);
}

document.getElementById('toggleLink').addEventListener('click', toggleAuthMode);

document.getElementById('authForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('userEmail').value.trim().toLowerCase();
    const pass = document.getElementById('userPass').value;
    const name = document.getElementById('userName').value.trim();

    if (isLogin) {
        // LOGIN - Fetch user from Firebase
        const user = await DB.getUser(email);
        if (user && user.pass === pass) {
            currentUser = { name: user.name, email };
            showAlert('✅ Welcome back, ' + user.name + '!');
            setTimeout(showMainPage, 1000);
        } else {
            showAlert('❌ Invalid email or password!', 'error');
        }
    } else {
        // SIGNUP
        if (!name) {
            showAlert('❌ Please enter your name!', 'error');
            return;
        }
        if (pass.length < 6) {
            showAlert('❌ Password must be at least 6 characters!', 'error');
            return;
        }
        // Check if user already exists in Firebase
        const existingUser = await DB.getUser(email);
        if (existingUser) {
            showAlert('❌ Account already exists! Please login.', 'error');
        } else {
            await DB.saveUser(email, name, pass);
            currentUser = { name, email };
            showAlert('✅ Account created! Welcome, ' + name + '!');
            setTimeout(showMainPage, 1000);
        }
    }
});

function showMainPage() {
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('mainPage').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    document.getElementById('subtitle').textContent = `Welcome, ${currentUser.name}! 👋`;
    document.getElementById('authForm').reset();
    loadSavedPlan();
}

document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        document.getElementById('authPage').classList.remove('hidden');
        document.getElementById('mainPage').classList.add('hidden');
        document.getElementById('logoutBtn').classList.add('hidden');
        document.getElementById('subtitle').textContent = 'Your Personalized Workout Journey';
        document.getElementById('results').classList.remove('active');
        document.getElementById('workoutForm').reset();
    }
});

document.getElementById('workoutForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const weight = document.getElementById('weight').value;
    const goal = document.getElementById('goal').value;
    const level = document.getElementById('level').value;

    const plan = workouts[goal]?.[level] || workouts.loss.beginner;
    
    await DB.savePlan(currentUser.email, { weight, goal, level, plan });
    
    displayPlan(plan, goal, level, weight);
});

function displayPlan(plan, goal, level, weight) {
    let html = `
        <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #667eea;">
            <h3 style="color: #667eea; margin-bottom: 15px;">📊 Your Plan Summary</h3>
            <p><strong>Goal:</strong> ${goal === 'loss' ? 'Weight Loss' : goal === 'gain' ? 'Muscle Gain' : 'Toned Body'}</p>
            <p><strong>Level:</strong> ${level.charAt(0).toUpperCase() + level.slice(1)}</p>
            <p><strong>Weight:</strong> ${weight} kg</p>
        </div>
    `;

    plan.forEach(day => {
        html += `<div class="workout-day"><h3>${day.day}</h3>`;
        day.ex.forEach(ex => {
            html += `
                <div class="exercise">
                    <h4>${ex.n}</h4>
                    <p><strong>Sets/Duration:</strong> ${ex.s}</p>
                    <p><strong>Rest:</strong> ${ex.r}</p>
                    <p style="margin-top: 8px; font-style: italic;">${ex.d}</p>
                </div>
            `;
        });
        html += '</div>';
    });

    html += `
        <div style="background: #e7f3ff; padding: 20px; border-radius: 10px; margin-top: 20px; border-left: 4px solid #0066cc;">
            <h4 style="color: #0066cc; margin-bottom: 10px;">💡 Important Tips</h4>
            <ul style="margin-left: 20px; color: #333;">
                <li style="margin-bottom: 8px;"><strong>Consistency:</strong> Stick to your plan for 8-12 weeks</li>
                <li style="margin-bottom: 8px;"><strong>Progressive Overload:</strong> Gradually increase difficulty each week</li>
                <li style="margin-bottom: 8px;"><strong>Nutrition:</strong> Eat according to your goals</li>
                <li style="margin-bottom: 8px;"><strong>Rest:</strong> Get 7-9 hours of sleep daily</li>
                <li style="margin-bottom: 8px;"><strong>Hydration:</strong> Drink 2-3 liters of water per day</li>
            </ul>
        </div>
    `;

    document.getElementById('planContent').innerHTML = html;
    document.getElementById('results').classList.add('active');
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

async function loadSavedPlan() {
    const saved = await DB.getPlan(currentUser.email);
    if (saved) {
        document.getElementById('weight').value = saved.weight;
        document.getElementById('goal').value = saved.goal;
        document.getElementById('level').value = saved.level;
        displayPlan(saved.plan, saved.goal, saved.level, saved.weight);
    }
}

// Initialize database
DB.init();