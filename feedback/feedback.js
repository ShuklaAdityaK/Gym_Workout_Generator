// Feedback form submit handler
document.getElementById('feedbackForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('fbName').value.trim();
    const email = document.getElementById('fbEmail').value.trim().toLowerCase();
    const message = document.getElementById('fbMessage').value.trim();
    const alertBox = document.getElementById('feedbackAlert');

    if (!name || !email || !message) return;

    try {
        const timestamp = Date.now();
        await db.ref('feedbacks/' + timestamp).set({ name, email, message });
        alertBox.innerHTML = `<div class="alert alert-success">✅ Thank you for your feedback!</div>`;
        document.getElementById('feedbackForm').reset();
    } catch (error) {
        console.error("Error saving feedback:", error);
        alertBox.innerHTML = `<div class="alert alert-error">❌ Failed to send feedback. Try again!</div>`;
    }

    setTimeout(() => alertBox.innerHTML = '', 4000);
});
