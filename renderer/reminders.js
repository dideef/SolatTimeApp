const activityInput = document.getElementById('activityInput');
const timeInput = document.getElementById('timeInput');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const editIndexInput = document.getElementById('editIndex');
const crudMsg = document.getElementById('crudMsg');
const reminderList = document.getElementById('reminderList');

// Key used for localStorage
const STORAGE_KEY = 'solatTimeReminders';

// Load and display reminders when page opens
document.addEventListener('DOMContentLoaded', displayReminders);

// CREATE or UPDATE Reminder
saveBtn.addEventListener('click', () => {
    const activity = activityInput.value.trim();
    const time = timeInput.value.trim();
    const editIndex = parseInt(editIndexInput.value);

    // Input validation
    if (!activity || !time) {
        crudMsg.textContent = 'Please fill in both activity name and time.';
        crudMsg.style.color = 'red';
        return;
    }

    let reminders = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    if (editIndex === -1) {
        // CREATE: Add new reminder
        reminders.push({ activity, time });
        crudMsg.textContent = 'Reminder added successfully!';
    } else {
        // UPDATE: Modify existing reminder
        reminders[editIndex] = { activity, time };
        crudMsg.textContent = 'Reminder updated successfully!';
        
        // Reset form back to Create mode
        editIndexInput.value = -1;
        saveBtn.textContent = 'Add Reminder';
        cancelBtn.style.display = 'none';
    }

    // Save back to Local Storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));

    // Clear inputs and refresh list
    activityInput.value = '';
    timeInput.value = '';
    crudMsg.style.color = 'green';
    displayReminders();
});

// READ: Display all reminders from Local Storage
function displayReminders() {
    const reminders = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    reminderList.innerHTML = '';

    if (reminders.length === 0) {
        reminderList.innerHTML = '<li>No reminders saved yet.</li>';
        return;
    }

    reminders.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${item.activity}</strong> at ${item.time}
            <span style="float: right;">
                <button onclick="editReminder(${index})" style="background-color: #f39c12; padding: 3px 8px; margin-right: 5px;">Edit</button>
                <button onclick="deleteReminder(${index})" style="background-color: #e74c3c; padding: 3px 8px;">Delete</button>
            </span>
        `;
        reminderList.appendChild(li);
    });
}

// UPDATE (Prepare form for editing)
window.editReminder = function(index) {
    const reminders = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const item = reminders[index];

    activityInput.value = item.activity;
    timeInput.value = item.time;
    editIndexInput.value = index;

    saveBtn.textContent = 'Update Reminder';
    cancelBtn.style.display = 'inline-block';
    crudMsg.textContent = 'Editing reminder...';
    crudMsg.style.color = '#f39c12';
};

// Cancel Edit Mode
cancelBtn.addEventListener('click', () => {
    activityInput.value = '';
    timeInput.value = '';
    editIndexInput.value = -1;
    saveBtn.textContent = 'Add Reminder';
    cancelBtn.style.display = 'none';
    crudMsg.textContent = '';
});

// DELETE: Remove reminder from Local Storage
window.deleteReminder = function(index) {
    let reminders = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    reminders.splice(index, 1);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    displayReminders();

    crudMsg.textContent = 'Reminder deleted successfully!';
    crudMsg.style.color = 'red';
};