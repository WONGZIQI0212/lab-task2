// Global state: stores all task objects and tracks the next unique ID
let tasks  = [];  // all task objects live here
let nextId = 1;   // increments each time a new task is created

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