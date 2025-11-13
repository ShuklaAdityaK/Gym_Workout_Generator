// tracker.js - Progress Tracker Module for Fitness nGo

class ProgressTracker {
    constructor() {
        this.weightChart = null;
        this.completionChart = null;
        this.weeklyChart = null;
        this.progressData = {
            completedDays: [],
            weightHistory: [],
            startWeight: 0,
            currentWeight: 0,
            weeklyProgress: [],
            streak: 0
        };
    }

    // Initialize tracker after user generates workout plan
    async init(userEmail, startWeight, workoutPlan) {
        this.userEmail = userEmail;
        this.workoutPlan = workoutPlan;
        
        // Load existing progress or initialize new
        await this.loadProgress();
        
        if (this.progressData.startWeight === 0) {
            this.progressData.startWeight = startWeight;
            this.progressData.currentWeight = startWeight;
            this.progressData.weightHistory = [{
                date: new Date().toLocaleDateString(),
                weight: startWeight,
                week: 0
            }];
        }
        
        // Show the "See Your Progress" button
        document.getElementById('progressBtn').classList.remove('hidden');
        
        // Save initial data
        await this.saveProgress();
    }

    // Show tracker page
    showTracker() {
        // Hide main page
        document.getElementById('mainPage').classList.add('hidden');
        
        // Show tracker page
        document.getElementById('trackerPage').classList.remove('hidden');
        
        // Generate workout days if not already generated
        if (document.getElementById('workoutDays').children.length === 0) {
            this.generateWorkoutDays();
        }
        
        // Initialize charts if not already initialized
        if (!this.weightChart || !this.completionChart) {
            this.initCharts();
        }
        
        // Update stats and charts
        this.updateStats();
        this.updateCharts();
    }

    // Go back to main page
    backToMain() {
        document.getElementById('trackerPage').classList.add('hidden');
        document.getElementById('mainPage').classList.remove('hidden');
    }

    // Load progress from Firebase
    async loadProgress() {
        try {
            const cleanEmail = this.userEmail.replace(/\./g, "_");
            const snapshot = await db.ref('progress/' + cleanEmail).once('value');
            if (snapshot.exists()) {
                this.progressData = snapshot.val();
            }
        } catch (error) {
            console.error("Error loading progress:", error);
        }
    }

    // Save progress to Firebase
    async saveProgress() {
        try {
            const cleanEmail = this.userEmail.replace(/\./g, "_");
            await db.ref('progress/' + cleanEmail).set(this.progressData);
            return true;
        } catch (error) {
            console.error("Error saving progress:", error);
            return false;
        }
    }

    // Generate 36 days of workouts (6 weeks × 6 days)
    generateWorkoutDays() {
        const workoutGrid = document.getElementById('workoutDays');
        workoutGrid.innerHTML = '';
        
        // Generate 6 weeks
        for (let week = 1; week <= 6; week++) {
            for (let day = 0; day < 6; day++) {
                const dayNumber = (week - 1) * 6 + day + 1;
                const workout = this.workoutPlan[day % this.workoutPlan.length];
                const isCompleted = this.progressData.completedDays.includes(dayNumber);
                
                const dayCard = document.createElement('div');
                dayCard.className = `day-card ${isCompleted ? 'completed' : ''}`;
                dayCard.id = `day-${dayNumber}`;
                
                // Extract exercise names from workout.ex array
                const exerciseList = workout.ex.map(exercise => `<li>• ${exercise.n} - ${exercise.s}</li>`).join('');
                
                dayCard.innerHTML = `
                    <div class="day-header">
                        <h3>Week ${week} - Day ${day + 1}</h3>
                        <button class="complete-btn" onclick="tracker.toggleDay(${dayNumber})" data-day="${dayNumber}">
                            ${isCompleted ? '✓ Completed' : 'Mark Complete'}
                        </button>
                    </div>
                    <h4 style="margin-bottom: 10px; color: ${isCompleted ? 'white' : '#667eea'};">${workout.day}</h4>
                    <ul class="exercise-list">
                        ${exerciseList}
                    </ul>
                `;
                workoutGrid.appendChild(dayCard);
            }
            
            // Add rest day card after each week
            const restCard = document.createElement('div');
            restCard.className = 'day-card';
            restCard.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
            restCard.style.color = 'white';
            restCard.innerHTML = `
                <div class="day-header">
                    <h3>Week ${week} - Rest Day</h3>
                    <span style="font-size: 2em;">🌟</span>
                </div>
                <h4 style="margin-bottom: 10px; color: white;">Complete Rest & Recovery</h4>
                <ul class="exercise-list">
                    <li>• Full day of rest</li>
                    <li>• Light stretching (optional)</li>
                    <li>• Focus on nutrition & hydration</li>
                    <li>• Prepare for next week</li>
                </ul>
            `;
            workoutGrid.appendChild(restCard);
        }
    }

    // Toggle day completion
    async toggleDay(dayNumber) {
        const index = this.progressData.completedDays.indexOf(dayNumber);
        
        if (index > -1) {
            // Remove completion
            this.progressData.completedDays.splice(index, 1);
        } else {
            // Add completion
            this.progressData.completedDays.push(dayNumber);
            this.progressData.completedDays.sort((a, b) => a - b);
        }
        
        // Update weekly progress
        this.updateWeeklyProgress();
        
        // Calculate streak
        this.calculateStreak();
        
        // Update UI
        const dayCard = document.getElementById(`day-${dayNumber}`);
        const button = dayCard.querySelector('.complete-btn');
        
        if (index > -1) {
            dayCard.classList.remove('completed');
            button.textContent = 'Mark Complete';
        } else {
            dayCard.classList.add('completed');
            button.textContent = '✓ Completed';
        }
        
        // Update stats and charts
        this.updateStats();
        this.updateCharts();
        
        // Save progress
        await this.saveProgress();
    }

    // Calculate current streak
    calculateStreak() {
        if (this.progressData.completedDays.length === 0) {
            this.progressData.streak = 0;
            return;
        }
        
        const sortedDays = [...this.progressData.completedDays].sort((a, b) => b - a);
        let streak = 1;
        
        for (let i = 0; i < sortedDays.length - 1; i++) {
            if (sortedDays[i] - sortedDays[i + 1] === 1) {
                streak++;
            } else {
                break;
            }
        }
        
        this.progressData.streak = streak;
    }

    // Update weekly progress
    updateWeeklyProgress() {
        this.progressData.weeklyProgress = [];
        
        for (let week = 1; week <= 6; week++) {
            const weekStart = (week - 1) * 6 + 1;
            const weekEnd = week * 6;
            const completed = this.progressData.completedDays.filter(
                day => day >= weekStart && day <= weekEnd
            ).length;
            
            this.progressData.weeklyProgress.push({
                week: week,
                completed: completed,
                total: 6
            });
        }
    }

    // Update statistics display
    updateStats() {
        const completed = this.progressData.completedDays.length;
        const total = 36;
        const percentage = Math.round((completed / total) * 100);
        
        document.getElementById('completedDays').textContent = completed;
        document.getElementById('totalDays').textContent = total;
        document.getElementById('progressPercent').textContent = percentage + '%';
        document.getElementById('streakDays').textContent = this.progressData.streak;
        
        // Update progress bar
        const progressBar = document.getElementById('progressBar');
        progressBar.style.width = percentage + '%';
        progressBar.textContent = percentage + '%';
        
        // Update weight stats if available
        if (this.progressData.weightHistory.length > 0) {
            document.getElementById('weightStats').style.display = 'block';
            document.getElementById('startWeight').textContent = this.progressData.startWeight;
            document.getElementById('currentWeightDisplay').textContent = this.progressData.currentWeight;
            
            const change = (this.progressData.currentWeight - this.progressData.startWeight).toFixed(1);
            const changeEl = document.getElementById('weightChange');
            changeEl.textContent = (change > 0 ? '+' : '') + change;
            changeEl.style.color = change < 0 ? '#28a745' : change > 0 ? '#dc3545' : '#666';
        }
    }

    // Initialize charts
    initCharts() {
        this.createWeightChart();
        this.createCompletionChart();
    }

    // Create weight progress chart
    createWeightChart() {
        const ctx = document.getElementById('weightChart').getContext('2d');
        
        if (this.weightChart) {
            this.weightChart.destroy();
        }
        
        const labels = this.progressData.weightHistory.map(h => h.date);
        const data = this.progressData.weightHistory.map(h => h.weight);
        
        this.weightChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Weight (kg)',
                    data: data,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return value + ' kg';
                            }
                        }
                    }
                }
            }
        });
    }

    // Create completion chart
    createCompletionChart() {
        const ctx = document.getElementById('completionChart').getContext('2d');
        
        if (this.completionChart) {
            this.completionChart.destroy();
        }
        
        const completed = this.progressData.completedDays.length;
        const remaining = 36 - completed;
        
        this.completionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Remaining'],
                datasets: [{
                    data: [completed, remaining],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(224, 224, 224, 0.5)'
                    ],
                    borderColor: [
                        '#667eea',
                        '#e0e0e0'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const percentage = ((value / 36) * 100).toFixed(1);
                                return label + ': ' + value + ' days (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }

    // Update charts
    updateCharts() {
        this.createWeightChart();
        this.createCompletionChart();
    }

    // Update weight
    async updateWeight() {
        const weightInput = document.getElementById('currentWeight');
        const newWeight = parseFloat(weightInput.value);
        
        if (!newWeight || newWeight < 30 || newWeight > 300) {
            alert('Please enter a valid weight between 30 and 300 kg');
            return;
        }
        
        // Calculate current week
        const currentWeek = Math.floor(this.progressData.completedDays.length / 6);
        
        // Add to weight history
        this.progressData.weightHistory.push({
            date: new Date().toLocaleDateString(),
            weight: newWeight,
            week: currentWeek
        });
        
        this.progressData.currentWeight = newWeight;
        
        // Update UI
        this.updateStats();
        this.updateCharts();
        
        // Save progress
        await this.saveProgress();
        
        // Clear input and show success
        weightInput.value = '';
        alert('Weight updated successfully! 📊');
    }
}

// Create global instance
const tracker = new ProgressTracker();

// Make functions globally accessible
function updateWeight() {
    tracker.updateWeight();
}

function showTrackerPage() {
    tracker.showTracker();
}

function backToMainPage() {
    tracker.backToMain();
}