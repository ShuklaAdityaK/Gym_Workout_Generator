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
            await db.ref('fitness_users/' + cleanEmail).set({ name });
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
            ]},
            {day: 'Day 4 - Full Body Circuit', ex: [
                {n: 'Jumping Jacks', s: '3 sets × 1 min', r: '45s rest', d: 'Cardio warm-up'},
                {n: 'Bodyweight Squats', s: '3 sets × 15 reps', r: '60s rest', d: 'Lower body work'},
                {n: 'Wall Push-ups', s: '3 sets × 12 reps', r: '60s rest', d: 'Upper body engagement'},
                {n: 'Side Plank', s: '3 sets × 15s each', r: '45s rest', d: 'Oblique strength'}
            ]},
            {day: 'Day 5 - Cardio Focus', ex: [
                {n: 'Brisk Walking/Light Jogging', s: '30 min', r: 'Steady pace', d: 'Fat burning zone'},
                {n: 'Step-ups', s: '3 sets × 12 each leg', r: '60s rest', d: 'Leg endurance'},
                {n: 'Russian Twists', s: '3 sets × 20 reps', r: '45s rest', d: 'Core rotation'}
            ]},
            {day: 'Day 6 - Flexibility & Light Activity', ex: [
                {n: 'Yoga Flow', s: '20-30 min', r: 'Continuous', d: 'Flexibility and recovery'},
                {n: 'Walking', s: '20 min', r: 'Easy pace', d: 'Active recovery'}
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
            {day: 'Day 3 - Core & Conditioning', ex: [
                {n: 'Mountain Climbers', s: '4 sets × 40s', r: '30s rest', d: 'Cardio and core'},
                {n: 'Plank to Push-up', s: '4 sets × 10 reps', r: '45s rest', d: 'Core and upper body'},
                {n: 'High Knees', s: '4 sets × 30s', r: '30s rest', d: 'Cardio blast'}
            ]},
            {day: 'Day 4 - Lower Body Power', ex: [
                {n: 'Jump Squats', s: '4 sets × 15 reps', r: '60s rest', d: 'Explosive legs'},
                {n: 'Walking Lunges', s: '4 sets × 12 each', r: '60s rest', d: 'Leg endurance'},
                {n: 'Calf Raises', s: '4 sets × 20 reps', r: '45s rest', d: 'Calf definition'}
            ]},
            {day: 'Day 5 - Upper Body & Abs', ex: [
                {n: 'Push-ups', s: '4 sets × 12-15 reps', r: '60s rest', d: 'Chest and arms'},
                {n: 'Pike Push-ups', s: '3 sets × 10 reps', r: '60s rest', d: 'Shoulder work'},
                {n: 'Bicycle Crunches', s: '4 sets × 25 reps', r: '30s rest', d: 'Ab definition'},
                {n: 'Russian Twists', s: '4 sets × 20 reps', r: '30s rest', d: 'Obliques'}
            ]},
            {day: 'Day 6 - Active Recovery', ex: [
                {n: 'Swimming or Cycling', s: '30-40 min', r: 'Moderate', d: 'Active recovery'},
                {n: 'Stretching', s: '15 min', r: 'Various', d: 'Flexibility work'}
            ]}
        ],
        advanced: [
            {day: 'Day 1 - High Intensity HIIT', ex: [
                {n: 'Sprint Intervals', s: '30 min', r: '45s sprint/15s rest', d: 'Maximum calorie burn'},
                {n: 'Burpee Box Jumps', s: '5 sets × 12-15 reps', r: '30s rest', d: 'Explosive full body'},
                {n: 'Pistol Squats', s: '4 sets × 8-10 each', r: '45s rest', d: 'Advanced leg strength'}
            ]},
            {day: 'Day 2 - Metabolic Conditioning', ex: [
                {n: 'Tabata Training', s: '20 min', r: '20s work/10s rest', d: 'Ultra high intensity'},
                {n: 'Single Leg Burpees', s: '5 sets × 8 each', r: '45s rest', d: 'Unilateral power'},
                {n: 'V-ups', s: '4 sets × 15-20 reps', r: '30s rest', d: 'Advanced core'}
            ]},
            {day: 'Day 3 - Strength & Power', ex: [
                {n: 'Plyometric Push-ups', s: '5 sets × 10 reps', r: '60s rest', d: 'Explosive upper body'},
                {n: 'Box Jumps', s: '5 sets × 12 reps', r: '60s rest', d: 'Explosive leg power'},
                {n: 'Plank Jacks', s: '4 sets × 30s', r: '30s rest', d: 'Core and cardio'}
            ]},
            {day: 'Day 4 - Total Body Burn', ex: [
                {n: 'Burpee Pull-ups', s: '5 sets × 8-10 reps', r: '45s rest', d: 'Full body power'},
                {n: 'Jump Lunges', s: '4 sets × 12 each', r: '45s rest', d: 'Leg explosiveness'},
                {n: 'Dragon Flags', s: '4 sets × 6-8 reps', r: '60s rest', d: 'Elite core strength'}
            ]},
            {day: 'Day 5 - HIIT Circuit', ex: [
                {n: 'Battle Ropes', s: '5 sets × 30s', r: '30s rest', d: 'Full body cardio'},
                {n: 'Turkish Get-ups', s: '4 sets × 6 each', r: '60s rest', d: 'Full body coordination'},
                {n: 'Sprawls', s: '5 sets × 15 reps', r: '30s rest', d: 'Cardio and power'}
            ]},
            {day: 'Day 6 - Active Recovery', ex: [
                {n: 'Mixed Cardio', s: '45 min', r: 'Varied intensity', d: 'Endurance building'},
                {n: 'Mobility Work', s: '20 min', r: 'Various', d: 'Flexibility and recovery'}
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
            ]},
            {day: 'Day 4 - Chest & Arms', ex: [
                {n: 'Wide Push-ups', s: '4 sets × 10-12 reps', r: '90s rest', d: 'Chest width'},
                {n: 'Close-grip Push-ups', s: '3 sets × 10-12 reps', r: '90s rest', d: 'Tricep focus'},
                {n: 'Plank Shoulder Taps', s: '3 sets × 20 reps', r: '60s rest', d: 'Core and shoulders'}
            ]},
            {day: 'Day 5 - Legs & Glutes', ex: [
                {n: 'Bulgarian Split Squats', s: '4 sets × 10 each', r: '90s rest', d: 'Leg development'},
                {n: 'Glute Bridges', s: '4 sets × 15 reps', r: '60s rest', d: 'Glute activation'},
                {n: 'Calf Raises', s: '4 sets × 15-20 reps', r: '60s rest', d: 'Calf building'}
            ]},
            {day: 'Day 6 - Full Body', ex: [
                {n: 'Burpees', s: '3 sets × 10 reps', r: '90s rest', d: 'Total body engagement'},
                {n: 'Pike Push-ups', s: '3 sets × 10 reps', r: '90s rest', d: 'Shoulder work'},
                {n: 'Bodyweight Squats', s: '3 sets × 15 reps', r: '60s rest', d: 'Leg endurance'}
            ]}
        ],
        intermediate: [
            {day: 'Day 1 - Upper Body Push', ex: [
                {n: 'Weighted Push-ups', s: '4 sets × 10-12 reps', r: '90s rest', d: 'Progressive overload'},
                {n: 'Pike Push-ups', s: '4 sets × 12-15 reps', r: '90s rest', d: 'Shoulder mass'},
                {n: 'Tricep Dips', s: '4 sets × 10-12 reps', r: '90s rest', d: 'Tricep development'}
            ]},
            {day: 'Day 2 - Lower Body', ex: [
                {n: 'Bulgarian Split Squats', s: '4 sets × 10 each', r: '90s rest', d: 'Leg growth'},
                {n: 'Nordic Curls', s: '3 sets × 6-8 reps', r: '120s rest', d: 'Hamstring hypertrophy'},
                {n: 'Calf Raises', s: '4 sets × 15-20 reps', r: '60s rest', d: 'Calf development'}
            ]},
            {day: 'Day 3 - Upper Body Pull', ex: [
                {n: 'Pull-ups', s: '4 sets × 8-10 reps', r: '120s rest', d: 'Back width'},
                {n: 'Inverted Rows', s: '4 sets × 10-12 reps', r: '90s rest', d: 'Back thickness'},
                {n: 'Bicep Curls', s: '3 sets × 12-15 reps', r: '60s rest', d: 'Bicep development'}
            ]},
            {day: 'Day 4 - Recovery', ex: [
                {n: 'Light Cardio', s: '25-30 min', r: 'Low intensity', d: 'Recovery work'},
                {n: 'Stretching', s: '15 min', r: 'Various', d: 'Flexibility'}
            ]},
            {day: 'Day 5 - Shoulders & Arms', ex: [
                {n: 'Handstand Hold', s: '4 sets × 20-30s', r: '120s rest', d: 'Shoulder strength'},
                {n: 'Arnold Push-ups', s: '4 sets × 10-12 reps', r: '90s rest', d: 'Shoulder development'},
                {n: 'Diamond Push-ups', s: '3 sets × 10-12 reps', r: '90s rest', d: 'Tricep focus'}
            ]},
            {day: 'Day 6 - Legs & Core', ex: [
                {n: 'Jump Squats', s: '4 sets × 12 reps', r: '90s rest', d: 'Explosive leg power'},
                {n: 'Single Leg RDL', s: '4 sets × 10 each', r: '60s rest', d: 'Hamstring and balance'},
                {n: 'Hanging Leg Raises', s: '4 sets × 10-12 reps', r: '60s rest', d: 'Core strength'}
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
            {day: 'Day 3 - Hypertrophy Upper', ex: [
                {n: 'Archer Push-ups', s: '4 sets × 10 each', r: '90s rest', d: 'Unilateral chest'},
                {n: 'Typewriter Pull-ups', s: '4 sets × 8 reps', r: '120s rest', d: 'Advanced back work'},
                {n: 'Pseudo Planche Push-ups', s: '4 sets × 8-10 reps', r: '90s rest', d: 'Chest and shoulders'}
            ]},
            {day: 'Day 4 - Lower Body Power', ex: [
                {n: 'Weighted Pistol Squats', s: '5 sets × 8 each', r: '120s rest', d: 'Max leg strength'},
                {n: 'Nordic Curls', s: '4 sets × 6-8 reps', r: '120s rest', d: 'Hamstring mass'},
                {n: 'Shrimp Squats', s: '4 sets × 10 each', r: '90s rest', d: 'Quad development'}
            ]},
            {day: 'Day 5 - Skill & Strength', ex: [
                {n: 'Planche Lean Hold', s: '5 sets × 15-20s', r: '120s rest', d: 'Advanced strength'},
                {n: 'Front Lever Progressions', s: '4 sets × 10s', r: '120s rest', d: 'Back and core'},
                {n: 'One Arm Push-up Progressions', s: '4 sets × 6 each', r: '120s rest', d: 'Unilateral power'}
            ]},
            {day: 'Day 6 - Recovery & Mobility', ex: [
                {n: 'Mobility Work', s: '30 min', r: 'Various', d: 'Flexibility and recovery'},
                {n: 'Light Cardio', s: '20 min', r: 'Easy', d: 'Active recovery'}
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
            ]},
            {day: 'Day 4 - Lower Body Focus', ex: [
                {n: 'Squats', s: '3 sets × 15 reps', r: '60s rest', d: 'Leg toning'},
                {n: 'Step-ups', s: '3 sets × 12 each', r: '60s rest', d: 'Glute activation'},
                {n: 'Side Leg Raises', s: '3 sets × 15 each', r: '45s rest', d: 'Hip toning'},
                {n: 'Glute Bridges', s: '3 sets × 15 reps', r: '45s rest', d: 'Glute shaping'}
            ]},
            {day: 'Day 5 - Upper Body & Core', ex: [
                {n: 'Incline Push-ups', s: '3 sets × 12 reps', r: '60s rest', d: 'Chest and arms'},
                {n: 'Plank to Downward Dog', s: '3 sets × 10 reps', r: '45s rest', d: 'Core and shoulders'},
                {n: 'Russian Twists', s: '3 sets × 20 reps', r: '45s rest', d: 'Oblique definition'}
            ]},
            {day: 'Day 6 - Light Activity', ex: [
                {n: 'Walking', s: '30-40 min', r: 'Steady pace', d: 'Light cardio'},
                {n: 'Stretching', s: '15 min', r: 'Various', d: 'Flexibility'}
            ]}
        ],
        intermediate: [
            {day: 'Day 1 - HIIT Circuit', ex: [
                {n: 'Burpees', s: '4 sets × 15 reps', r: '45s rest', d: 'Full body conditioning'},
                {n: 'Jump Squats', s: '4 sets × 12 reps', r: '45s rest', d: 'Explosive leg work'},
                {n: 'Diamond Push-ups', s: '4 sets × 10 reps', r: '60s rest', d: 'Upper body definition'},
                {n: 'Russian Twists', s: '4 sets × 20 reps', r: '30s rest', d: 'Oblique sculpting'}
            ]},
            {day: 'Day 2 - Lower Body Strength', ex: [
                {n: 'Bulgarian Split Squats', s: '4 sets × 10 each', r: '60s rest', d: 'Leg definition'},
                {n: 'Jump Lunges', s: '4 sets × 10 each', r: '60s rest', d: 'Explosive legs'},
                {n: 'Single Leg Glute Bridge', s: '4 sets × 12 each', r: '45s rest', d: 'Glute sculpting'},
                {n: 'Calf Raises', s: '4 sets × 20 reps', r: '45s rest', d: 'Calf definition'}
            ]},
            {day: 'Day 3 - Upper Body & Cardio', ex: [
                {n: 'High Knees', s: '4 sets × 45s', r: '30s rest', d: 'Cardio blast'},
                {n: 'Pike Push-ups', s: '3 sets × 12 reps', r: '60s rest', d: 'Shoulder toning'},
                {n: 'Plank to Push-up', s: '3 sets × 10 reps', r: '45s rest', d: 'Core and arms'},
                {n: 'Tricep Dips', s: '3 sets × 12 reps', r: '60s rest', d: 'Arm definition'}
            ]},
            {day: 'Day 4 - Core & Stability', ex: [
                {n: 'Plank Variations', s: '4 sets × 40s', r: '30s rest', d: 'Core strength'},
                {n: 'Bicycle Crunches', s: '4 sets × 25 reps', r: '30s rest', d: 'Ab definition'},
                {n: 'Mountain Climbers', s: '4 sets × 40s', r: '30s rest', d: 'Cardio and core'},
                {n: 'Side Plank', s: '3 sets × 30s each', r: '45s rest', d: 'Oblique work'}
            ]},
            {day: 'Day 5 - Total Body Conditioning', ex: [
                {n: 'Jumping Jacks', s: '4 sets × 1 min', r: '30s rest', d: 'Cardio warm-up'},
                {n: 'Push-ups', s: '4 sets × 12 reps', r: '60s rest', d: 'Upper body'},
                {n: 'Squats', s: '4 sets × 15 reps', r: '60s rest', d: 'Lower body'},
                {n: 'Burpees', s: '4 sets × 12 reps', r: '45s rest', d: 'Full body burn'}
            ]},
            {day: 'Day 6 - Recovery', ex: [
                {n: 'Light Cardio + Stretch', s: '30 min', r: 'Easy', d: 'Active recovery'},
                {n: 'Yoga Flow', s: '20 min', r: 'Various', d: 'Flexibility'}
            ]}
        ],
        advanced: [
            {day: 'Day 1 - Intense Circuit', ex: [
                {n: 'Burpee Box Jumps', s: '5 sets × 12 reps', r: '30s rest', d: 'Explosive power'},
                {n: 'Pistol Squats', s: '4 sets × 8 each', r: '60s rest', d: 'Unilateral leg work'},
                {n: 'Plyometric Push-ups', s: '4 sets × 10 reps', r: '60s rest', d: 'Explosive upper body'},
                {n: 'V-ups', s: '4 sets × 15 reps', r: '30s rest', d: 'Advanced abs'}
            ]},
            {day: 'Day 2 - Lower Body Power', ex: [
                {n: 'Jump Squats', s: '5 sets × 15 reps', r: '45s rest', d: 'Explosive legs'},
                {n: 'Bulgarian Split Squat Jumps', s: '4 sets × 10 each', r: '60s rest', d: 'Unilateral power'},
                {n: 'Single Leg RDL', s: '4 sets × 12 each', r: '60s rest', d: 'Hamstring focus'},
                {n: 'Box Jumps', s: '4 sets × 12 reps', r: '60s rest', d: 'Explosive leg power'}
            ]},
            {day: 'Day 3 - Metabolic Conditioning', ex: [
                {n: 'Tabata Sprints', s: '20 min', r: '20s/10s protocol', d: 'Maximum intensity'},
                {n: 'Single Leg Burpees', s: '4 sets × 8 each', r: '45s rest', d: 'Unilateral power'},
                {n: 'Archer Push-ups', s: '4 sets × 10 reps', r: '60s rest', d: 'Advanced chest work'},
                {n: 'Dragon Flags', s: '3 sets × 6-8 reps', r: '90s rest', d: 'Elite core'}
            ]},
            {day: 'Day 4 - Upper Body Focus', ex: [
                {n: 'Handstand Push-up Progressions', s: '4 sets × 8 reps', r: '90s rest', d: 'Advanced shoulders'},
                {n: 'Typewriter Push-ups', s: '4 sets × 10 reps', r: '60s rest', d: 'Chest and triceps'},
                {n: 'L-sit Hold', s: '4 sets × 20-30s', r: '60s rest', d: 'Core and shoulders'},
                {n: 'Pike Push-ups', s: '4 sets × 15 reps', r: '60s rest', d: 'Shoulder definition'}
            ]},
            {day: 'Day 5 - Full Body HIIT', ex: [
                {n: 'Burpee Pull-ups', s: '5 sets × 10 reps', r: '45s rest', d: 'Total body power'},
                {n: 'Jump Lunges', s: '4 sets × 12 each', r: '45s rest', d: 'Explosive legs'},
                {n: 'Plyo Push-ups', s: '4 sets × 12 reps', r: '60s rest', d: 'Upper body explosiveness'},
                {n: 'Tuck Jumps', s: '4 sets × 15 reps', r: '45s rest', d: 'Core and legs'}
            ]},
            {day: 'Day 6 - Recovery', ex: [
                {n: 'Mobility & Stretch', s: '40 min', r: 'Various', d: 'Full recovery session'},
                {n: 'Light Cardio', s: '20 min', r: 'Easy pace', d: 'Active recovery'}
            ]}
        ]
    }
};

const dietPlans = {
    loss: {
        beginner: {
            calories: '1500-1800 cal/day',
            meals: [
                {
                    meal: 'Breakfast (7-8 AM)',
                    foods: ['2 boiled eggs + 1 slice whole wheat bread', 'OR Oatmeal (½ cup) with berries and 1 tbsp almond butter', 'Green tea or black coffee'],
                    macros: 'Protein: 20g | Carbs: 30g | Fats: 10g'
                },
                {
                    meal: 'Mid-Morning Snack (10-11 AM)',
                    foods: ['1 apple or banana', '10-12 almonds'],
                    macros: 'Protein: 5g | Carbs: 25g | Fats: 8g'
                },
                {
                    meal: 'Lunch (12-1 PM)',
                    foods: ['Grilled chicken breast (100g) or paneer (100g)', 'Mixed vegetable salad with olive oil dressing', '1 small bowl brown rice or 2 chapatis'],
                    macros: 'Protein: 30g | Carbs: 40g | Fats: 12g'
                },
                {
                    meal: 'Evening Snack (4-5 PM)',
                    foods: ['Greek yogurt (1 cup) or protein shake', 'Handful of mixed nuts'],
                    macros: 'Protein: 15g | Carbs: 15g | Fats: 10g'
                },
                {
                    meal: 'Dinner (7-8 PM)',
                    foods: ['Grilled fish (100g) or dal (1 cup)', 'Steamed vegetables', '1 chapati or small portion quinoa'],
                    macros: 'Protein: 25g | Carbs: 30g | Fats: 10g'
                }
            ],
            tips: ['Drink 2-3 liters of water daily', 'Avoid sugary drinks and processed foods', 'Eat dinner 3 hours before bed']
        },
        intermediate: {
            calories: '1400-1700 cal/day',
            meals: [
                {
                    meal: 'Breakfast (7-8 AM)',
                    foods: ['Scrambled eggs (3 egg whites + 1 whole egg)', 'Spinach and mushrooms sauté', '1 slice whole grain toast'],
                    macros: 'Protein: 25g | Carbs: 25g | Fats: 8g'
                },
                {
                    meal: 'Mid-Morning Snack (10-11 AM)',
                    foods: ['Protein shake with berries', '1 tbsp peanut butter'],
                    macros: 'Protein: 20g | Carbs: 15g | Fats: 8g'
                },
                {
                    meal: 'Lunch (12-1 PM)',
                    foods: ['Grilled chicken (120g) or tofu (150g)', 'Large mixed salad with vinaigrette', '½ cup quinoa or sweet potato'],
                    macros: 'Protein: 35g | Carbs: 35g | Fats: 12g'
                },
                {
                    meal: 'Pre-Workout (3-4 PM)',
                    foods: ['Banana or apple', '10 almonds'],
                    macros: 'Protein: 5g | Carbs: 25g | Fats: 8g'
                },
                {
                    meal: 'Post-Workout (5-6 PM)',
                    foods: ['Whey protein shake', 'Rice cakes or dates'],
                    macros: 'Protein: 25g | Carbs: 20g | Fats: 3g'
                },
                {
                    meal: 'Dinner (7-8 PM)',
                    foods: ['Grilled fish or chicken breast (100g)', 'Steamed broccoli and asparagus', 'Small green salad'],
                    macros: 'Protein: 30g | Carbs: 15g | Fats: 10g'
                }
            ],
            tips: ['Track your calories and macros', 'Intermittent fasting (16:8) optional', 'Meal prep for the week']
        },
        advanced: {
            calories: '1300-1600 cal/day',
            meals: [
                {
                    meal: 'Breakfast (8-9 AM) - Post-Fasted Cardio',
                    foods: ['Egg white omelet (5 whites) with vegetables', 'Avocado (¼)', 'Black coffee'],
                    macros: 'Protein: 25g | Carbs: 15g | Fats: 8g'
                },
                {
                    meal: 'Mid-Morning (11 AM)',
                    foods: ['Protein shake (isolate)', 'Handful of berries'],
                    macros: 'Protein: 25g | Carbs: 15g | Fats: 5g'
                },
                {
                    meal: 'Lunch (1-2 PM)',
                    foods: ['Lean turkey or chicken breast (150g)', 'Mixed greens with lemon', 'Small portion brown rice (¼ cup)'],
                    macros: 'Protein: 40g | Carbs: 25g | Fats: 10g'
                },
                {
                    meal: 'Pre-Workout (3:30 PM)',
                    foods: ['Rice cake with almond butter', 'BCAA drink'],
                    macros: 'Protein: 10g | Carbs: 20g | Fats: 8g'
                },
                {
                    meal: 'Post-Workout (6 PM)',
                    foods: ['Whey isolate shake', 'Fast-digesting carbs (white rice or potato)'],
                    macros: 'Protein: 30g | Carbs: 30g | Fats: 3g'
                },
                {
                    meal: 'Dinner (8 PM)',
                    foods: ['Grilled fish (salmon or tilapia) 120g', 'Large portion steamed vegetables', 'Green tea'],
                    macros: 'Protein: 35g | Carbs: 15g | Fats: 12g'
                }
            ],
            tips: ['Carb cycling: low carb 4 days, high carb 1 day', 'Refeed meal once per week', 'Track everything precisely']
        }
    },
    gain: {
        beginner: {
            calories: '2500-2800 cal/day',
            meals: [
                {
                    meal: 'Breakfast (7-8 AM)',
                    foods: ['4 whole eggs scrambled', 'Oatmeal (1 cup) with banana and honey', 'Whole milk (1 glass)'],
                    macros: 'Protein: 35g | Carbs: 60g | Fats: 25g'
                },
                {
                    meal: 'Mid-Morning Snack (10-11 AM)',
                    foods: ['Peanut butter sandwich (whole wheat)', 'Protein shake with milk'],
                    macros: 'Protein: 30g | Carbs: 45g | Fats: 18g'
                },
                {
                    meal: 'Lunch (12-1 PM)',
                    foods: ['Chicken breast or paneer (150g)', 'Brown rice (1.5 cups)', 'Mixed vegetables', 'Curd (1 cup)'],
                    macros: 'Protein: 45g | Carbs: 70g | Fats: 20g'
                },
                {
                    meal: 'Pre-Workout (3-4 PM)',
                    foods: ['Banana with almond butter', 'Oats (½ cup)'],
                    macros: 'Protein: 10g | Carbs: 50g | Fats: 12g'
                },
                {
                    meal: 'Post-Workout (5-6 PM)',
                    foods: ['Whey protein shake (2 scoops)', 'White rice (1 cup) or sweet potato'],
                    macros: 'Protein: 40g | Carbs: 60g | Fats: 5g'
                },
                {
                    meal: 'Dinner (8-9 PM)',
                    foods: ['Grilled chicken or fish (150g)', 'Quinoa or rice (1 cup)', 'Vegetables', 'Salad with olive oil'],
                    macros: 'Protein: 40g | Carbs: 55g | Fats: 20g'
                },
                {
                    meal: 'Before Bed (10-11 PM)',
                    foods: ['Casein protein shake or Greek yogurt', 'Handful of nuts'],
                    macros: 'Protein: 25g | Carbs: 15g | Fats: 15g'
                }
            ],
            tips: ['Eat every 2-3 hours', 'Never skip meals', 'Focus on calorie surplus']
        },
        intermediate: {
            calories: '2800-3200 cal/day',
            meals: [
                {
                    meal: 'Breakfast (7 AM)',
                    foods: ['5 whole eggs + 2 egg whites', 'Oatmeal (1.5 cups) with berries and nuts', 'Whole milk or protein shake'],
                    macros: 'Protein: 50g | Carbs: 70g | Fats: 30g'
                },
                {
                    meal: 'Mid-Morning (10 AM)',
                    foods: ['Mass gainer shake', 'Whole grain bagel with peanut butter', 'Banana'],
                    macros: 'Protein: 40g | Carbs: 65g | Fats: 20g'
                },
                {
                    meal: 'Lunch (1 PM)',
                    foods: ['Chicken breast or lean beef (200g)', 'Brown rice (2 cups)', 'Vegetables', 'Avocado (½)'],
                    macros: 'Protein: 55g | Carbs: 80g | Fats: 25g'
                },
                {
                    meal: 'Pre-Workout (3:30 PM)',
                    foods: ['Rice cakes with honey', 'Banana', 'Pre-workout supplement'],
                    macros: 'Protein: 10g | Carbs: 60g | Fats: 5g'
                },
                {
                    meal: 'Post-Workout (6 PM)',
                    foods: ['Double scoop whey protein', 'White rice (1.5 cups) or pasta', 'Fruit juice'],
                    macros: 'Protein: 50g | Carbs: 80g | Fats: 5g'
                },
                {
                    meal: 'Dinner (8:30 PM)',
                    foods: ['Salmon or chicken (200g)', 'Sweet potato (large)', 'Vegetables with olive oil', 'Salad'],
                    macros: 'Protein: 50g | Carbs: 60g | Fats: 25g'
                },
                {
                    meal: 'Before Bed (11 PM)',
                    foods: ['Casein protein shake', 'Natural peanut butter (2 tbsp)', 'Oats (½ cup)'],
                    macros: 'Protein: 35g | Carbs: 30g | Fats: 20g'
                }
            ],
            tips: ['Meal prep is essential', 'Adjust calories based on weight gain (0.5kg/week)', 'Stay hydrated - 3-4L water']
        },
        advanced: {
            calories: '3200-3800 cal/day',
            meals: [
                {
                    meal: 'Breakfast (6:30 AM)',
                    foods: ['6 whole eggs + 3 egg whites scrambled', 'Oatmeal (2 cups) with nuts and berries', 'Avocado toast', 'Protein shake'],
                    macros: 'Protein: 65g | Carbs: 90g | Fats: 40g'
                },
                {
                    meal: 'Mid-Morning (9:30 AM)',
                    foods: ['Mass gainer shake (double serving)', 'Whole grain toast with almond butter', '2 bananas'],
                    macros: 'Protein: 50g | Carbs: 85g | Fats: 25g'
                },
                {
                    meal: 'Lunch (12:30 PM)',
                    foods: ['Lean beef or chicken (250g)', 'Brown rice (2.5 cups)', 'Mixed vegetables', 'Olive oil dressing', 'Curd'],
                    macros: 'Protein: 65g | Carbs: 95g | Fats: 30g'
                },
                {
                    meal: 'Pre-Workout (3 PM)',
                    foods: ['White rice (1.5 cups)', 'Chicken breast (100g)', 'Honey (1 tbsp)', 'Pre-workout'],
                    macros: 'Protein: 35g | Carbs: 75g | Fats: 8g'
                },
                {
                    meal: 'Intra-Workout',
                    foods: ['BCAA + Carb drink'],
                    macros: 'Protein: 10g | Carbs: 30g | Fats: 0g'
                },
                {
                    meal: 'Post-Workout (6 PM)',
                    foods: ['Triple scoop whey isolate', 'Dextrose or maltodextrin (60g)', 'Creatine (5g)', 'White rice (2 cups)'],
                    macros: 'Protein: 75g | Carbs: 110g | Fats: 5g'
                },
                {
                    meal: 'Dinner (9 PM)',
                    foods: ['Salmon or steak (250g)', 'Sweet potato (large) or pasta', 'Vegetables with butter', 'Salad with olive oil'],
                    macros: 'Protein: 60g | Carbs: 75g | Fats: 35g'
                },
                {
                    meal: 'Before Bed (11:30 PM)',
                    foods: ['Casein protein (2 scoops)', 'Natural peanut butter (3 tbsp)', 'Oats (1 cup)', 'Whole milk'],
                    macros: 'Protein: 50g | Carbs: 45g | Fats: 30g'
                }
            ],
            tips: ['Aim for 1kg weight gain per month', 'Deload week every 4-6 weeks', 'Monitor body composition weekly']
        }
    },
    tone: {
        beginner: {
            calories: '1800-2000 cal/day',
            meals: [
                {
                    meal: 'Breakfast (7-8 AM)',
                    foods: ['3 egg omelet with vegetables', '1 slice whole wheat toast', 'Greek yogurt with berries'],
                    macros: 'Protein: 28g | Carbs: 35g | Fats: 15g'
                },
                {
                    meal: 'Mid-Morning Snack (10-11 AM)',
                    foods: ['Apple with almond butter', 'Green tea'],
                    macros: 'Protein: 5g | Carbs: 25g | Fats: 10g'
                },
                {
                    meal: 'Lunch (12-1 PM)',
                    foods: ['Grilled chicken (120g) or chickpeas', 'Quinoa (¾ cup)', 'Mixed salad with olive oil', 'Vegetables'],
                    macros: 'Protein: 35g | Carbs: 45g | Fats: 15g'
                },
                {
                    meal: 'Pre-Workout (3-4 PM)',
                    foods: ['Banana', 'Handful of nuts'],
                    macros: 'Protein: 8g | Carbs: 30g | Fats: 10g'
                },
                {
                    meal: 'Post-Workout (5-6 PM)',
                    foods: ['Protein shake', 'Sweet potato (small)'],
                    macros: 'Protein: 25g | Carbs: 30g | Fats: 5g'
                },
                {
                    meal: 'Dinner (7-8 PM)',
                    foods: ['Fish or tofu (120g)', 'Brown rice (½ cup)', 'Steamed vegetables', 'Small salad'],
                    macros: 'Protein: 30g | Carbs: 35g | Fats: 12g'
                }
            ],
            tips: ['Balance protein, carbs, and fats', 'Stay consistent with meal timing', 'Drink plenty of water']
        },
        intermediate: {
            calories: '1900-2100 cal/day',
            meals: [
                {
                    meal: 'Breakfast (7 AM)',
                    foods: ['Scrambled eggs (2 whole + 2 whites)', 'Oatmeal (¾ cup) with protein powder', 'Berries and cinnamon'],
                    macros: 'Protein: 35g | Carbs: 40g | Fats: 15g'
                },
                {
                    meal: 'Mid-Morning (10 AM)',
                    foods: ['Greek yogurt (200g)', 'Mixed nuts (20g)', 'Apple'],
                    macros: 'Protein: 20g | Carbs: 30g | Fats: 12g'
                },
                {
                    meal: 'Lunch (1 PM)',
                    foods: ['Chicken breast or salmon (150g)', 'Brown rice (1 cup)', 'Mixed vegetables', 'Avocado (¼)'],
                    macros: 'Protein: 40g | Carbs: 50g | Fats: 18g'
                },
                {
                    meal: 'Pre-Workout (3:30 PM)',
                    foods: ['Rice cake with honey', 'Banana', 'BCAA'],
                    macros: 'Protein: 10g | Carbs: 40g | Fats: 5g'
                },
                {
                    meal: 'Post-Workout (6 PM)',
                    foods: ['Whey protein shake', 'Sweet potato or white rice (1 cup)'],
                    macros: 'Protein: 30g | Carbs: 45g | Fats: 5g'
                },
                {
                    meal: 'Dinner (8 PM)',
                    foods: ['Turkey or fish (130g)', 'Quinoa (¾ cup)', 'Large portion of vegetables', 'Olive oil drizzle'],
                    macros: 'Protein: 35g | Carbs: 40g | Fats: 15g'
                }
            ],
            tips: ['Adjust carbs based on training intensity', 'Higher carbs on training days', 'Track weekly progress photos']
        },
        advanced: {
            calories: '2000-2200 cal/day',
            meals: [
                {
                    meal: 'Breakfast (7 AM)',
                    foods: ['Egg white omelet (5 whites + 1 whole)', 'Oatmeal (1 cup) with protein', 'Berries', 'Almond butter (1 tbsp)'],
                    macros: 'Protein: 40g | Carbs: 45g | Fats: 15g'
                },
                {
                    meal: 'Mid-Morning (10 AM)',
                    foods: ['Protein shake with greens', 'Rice cakes (2)', 'Almond butter'],
                    macros: 'Protein: 30g | Carbs: 35g | Fats: 12g'
                },
                {
                    meal: 'Lunch (1 PM)',
                    foods: ['Lean chicken or fish (180g)', 'Brown rice or quinoa (1 cup)', 'Large salad with vegetables', 'Olive oil and lemon'],
                    macros: 'Protein: 45g | Carbs: 50g | Fats: 18g'
                },
                {
                    meal: 'Pre-Workout (3:30 PM)',
                    foods: ['White rice (¾ cup)', 'Chicken breast (50g)', 'Banana', 'Pre-workout'],
                    macros: 'Protein: 20g | Carbs: 50g | Fats: 5g'
                },
                {
                    meal: 'Post-Workout (6 PM)',
                    foods: ['Whey isolate (1.5 scoops)', 'Fast-acting carbs (white rice 1.5 cups)', 'Creatine'],
                    macros: 'Protein: 40g | Carbs: 60g | Fats: 5g'
                },
                {
                    meal: 'Dinner (8:30 PM)',
                    foods: ['Grilled salmon or chicken (150g)', 'Roasted sweet potato (small)', 'Large portion steamed vegetables', 'Avocado (¼)'],
                    macros: 'Protein: 40g | Carbs: 40g | Fats: 20g'
                },
                {
                    meal: 'Evening Snack (10 PM - Optional)',
                    foods: ['Casein shake or Greek yogurt', 'Handful of berries'],
                    macros: 'Protein: 25g | Carbs: 15g | Fats: 8g'
                }
            ],
            tips: ['Carb cycling based on training split', 'Refeed day once per week', 'Track macros precisely', 'Adjust based on body response']
        }
    }
};

function displayDiet(diet) {
    if (!diet) return '';
    
    let html = `
        <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin-top: 20px; border-left: 4px solid #0ea5e9;">
            <h4 style="color: #0ea5e9; margin-bottom: 15px;">🍽️ Your Personalized Diet Plan</h4>
            <p style="font-weight: bold; color: #333; margin-bottom: 15px;">Daily Calorie Target: ${diet.calories}</p>
    `;
    
    diet.meals.forEach(meal => {
        html += `
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e0e0e0;">
                <h5 style="color: #0ea5e9; margin-bottom: 10px;">${meal.meal}</h5>
                <ul style="list-style: disc; margin-left: 20px; margin-bottom: 10px; color: #555;">
        `;
        meal.foods.forEach(food => {
            html += `<li style="margin-bottom: 5px;">${food}</li>`;
        });
        html += `
                </ul>
                <p style="font-size: 0.9em; color: #666; font-weight: 500; background: #f8f8f8; padding: 8px; border-radius: 5px;">
                    📊 ${meal.macros}
                </p>
            </div>
        `;
    });
    
    html += `
            <div style="background: #fff8e1; padding: 15px; border-radius: 8px; margin-top: 15px;">
                <h5 style="color: #f59e0b; margin-bottom: 10px;">💡 Diet Tips:</h5>
                <ul style="list-style: none; padding: 0;">
    `;
    diet.tips.forEach(tip => {
        html += `<li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
                    <span style="position: absolute; left: 0;">✓</span> ${tip}
                 </li>`;
    });
    html += `
                </ul>
            </div>
        </div>
    `;
    
    return html;
}

const supplements = {
    loss: {
        beginner: [
            { name: 'Multivitamin', dosage: '1 capsule/day', reason: 'Supports overall health' },
            { name: 'Omega-3', dosage: '1000 mg/day', reason: 'Heart health & fat metabolism' },
            { name: 'Protein Powder (Plant-based or Whey)', dosage: '20g post-workout', reason: 'Maintain lean muscle while losing fat' }
        ],
        intermediate: [
            { name: 'Multivitamin', dosage: '1 capsule/day', reason: 'Fill nutrient gaps' },
            { name: 'Creatine Monohydrate', dosage: '3-5g/day', reason: 'Supports performance during high-intensity workouts' },
            { name: 'Omega-3', dosage: '1000 mg/day', reason: 'Heart health & recovery' },
            { name: 'Protein Powder', dosage: '25-30g post-workout', reason: 'Muscle maintenance' }
        ],
        advanced: [
            { name: 'Creatine Monohydrate', dosage: '5g/day', reason: 'Enhanced strength & performance' },
            { name: 'Protein Powder', dosage: '30-40g post-workout', reason: 'Muscle preservation during calorie deficit' },
            { name: 'Multivitamin', dosage: '1 capsule/day', reason: 'Supports overall health' },
            { name: 'Omega-3', dosage: '1000-2000 mg/day', reason: 'Inflammation control & recovery' }
        ]
    },
    gain: {
        beginner: [
            { name: 'Protein Powder', dosage: '20g post-workout', reason: 'Supports muscle building' },
            { name: 'Creatine Monohydrate', dosage: '3g/day', reason: 'Strength & energy' },
            { name: 'Multivitamin', dosage: '1 capsule/day', reason: 'Overall nutrition' }
        ],
        intermediate: [
            { name: 'Protein Powder', dosage: '25-30g post-workout', reason: 'Muscle repair & growth' },
            { name: 'Creatine Monohydrate', dosage: '5g/day', reason: 'Supports strength & performance' },
            { name: 'Omega-3', dosage: '1000 mg/day', reason: 'Recovery & joint health' },
            { name: 'Multivitamin', dosage: '1 capsule/day', reason: 'Nutrient support' }
        ],
        advanced: [
            { name: 'Protein Powder', dosage: '30-40g post-workout', reason: 'Maximize muscle protein synthesis' },
            { name: 'Creatine Monohydrate', dosage: '5g/day', reason: 'Strength & power' },
            { name: 'Omega-3', dosage: '1000-2000 mg/day', reason: 'Recovery & anti-inflammatory' },
            { name: 'Multivitamin', dosage: '1 capsule/day', reason: 'Complete nutrition' },
            { name: 'Vitamin D', dosage: '1000-2000 IU/day', reason: 'Bone health & hormone regulation' }
        ]
    },
    tone: {
        beginner: [
            { name: 'Protein Powder', dosage: '15-20g post-workout', reason: 'Support lean muscle' },
            { name: 'Multivitamin', dosage: '1 capsule/day', reason: 'Overall health' },
            { name: 'Omega-3', dosage: '1000 mg/day', reason: 'Supports recovery & fat metabolism' }
        ],
        intermediate: [
            { name: 'Protein Powder', dosage: '20-25g post-workout', reason: 'Muscle preservation & tone' },
            { name: 'Creatine Monohydrate', dosage: '3-5g/day', reason: 'Improve strength & endurance' },
            { name: 'Omega-3', dosage: '1000 mg/day', reason: 'Recovery & joint health' },
            { name: 'Multivitamin', dosage: '1 capsule/day', reason: 'Fill nutritional gaps' }
        ],
        advanced: [
            { name: 'Protein Powder', dosage: '25-30g post-workout', reason: 'Maintain lean muscle' },
            { name: 'Creatine Monohydrate', dosage: '5g/day', reason: 'Enhanced performance' },
            { name: 'Omega-3', dosage: '1000-2000 mg/day', reason: 'Recovery & anti-inflammatory' },
            { name: 'Multivitamin', dosage: '1 capsule/day', reason: 'Overall health' },
            { name: 'Vitamin D', dosage: '1000-2000 IU/day', reason: 'Bone & muscle health' }
        ]
    }
};

function displaySupplements(supplements) {
    if (!supplements || supplements.length === 0) return '';
    
    let html = `
        <div style="background: #fff4e6; padding: 20px; border-radius: 10px; margin-top: 20px; border-left: 4px solid #ff9800;">
            <h4 style="color: #ff9800; margin-bottom: 15px;">💊 Recommended Supplements</h4>
            <ul style="list-style: none; padding: 0;">
    `;
    supplements.forEach(supp => {
        html += `
            <li style="margin-bottom: 12px; padding: 10px; background: white; border-radius: 5px;">
                <strong style="color: #333;">${supp.name}</strong> - ${supp.dosage}
                <br><span style="font-size: 0.9em; color: #666;">${supp.reason}</span>
            </li>
        `;
    });
    html += '</ul></div>';
    return html;
}

document.getElementById('workoutForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const weight = document.getElementById('weight').value;
    const goal = document.getElementById('goal').value;
    const level = document.getElementById('level').value;

    const plan = workouts[goal]?.[level] || workouts.loss.beginner;
    const supplementPlan = supplements[goal]?.[level] || supplements.loss.beginner;
    const dietPlan = dietPlans[goal]?.[level] || dietPlans.loss.beginner;
    
    await DB.savePlan(currentUser.email, { 
        weight, 
        goal, 
        level, 
        plan,
        supplements: supplementPlan,
        diet: dietPlan
    });
    
    displayPlan(plan, goal, level, weight, supplementPlan, dietPlan);
});

function displayPlan(plan, goal, level, weight, supplementPlan, dietPlan) {
    let html = `
        <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #667eea;">
            <h3 style="color: #667eea; margin-bottom: 15px;">📊 Your 6-Day Plan Summary</h3>
            <p><strong>Goal:</strong> ${goal === 'loss' ? 'Weight Loss' : goal === 'gain' ? 'Muscle Gain' : 'Toned Body'}</p>
            <p><strong>Level:</strong> ${level.charAt(0).toUpperCase() + level.slice(1)}</p>
            <p><strong>Weight:</strong> ${weight} kg</p>
            <p style="margin-top: 10px; color: #666; font-style: italic;">This is a 6-day per week training program designed to maximize your results!</p>
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

    // Add diet plan
    if (dietPlan) {
        html += displayDiet(dietPlan);
    }

    // Add supplements
    if (supplementPlan && supplementPlan.length > 0) {
        html += displaySupplements(supplementPlan);
    }

    html += `
        <div style="background: #e7f3ff; padding: 20px; border-radius: 10px; margin-top: 20px; border-left: 4px solid #0066cc;">
            <h4 style="color: #0066cc; margin-bottom: 10px;">💡 Important Tips for 6-Day Training</h4>
            <ul style="margin-left: 20px; color: #333;">
                <li style="margin-bottom: 8px;"><strong>Consistency:</strong> Stick to your 6-day plan for 8-12 weeks for best results</li>
                <li style="margin-bottom: 8px;"><strong>Progressive Overload:</strong> Gradually increase difficulty each week</li>
                <li style="margin-bottom: 8px;"><strong>Recovery:</strong> Sunday is your complete rest day - use it wisely!</li>
                <li style="margin-bottom: 8px;"><strong>Nutrition:</strong> Follow your diet plan - proper nutrition is 70% of results</li>
                <li style="margin-bottom: 8px;"><strong>Sleep:</strong> Get 7-9 hours of quality sleep daily for optimal recovery</li>
                <li style="margin-bottom: 8px;"><strong>Hydration:</strong> Drink 2.5-3 liters of water per day</li>
                <li style="margin-bottom: 8px;"><strong>Listen to Your Body:</strong> If you feel overtrained, take an extra rest day</li>
            </ul>
        </div>
    `;

    document.getElementById('planContent').innerHTML = html;
    document.getElementById('results').classList.add('active');
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    // After displaying the plan, initialize tracker
    tracker.init(currentUser.email, weight, plan);
}

async function loadSavedPlan() {
    const saved = await DB.getPlan(currentUser.email);
    if (saved) {
        document.getElementById('weight').value = saved.weight;
        document.getElementById('goal').value = saved.goal;
        document.getElementById('level').value = saved.level;
        displayPlan(saved.plan, saved.goal, saved.level, saved.weight, saved.supplements, saved.diet);
    }
}

function showAlert(msg, type = 'success') {
    const box = document.getElementById('alertBox');
    box.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
    setTimeout(() => box.innerHTML = '', 2000);
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
        const user = await DB.getUser(email);
        if (user && user.pass === pass) {
            currentUser = { name: user.name, email };
            showAlert('✅ Welcome back, ' + user.name + '!');
            setTimeout(showMainPage, 1000);
        } else {
            showAlert('❌ Invalid email or password!', 'error');
        }
    } else {
        if (!name) {
            showAlert('❌ Please enter your name!', 'error');
            return;
        }
        if (pass.length < 6) {
            showAlert('❌ Password must be at least 6 characters!', 'error');
            return;
        }
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

// Initialize database
DB.init();