// Global state: stores all task objects and tracks the next unique ID
let tasks  = [];  // all task objects live here
let nextId = 1;   // increments each time a new task is created

let editingTaskId = null; // null = adding new task; number = editing existing
let activeColumn  = null; // which column's Add Task button was clicked

// ── createTaskCard(taskObj) ───────────────────────────────────────────────
// Builds a complete <li> card using only DOM
// Returns the finished <li> element
function createTaskCard(taskObj) {

  // Outer card: eg. <li data-id="1" data-priority="high" class="task-card">
  const li = document.createElement('li');
  li.setAttribute('data-id', taskObj.id);           // used to find this card later
  li.setAttribute('data-priority', taskObj.priority); // used by priority filter
  li.classList.add('task-card');

  // Title: eg. <span class="task-title">Buy groceries</span>
  const titleSpan = document.createElement('span');
  titleSpan.classList.add('task-title');
  titleSpan.textContent = taskObj.title; 

  // Description: eg. <p class="task-desc">Get milk and eggs</p>
  const descP = document.createElement('p');
  descP.classList.add('task-desc');
  descP.textContent = taskObj.description;

  // Priority badge: class name drives colour
  // eg. class="priority-badge priority-high" → red background
  const badge = document.createElement('span');
  badge.classList.add('priority-badge', 'priority-' + taskObj.priority);
  badge.textContent = taskObj.priority.charAt(0).toUpperCase() + taskObj.priority.slice(1);

  // Due date: eg. <span class="task-due">Due: 2025-12-01</span>
  const dueSpan = document.createElement('span');
  dueSpan.classList.add('task-due');
  dueSpan.textContent = taskObj.due ? 'Due: ' + taskObj.due : '';

  // Action buttons wrapper: eg. <div class="card-actions">
  const actions = document.createElement('div');
  actions.classList.add('card-actions');

  // Edit button: data-action and data-id are read by event delegation
  const editBtn = document.createElement('button');
  editBtn.setAttribute('data-action', 'edit');
  editBtn.setAttribute('data-id', taskObj.id);
  editBtn.textContent = 'Edit';

  // Delete button: same data attributes, different action value
  const deleteBtn = document.createElement('button');
  deleteBtn.setAttribute('data-action', 'delete');
  deleteBtn.setAttribute('data-id', taskObj.id);
  deleteBtn.textContent = 'Delete';

  // Assemble: buttons → actions div → li
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  li.appendChild(titleSpan);
  li.appendChild(descP);
  li.appendChild(badge);
  li.appendChild(dueSpan);
  li.appendChild(actions);

  return li; // caller(addTask) insert this into DOM
}

// ── addTask(columnId, taskObj) ────────────────────────────────────────────
function addTask(columnId, taskObj) {

  // Find the <ul class="task-list"> inside the target column by its id
  // e.g. columnId = 'todo' → selects <ul> inside <section id="todo">
  const list = document.querySelector('#' + columnId + ' .task-list');

  // Create a task card using the task data
  const card = createTaskCard(taskObj);

  // Add the new task card to the end of the list
  list.appendChild(card);

  // Add this task to the tasks array (so data stays updated)
  tasks.push(taskObj);

  // Refresh the counter badge in the header
  updateCounter();
}

// ── updateCounter() ───────────────────────────────────────────────────────
// Reads tasks.length (Updates the number of tasks shown in the header)
function updateCounter() {
  const countEl = document.getElementById('task-count');
  // Show total tasks and add "s" if more than 1
  countEl.textContent = tasks.length + ' task' + (tasks.length !== 1 ? 's' : '');
}

// ── deleteTask(taskId) ────────────────────────────────────────────────────
function deleteTask(taskId) {

  // Find the task card <li> that has the same data-id as taskId
  const card = document.querySelector('[data-id="' + taskId + '"]');
  if (!card) return; // If the task is not found, stop the function

  // Add fade-out class → trigger fadeOut animation
  card.classList.add('fade-out');

  // Wait for the animation to finish bfore doing anything else
  card.addEventListener('animationend', function () {
    card.remove();                                    // removes the task <li> from the DOM
    tasks = tasks.filter(t => t.id !== taskId);      // removes from array
    updateCounter();                                  // refresh badge=update ctr
  });
}

// ── editTask(taskId) ──────────────────────────────────────────────────────
function editTask(taskId) {

  // Find the task object in array by its id
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  // Store the id: use to call updateTask
  editingTaskId = taskId;

  // Pre-fill every modal field with the task's current values
  document.getElementById('task-title').value    = task.title;
  document.getElementById('task-desc').value     = task.description;
  document.getElementById('task-priority').value = task.priority;
  document.getElementById('task-due').value      = task.due;

  // Show the modal by removing the hidden class
  document.getElementById('modal').classList.remove('hidden');
}